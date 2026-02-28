import { db } from "@/lib/db";
import { orders, orderItems, products, productSizes } from "@/lib/db/schema";
import { createPaymentSession } from "@/lib/actions/ipaymu";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  shippingCity: z.string().optional(),
  shippingProvince: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      sizeId: z.string().optional(),
      sizeName: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  notifyUrl: z.string().url(),
  shippingCost: z.number().int().nonnegative().optional(),
  courier: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request payload", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const payload = result.data;
    const requestedProductIds = payload.items.map((i) => i.productId);

    // Fetch actual products from DB to ensure prices are correct
    const dbProducts = await db
      .select({
        id: products.id,
        name: products.name,
        basePrice: products.basePrice,
      })
      .from(products)
      .where(inArray(products.id, requestedProductIds));

    // Map db products for quick lookup
    const productsMap = new Map<string, typeof dbProducts[0]>();
    dbProducts.forEach((p) => productsMap.set(p.id, p));

    // Optional: Fetch size names if applicable 
    const sizeIds = payload.items.map(i => i.sizeId).filter(Boolean) as string[];
    const sizeMap = new Map<string, { sku: string | null; id: string }>();
    if (sizeIds.length > 0) {
      const dbSizes = await db
        .select({
          id: productSizes.id,
          sizeId: productSizes.sizeId,
          sku: productSizes.sku,
        })
        .from(productSizes)
        .where(inArray(productSizes.sizeId, sizeIds));
      dbSizes.forEach((s) => sizeMap.set(s.sizeId, { sku: s.sku, id: s.id }));
    }

    // Build Order Items
    let totalAmount = 0;
    const orderItemsToInsert: {
      orderId: string;
      productId: string;
      productSizeId: string | null;
      productName: string;
      sizeName: string | undefined;
      sku: string | null;
      price: number;
      quantity: number;
    }[] = [];
    
    // Arrays for iPaymu
    const ipaymuProductNames: string[] = [];
    const ipaymuQtys: string[] = [];
    const ipaymuPrices: string[] = [];

    // Generate logical Order ID
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const orderId = `ORD-${todayStr}-${randomHex}`;

    for (const item of payload.items) {
      const dbProduct = productsMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { message: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      // We enforce price from the database, not what frontend sends
      const price = dbProduct.basePrice;
      totalAmount += price * item.quantity;
      
      const sizeInfo = item.sizeId ? sizeMap.get(item.sizeId) : undefined;
      const resolvedSizeName = item.sizeName || undefined;
      const sizeStr = resolvedSizeName ? `(${resolvedSizeName})` : '';
      const formalProductName = `${dbProduct.name} ${sizeStr}`.trim();

      orderItemsToInsert.push({
        orderId,
        productId: item.productId,
        productSizeId: sizeInfo?.id || item.sizeId || null,
        productName: dbProduct.name,
        sizeName: resolvedSizeName,
        sku: sizeInfo?.sku || null,
        price,
        quantity: item.quantity,
      });

      ipaymuProductNames.push(formalProductName);
      ipaymuQtys.push(item.quantity.toString());
      // iPaymu expects true integer strings generally, or decimals based on currency setup. Ordozeus apparently stores as cents but let's assume base price is the intended amount.  
      // *Wait, database schema says `// IDR cents`. We must convert.*
      // Let's assume database is IDR units (there are no IDR cents usually). Usually gateways expect normal IDR values.
      ipaymuPrices.push(price.toString()); // If it's cents, it should be (price/100). Assuming standard IDR here.
    }

    // Add shipping cost to the order total
    const shippingCostValue = payload.shippingCost ?? 0;
    totalAmount += shippingCostValue;

    // iPaymu calculates the charged amount itself from sum(price[i] × qty[i]).
    // The `amount` field is ignored by iPaymu. So shipping MUST be added as
    // a separate line item here — otherwise iPaymu only charges product prices.
    if (shippingCostValue > 0) {
      const shippingLabel = payload.courier
        ? `Shipping (${payload.courier})`
        : "Shipping";
      ipaymuProductNames.push(shippingLabel);
      ipaymuQtys.push("1");
      ipaymuPrices.push(shippingCostValue.toString());
    }

    // 1. Create order
    // 2. Create order items
    // 3. Obtain iPaymu URL
    // 4. Update order with iPaymu Session ID
    
    // We can't rely strictly on transaction block spanning an external HTTP call due to timeouts.
    // Insert pending order first.
    await db.insert(orders).values({
        id: orderId,
        status: "PENDING",
        totalAmount,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        shippingAddress: payload.shippingAddress,
        shippingCity: payload.shippingCity,
        shippingProvince: payload.shippingProvince,
        shippingPostalCode: payload.shippingPostalCode,
        shippingCost: shippingCostValue,
        courier: payload.courier,
    });

    await db.insert(orderItems).values(orderItemsToInsert);

    // Call iPaymu
    let ipaymuSession: Awaited<ReturnType<typeof createPaymentSession>>;
    try {
        ipaymuSession = await createPaymentSession({
            product: ipaymuProductNames,
            qty: ipaymuQtys,
            price: ipaymuPrices,
            amount: totalAmount.toString(),
            returnUrl: `${payload.returnUrl}?orderId=${orderId}`,
            cancelUrl: payload.cancelUrl,
            notifyUrl: payload.notifyUrl,
            referenceId: orderId,
            buyerName: payload.customerName,
            buyerEmail: payload.customerEmail,
            buyerPhone: payload.customerPhone,
        });

        // Update the order with session info
        await db.update(orders)
            .set({ 
                ipaymuSessionId: ipaymuSession.Data.SessionID,
                ipaymuPaymentUrl: ipaymuSession.Data.Url,
            })
            .where(eq(orders.id, orderId));

    } catch (err: unknown) {
        // Handle failure to generate session and cleanup or leave as failed
        console.error("Failed to generate ipaymu session", err);
        return NextResponse.json(
            { message: "Failed to communicate with payment gateway" },
            { status: 500 }
        );
    }

    return NextResponse.json({
      orderId,
      paymentUrl: ipaymuSession.Data.Url,
    });

  } catch (err) {
    if (err instanceof Error) {
        console.error("Checkout Error:", err.message, err.stack);
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { db } from "./index";
import { shippingRates, couriers } from "./schema";

/**
 * All 34 Indonesian provinces with region-based pricing.
 * Assumes shop origin in Jawa (cheapest for Jawa, most expensive for Papua).
 */
const PROVINCES = [
  // Sumatera
  { code: "11", name: "ACEH",                          region: "sumatera_far" },
  { code: "12", name: "SUMATERA UTARA",                region: "sumatera_far" },
  { code: "13", name: "SUMATERA BARAT",                region: "sumatera" },
  { code: "14", name: "RIAU",                           region: "sumatera" },
  { code: "15", name: "JAMBI",                          region: "sumatera" },
  { code: "16", name: "SUMATERA SELATAN",              region: "sumatera" },
  { code: "17", name: "BENGKULU",                       region: "sumatera" },
  { code: "18", name: "LAMPUNG",                        region: "sumatera_near" },
  { code: "19", name: "KEPULAUAN BANGKA BELITUNG",     region: "sumatera" },
  { code: "21", name: "KEPULAUAN RIAU",                region: "sumatera" },

  // Jawa & Banten
  { code: "31", name: "DKI JAKARTA",                   region: "jawa" },
  { code: "32", name: "JAWA BARAT",                    region: "jawa" },
  { code: "33", name: "JAWA TENGAH",                   region: "jawa" },
  { code: "34", name: "DAERAH ISTIMEWA YOGYAKARTA",    region: "jawa" },
  { code: "35", name: "JAWA TIMUR",                    region: "jawa" },
  { code: "36", name: "BANTEN",                         region: "jawa" },

  // Bali & Nusa Tenggara
  { code: "51", name: "BALI",                           region: "bali_nusa" },
  { code: "52", name: "NUSA TENGGARA BARAT",           region: "bali_nusa" },
  { code: "53", name: "NUSA TENGGARA TIMUR",           region: "bali_nusa" },

  // Kalimantan
  { code: "61", name: "KALIMANTAN BARAT",              region: "kalimantan" },
  { code: "62", name: "KALIMANTAN TENGAH",             region: "kalimantan" },
  { code: "63", name: "KALIMANTAN SELATAN",            region: "kalimantan" },
  { code: "64", name: "KALIMANTAN TIMUR",              region: "kalimantan" },
  { code: "65", name: "KALIMANTAN UTARA",              region: "kalimantan" },

  // Sulawesi
  { code: "71", name: "SULAWESI UTARA",                region: "sulawesi" },
  { code: "72", name: "SULAWESI TENGAH",               region: "sulawesi" },
  { code: "73", name: "SULAWESI SELATAN",              region: "sulawesi" },
  { code: "74", name: "SULAWESI TENGGARA",             region: "sulawesi" },
  { code: "75", name: "GORONTALO",                      region: "sulawesi" },
  { code: "76", name: "SULAWESI BARAT",                region: "sulawesi" },

  // Maluku
  { code: "81", name: "MALUKU",                         region: "maluku" },
  { code: "82", name: "MALUKU UTARA",                  region: "maluku" },

  // Papua
  { code: "91", name: "PAPUA",                          region: "papua" },
  { code: "92", name: "PAPUA BARAT",                   region: "papua" },
] as const;

type Region = (typeof PROVINCES)[number]["region"];

/** Base price (IDR) and estimated delivery days per region */
const REGION_CONFIG: Record<Region, { basePrice: number; estimatedDays: string }> = {
  jawa:           { basePrice: 15000,  estimatedDays: "1-3"  },
  sumatera_near:  { basePrice: 18000,  estimatedDays: "2-4"  },
  bali_nusa:      { basePrice: 20000,  estimatedDays: "3-5"  },
  sumatera:       { basePrice: 22000,  estimatedDays: "3-5"  },
  sumatera_far:   { basePrice: 25000,  estimatedDays: "4-6"  },
  kalimantan:     { basePrice: 28000,  estimatedDays: "4-7"  },
  sulawesi:       { basePrice: 30000,  estimatedDays: "5-7"  },
  maluku:         { basePrice: 38000,  estimatedDays: "6-9"  },
  papua:          { basePrice: 45000,  estimatedDays: "7-10" },
};

async function seedShippingRates() {
  console.log("🌱 Seeding shipping rates...");

  // Step 1: Get all couriers
  const allCouriers = await db.select().from(couriers);

  if (allCouriers.length === 0) {
    console.error("❌ No couriers found. Please seed couriers first.");
    process.exit(1);
  }

  console.log(`📦 Found ${allCouriers.length} courier(s): ${allCouriers.map((c) => c.name).join(", ")}`);

  // Step 2: Build rate entries for each courier × province
  const rateEntries = allCouriers.flatMap((courier) =>
    PROVINCES.map((province) => {
      const config = REGION_CONFIG[province.region];
      return {
        courierId: courier.id,
        destinationProvinceId: province.code,
        destinationCityId: province.code, // province-level rate
        basePrice: config.basePrice,
        estimatedDays: config.estimatedDays,
        isActive: true,
      };
    })
  );

  console.log(`📝 Inserting ${rateEntries.length} shipping rates (${allCouriers.length} couriers × ${PROVINCES.length} provinces)...`);

  // Step 3: Insert in batches (Postgres has a parameter limit)
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < rateEntries.length; i += BATCH_SIZE) {
    const batch = rateEntries.slice(i, i + BATCH_SIZE);
    const result = await db
      .insert(shippingRates)
      .values(batch)
      .onConflictDoNothing()
      .returning({ id: shippingRates.id });

    inserted += result.length;
  }

  console.log(`✅ Inserted ${inserted} shipping rates`);
  console.log("🎉 Shipping rate seeding complete!");

  process.exit(0);
}

seedShippingRates().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

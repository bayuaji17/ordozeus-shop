import { db } from "./index";
import { sizeTypes, sizes } from "./schema";

/**
 * Seed size types and sizes.
 * Size types are inserted FIRST, then sizes reference them.
 * Uses onConflictDoNothing() so it's safe to re-run.
 */
async function seedSizes() {
  console.log("🌱 Seeding size types...");

  // Step 1: Insert size types first
  const sizeTypeData = [
    { name: "Clothing", sortOrder: 0 },
    { name: "Shoes", sortOrder: 1 },
    { name: "Accessories", sortOrder: 2 },
  ];

  const insertedSizeTypes = await db
    .insert(sizeTypes)
    .values(sizeTypeData)
    .onConflictDoNothing({ target: sizeTypes.name })
    .returning({ id: sizeTypes.id, name: sizeTypes.name });

  // Build a map of size type name -> id (fetch all if some already existed)
  let sizeTypeMap: Record<string, string> = {};

  if (insertedSizeTypes.length > 0) {
    sizeTypeMap = Object.fromEntries(
      insertedSizeTypes.map((st) => [st.name, st.id])
    );
  }

  // If some size types already existed, fetch them from DB
  if (Object.keys(sizeTypeMap).length < sizeTypeData.length) {
    const allSizeTypes = await db.select().from(sizeTypes);
    sizeTypeMap = Object.fromEntries(
      allSizeTypes.map((st) => [st.name, st.id])
    );
  }

  console.log(
    `✅ Size types ready: ${Object.keys(sizeTypeMap).join(", ")}`
  );

  // Step 2: Insert sizes (referencing size types)
  console.log("🌱 Seeding sizes...");

  const sizeData = [
    // Clothing sizes
    { name: "XS", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 0 },
    { name: "S", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 1 },
    { name: "M", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 2 },
    { name: "L", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 3 },
    { name: "XL", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 4 },
    { name: "XXL", sizeTypeId: sizeTypeMap["Clothing"], sortOrder: 5 },

    // Shoe sizes
    { name: "38", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 0 },
    { name: "39", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 1 },
    { name: "40", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 2 },
    { name: "41", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 3 },
    { name: "42", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 4 },
    { name: "43", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 5 },
    { name: "44", sizeTypeId: sizeTypeMap["Shoes"], sortOrder: 6 },

    // Accessory sizes
    { name: "One Size", sizeTypeId: sizeTypeMap["Accessories"], sortOrder: 0 },
    { name: "S/M", sizeTypeId: sizeTypeMap["Accessories"], sortOrder: 1 },
    { name: "L/XL", sizeTypeId: sizeTypeMap["Accessories"], sortOrder: 2 },
  ];

  const insertedSizes = await db
    .insert(sizes)
    .values(sizeData)
    .onConflictDoNothing()
    .returning({ id: sizes.id, name: sizes.name });

  console.log(`✅ Inserted ${insertedSizes.length} sizes`);
  console.log("🎉 Size seeding complete!");

  process.exit(0);
}

seedSizes().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

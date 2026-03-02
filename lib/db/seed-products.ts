import { db } from "./index";
import { products, productCategories, productSizes, categories, sizes, sizeTypes } from "./schema";
import { eq } from "drizzle-orm";

// ============================================================================
// PRODUCT TEMPLATES PER CATEGORY
// ============================================================================

interface ProductTemplate {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  isFeatured: boolean;
  sizeType: "Clothing" | "Shoes" | "Accessories";
}

const MAN_PRODUCTS: ProductTemplate[] = [
  { name: "Classic Cotton T-Shirt", slug: "classic-cotton-tshirt", description: "Premium combed cotton tee with a relaxed fit and reinforced crew neckline. Gets softer with every wash.", basePrice: 199000, isFeatured: true, sizeType: "Clothing" },
  { name: "Slim Fit Chinos", slug: "slim-fit-chinos", description: "Stretch cotton-twill chinos with a modern tapered leg and clean flat-front design.", basePrice: 349000, isFeatured: true, sizeType: "Clothing" },
  { name: "Canvas Sneakers", slug: "canvas-sneakers", description: "Minimalist low-top sneakers with durable cotton canvas upper and vulcanized rubber sole.", basePrice: 429000, isFeatured: false, sizeType: "Shoes" },
  { name: "Oxford Button-Down Shirt", slug: "oxford-button-down-shirt", description: "Classic Oxford cloth button-down in brushed cotton. A timeless piece for smart-casual styling.", basePrice: 289000, isFeatured: true, sizeType: "Clothing" },
  { name: "Heavyweight Hoodie", slug: "heavyweight-hoodie", description: "450gsm French terry hoodie with kangaroo pocket and ribbed cuffs. Built for warmth and durability.", basePrice: 399000, isFeatured: true, sizeType: "Clothing" },
  { name: "Cargo Jogger Pants", slug: "cargo-jogger-pants", description: "Relaxed-fit joggers with cargo pockets and elasticated waist. Made from ripstop cotton blend.", basePrice: 329000, isFeatured: false, sizeType: "Clothing" },
  { name: "Leather Belt", slug: "leather-belt-man", description: "Full-grain Italian leather belt with brushed nickel buckle. Develops a rich patina over time.", basePrice: 249000, isFeatured: false, sizeType: "Accessories" },
  { name: "Performance Polo Shirt", slug: "performance-polo-shirt", description: "Moisture-wicking polo in piqué knit fabric with a modern slim fit. Perfect for active days.", basePrice: 259000, isFeatured: false, sizeType: "Clothing" },
  { name: "Denim Jacket", slug: "denim-jacket-man", description: "Washed indigo denim jacket with brass buttons and dual chest pockets. A wardrobe staple.", basePrice: 479000, isFeatured: true, sizeType: "Clothing" },
  { name: "Linen Shorts", slug: "linen-shorts", description: "Lightweight linen-blend shorts with drawstring waist. Breathable and relaxed for warm days.", basePrice: 229000, isFeatured: false, sizeType: "Clothing" },
  { name: "Suede Desert Boots", slug: "suede-desert-boots", description: "Classic Clarks-inspired desert boots in soft suede with crepe rubber sole.", basePrice: 549000, isFeatured: false, sizeType: "Shoes" },
  { name: "Wool Blend Overcoat", slug: "wool-blend-overcoat", description: "Tailored single-breasted overcoat in a wool-polyester blend. Fully lined with notch lapels.", basePrice: 899000, isFeatured: false, sizeType: "Clothing" },
  { name: "Athletic Running Shoes", slug: "athletic-running-shoes", description: "Lightweight mesh running shoes with EVA midsole cushioning and rubber outsole grip.", basePrice: 499000, isFeatured: false, sizeType: "Shoes" },
  { name: "Ribbed Crew Socks 3-Pack", slug: "ribbed-crew-socks-3pack", description: "Set of three combed cotton crew socks with reinforced heel and toe.", basePrice: 89000, isFeatured: false, sizeType: "Accessories" },
  { name: "Structured Baseball Cap", slug: "structured-baseball-cap", description: "Six-panel structured cap in brushed twill cotton with adjustable snapback closure.", basePrice: 129000, isFeatured: false, sizeType: "Accessories" },
  { name: "Quilted Vest", slug: "quilted-vest-man", description: "Lightweight quilted vest with synthetic fill. Ideal as a mid-layer or standalone piece.", basePrice: 359000, isFeatured: false, sizeType: "Clothing" },
  { name: "Graphic Print Tee", slug: "graphic-print-tee-man", description: "Screen-printed graphic tee on 180gsm cotton jersey. Bold design meets everyday comfort.", basePrice: 179000, isFeatured: false, sizeType: "Clothing" },
  { name: "Tailored Blazer", slug: "tailored-blazer-man", description: "Unstructured blazer in a linen-cotton blend. Half-lined for breathability and a modern silhouette.", basePrice: 649000, isFeatured: false, sizeType: "Clothing" },
  { name: "Swim Trunks", slug: "swim-trunks", description: "Quick-dry swim trunks with mesh lining and elastic waist. Side pockets with drain eyelets.", basePrice: 199000, isFeatured: false, sizeType: "Clothing" },
  { name: "Leather Loafers", slug: "leather-loafers-man", description: "Penny loafers in polished calfskin leather with Blake-stitched leather sole.", basePrice: 699000, isFeatured: false, sizeType: "Shoes" },
];

const WOMAN_PRODUCTS: ProductTemplate[] = [
  { name: "Elegant Wrap Dress", slug: "elegant-wrap-dress", description: "Flattering wrap silhouette in flowing crepe fabric with adjustable tie waist and midi-length hem.", basePrice: 459000, isFeatured: true, sizeType: "Clothing" },
  { name: "Leather Crossbody Bag", slug: "leather-crossbody-bag", description: "Full-grain vegetable-tanned leather bag with adjustable strap and magnetic flap closure.", basePrice: 599000, isFeatured: true, sizeType: "Accessories" },
  { name: "Silk Scarf", slug: "silk-scarf", description: "100% mulberry silk scarf with hand-rolled edges. Lightweight and versatile.", basePrice: 179000, isFeatured: false, sizeType: "Accessories" },
  { name: "High-Waist Tailored Trousers", slug: "high-waist-tailored-trousers", description: "Wide-leg trousers in structured crepe with a flattering high waist and pressed crease.", basePrice: 389000, isFeatured: true, sizeType: "Clothing" },
  { name: "Cashmere Blend Sweater", slug: "cashmere-blend-sweater-woman", description: "Soft cashmere-wool blend crew neck with ribbed cuffs and hem. Luxurious everyday warmth.", basePrice: 529000, isFeatured: true, sizeType: "Clothing" },
  { name: "Pleated Midi Skirt", slug: "pleated-midi-skirt", description: "Flowing accordion-pleated skirt in lightweight chiffon with elasticated waist.", basePrice: 319000, isFeatured: false, sizeType: "Clothing" },
  { name: "Leather Ankle Boots", slug: "leather-ankle-boots-woman", description: "Sleek pointed-toe ankle boots in smooth calf leather with block heel and side zip.", basePrice: 649000, isFeatured: true, sizeType: "Shoes" },
  { name: "Oversized Blazer", slug: "oversized-blazer-woman", description: "Relaxed-fit double-breasted blazer with peak lapels. Effortlessly chic for any occasion.", basePrice: 579000, isFeatured: false, sizeType: "Clothing" },
  { name: "Ribbed Knit Tank Top", slug: "ribbed-knit-tank-top", description: "Fitted ribbed tank in organic cotton with a square neckline. A versatile layering essential.", basePrice: 149000, isFeatured: false, sizeType: "Clothing" },
  { name: "Canvas Tote Bag", slug: "canvas-tote-bag-woman", description: "Sturdy canvas tote with leather handles and interior zip pocket. Spacious for daily essentials.", basePrice: 249000, isFeatured: false, sizeType: "Accessories" },
  { name: "Satin Slip Dress", slug: "satin-slip-dress", description: "Bias-cut satin slip dress with delicate spaghetti straps and cowl neckline.", basePrice: 399000, isFeatured: false, sizeType: "Clothing" },
  { name: "Strappy Heeled Sandals", slug: "strappy-heeled-sandals", description: "Minimalist strappy sandals with slender stiletto heel and adjustable ankle strap.", basePrice: 449000, isFeatured: false, sizeType: "Shoes" },
  { name: "Cotton Poplin Blouse", slug: "cotton-poplin-blouse", description: "Crisp cotton poplin blouse with puff sleeves and concealed button placket.", basePrice: 269000, isFeatured: false, sizeType: "Clothing" },
  { name: "Pearl Drop Earrings", slug: "pearl-drop-earrings", description: "Freshwater pearl drop earrings on gold-plated sterling silver hooks. Timeless elegance.", basePrice: 159000, isFeatured: false, sizeType: "Accessories" },
  { name: "Trench Coat", slug: "trench-coat-woman", description: "Double-breasted trench in water-resistant cotton gabardine with removable belt.", basePrice: 799000, isFeatured: false, sizeType: "Clothing" },
  { name: "Cropped Wide-Leg Jeans", slug: "cropped-wide-leg-jeans", description: "High-rise wide-leg jeans in non-stretch organic denim with raw-edge hem.", basePrice: 359000, isFeatured: false, sizeType: "Clothing" },
  { name: "Ballet Flats", slug: "ballet-flats-woman", description: "Soft leather ballet flats with cushioned insole and grosgrain bow detail.", basePrice: 329000, isFeatured: false, sizeType: "Shoes" },
  { name: "Linen Maxi Dress", slug: "linen-maxi-dress", description: "Relaxed A-line maxi dress in breathable linen with side pockets and adjustable straps.", basePrice: 429000, isFeatured: false, sizeType: "Clothing" },
  { name: "Straw Sun Hat", slug: "straw-sun-hat", description: "Wide-brim straw hat with grosgrain ribbon trim. UPF 50+ sun protection.", basePrice: 189000, isFeatured: false, sizeType: "Accessories" },
  { name: "Puffer Jacket", slug: "puffer-jacket-woman", description: "Lightweight down-filled puffer with stand collar and two-way zip. Packs into its own pocket.", basePrice: 549000, isFeatured: false, sizeType: "Clothing" },
];

const UNISEX_PRODUCTS: ProductTemplate[] = [
  { name: "Essential Crew Sweatshirt", slug: "essential-crew-sweatshirt", description: "Relaxed-fit crew neck sweatshirt in heavy-weight loopback cotton. Clean minimal design.", basePrice: 329000, isFeatured: true, sizeType: "Clothing" },
  { name: "Classic White Sneakers", slug: "classic-white-sneakers", description: "Clean all-white leather sneakers with cushioned insole and durable rubber cupsole.", basePrice: 459000, isFeatured: true, sizeType: "Shoes" },
  { name: "Organic Cotton Hoodie", slug: "organic-cotton-hoodie", description: "GOTS-certified organic cotton hoodie with brushed interior and drawstring hood.", basePrice: 379000, isFeatured: true, sizeType: "Clothing" },
  { name: "Canvas Backpack", slug: "canvas-backpack-unisex", description: "Waxed canvas backpack with padded laptop compartment and leather buckle closures.", basePrice: 499000, isFeatured: true, sizeType: "Accessories" },
  { name: "Straight Leg Denim", slug: "straight-leg-denim-unisex", description: "Medium-wash straight-leg jeans in rigid selvedge denim. Clean and classic.", basePrice: 389000, isFeatured: true, sizeType: "Clothing" },
  { name: "Oversized Logo Tee", slug: "oversized-logo-tee", description: "Boxy-fit tee with subtle tone-on-tone embroidered logo. 200gsm organic cotton.", basePrice: 199000, isFeatured: false, sizeType: "Clothing" },
  { name: "Track Pants", slug: "track-pants-unisex", description: "Tapered track pants in French terry with side stripe detail and zip pockets.", basePrice: 299000, isFeatured: false, sizeType: "Clothing" },
  { name: "Beanie Hat", slug: "beanie-hat-unisex", description: "Ribbed merino wool beanie with fold-up cuff. Soft, warm, and itch-free.", basePrice: 129000, isFeatured: false, sizeType: "Accessories" },
  { name: "Windbreaker Jacket", slug: "windbreaker-jacket-unisex", description: "Lightweight packable windbreaker with half-zip and adjustable hood. Water-repellent finish.", basePrice: 399000, isFeatured: false, sizeType: "Clothing" },
  { name: "Slip-On Canvas Shoes", slug: "slip-on-canvas-shoes", description: "Elastic-gore slip-on shoes in washed canvas with padded collar and rubber sole.", basePrice: 279000, isFeatured: false, sizeType: "Shoes" },
  { name: "Heavyweight Pocket Tee", slug: "heavyweight-pocket-tee", description: "Boxy-fit pocket tee in 220gsm cotton with drop shoulders. Sturdy and oversized.", basePrice: 189000, isFeatured: false, sizeType: "Clothing" },
  { name: "Nylon Crossbody Bag", slug: "nylon-crossbody-bag", description: "Compact ripstop nylon crossbody with adjustable strap and YKK zippers.", basePrice: 199000, isFeatured: false, sizeType: "Accessories" },
  { name: "Relaxed Chino Shorts", slug: "relaxed-chino-shorts", description: "Wide-cut twill shorts with elastic waistband and drawstring. Relaxed summer staple.", basePrice: 229000, isFeatured: false, sizeType: "Clothing" },
  { name: "Leather Slide Sandals", slug: "leather-slide-sandals", description: "Single-strap leather slides with contoured cork footbed and rubber outsole.", basePrice: 299000, isFeatured: false, sizeType: "Shoes" },
  { name: "Fleece Quarter-Zip", slug: "fleece-quarter-zip", description: "Micro-fleece quarter-zip pullover with stand collar. Lightweight yet insulating.", basePrice: 289000, isFeatured: false, sizeType: "Clothing" },
  { name: "Bucket Hat", slug: "bucket-hat-unisex", description: "Washed cotton bucket hat with embroidered eyelet vents and packable brim.", basePrice: 139000, isFeatured: false, sizeType: "Accessories" },
  { name: "French Terry Joggers", slug: "french-terry-joggers", description: "Mid-weight French terry joggers with elasticated cuffs and hidden zip pocket.", basePrice: 279000, isFeatured: false, sizeType: "Clothing" },
  { name: "Leather Card Wallet", slug: "leather-card-wallet", description: "Slim card wallet in pebbled leather with 4 card slots and center cash compartment.", basePrice: 149000, isFeatured: false, sizeType: "Accessories" },
  { name: "Oversized Denim Jacket", slug: "oversized-denim-jacket", description: "Oversized trucker jacket in washed organic denim with adjustable side tabs.", basePrice: 479000, isFeatured: false, sizeType: "Clothing" },
  { name: "Chunky Platform Sneakers", slug: "chunky-platform-sneakers", description: "Bold chunky sneakers with layered sole unit and padded mesh upper. Statement footwear.", basePrice: 529000, isFeatured: false, sizeType: "Shoes" },
];

const RAMADHAN_SALE_PRODUCTS: ProductTemplate[] = [
  { name: "Ramadhan Embroidered Tunic", slug: "ramadhan-embroidered-tunic", description: "Elegant tunic with intricate embroidery detail. Perfect for festive gatherings and Eid celebrations.", basePrice: 359000, isFeatured: true, sizeType: "Clothing" },
  { name: "Modest Long Dress", slug: "modest-long-dress-ramadhan", description: "Flowing long dress with high neckline and full sleeves. Graceful modest fashion for Ramadhan.", basePrice: 489000, isFeatured: true, sizeType: "Clothing" },
  { name: "Premium Prayer Set", slug: "premium-prayer-set", description: "Complete prayer set in soft jersey fabric. Includes dress and matching head covering.", basePrice: 299000, isFeatured: true, sizeType: "Clothing" },
  { name: "Satin Hijab", slug: "satin-hijab-ramadhan", description: "Smooth satin square hijab with hand-stitched edges. Rich jewel-tone colours for Ramadhan.", basePrice: 129000, isFeatured: true, sizeType: "Accessories" },
  { name: "Brocade Vest", slug: "brocade-vest-ramadhan", description: "Luxurious brocade vest with metallic thread detailing. A statement piece for Eid festivities.", basePrice: 449000, isFeatured: false, sizeType: "Clothing" },
  { name: "Koko Shirt", slug: "koko-shirt-ramadhan", description: "Traditional koko shirt in premium cotton with mandarin collar and hidden button placket.", basePrice: 279000, isFeatured: true, sizeType: "Clothing" },
  { name: "Embellished Clutch", slug: "embellished-clutch-ramadhan", description: "Beaded evening clutch with detachable chain strap. Perfect companion for festive outfits.", basePrice: 259000, isFeatured: false, sizeType: "Accessories" },
  { name: "Wide-Leg Palazzo Pants", slug: "wide-leg-palazzo-ramadhan", description: "Flowing palazzo pants in printed crepe de chine. Pairs beautifully with tunics and blouses.", basePrice: 319000, isFeatured: false, sizeType: "Clothing" },
  { name: "Kaftan Dress", slug: "kaftan-dress-ramadhan", description: "Relaxed kaftan dress with gold trim and side slits. Effortless elegance for Ramadhan evenings.", basePrice: 529000, isFeatured: false, sizeType: "Clothing" },
  { name: "Velvet Sandals", slug: "velvet-sandals-ramadhan", description: "Slip-on velvet sandals with gold-embossed insole. Comfortable and dressy for celebrations.", basePrice: 349000, isFeatured: false, sizeType: "Shoes" },
  { name: "Lace Overlay Top", slug: "lace-overlay-top-ramadhan", description: "Delicate lace overlay top with full sleeves and scalloped hem. Modest yet sophisticated.", basePrice: 289000, isFeatured: false, sizeType: "Clothing" },
  { name: "Peci Songkok Premium", slug: "peci-songkok-premium", description: "Hand-crafted songkok in black velvet with satin lining. Premium quality for special occasions.", basePrice: 159000, isFeatured: false, sizeType: "Accessories" },
  { name: "Festive Sarong", slug: "festive-sarong-ramadhan", description: "Hand-stamped batik sarong in festive colours. Versatile for prayer or formal occasions.", basePrice: 199000, isFeatured: false, sizeType: "Accessories" },
  { name: "Abaya Dress", slug: "abaya-dress-ramadhan", description: "Open-front abaya in flowing nidha fabric with bell sleeves and lace cuff detail.", basePrice: 559000, isFeatured: false, sizeType: "Clothing" },
  { name: "Pearl Brooch Set", slug: "pearl-brooch-set-ramadhan", description: "Set of three pearl and crystal brooches for hijab styling. Elegant and secure.", basePrice: 99000, isFeatured: false, sizeType: "Accessories" },
  { name: "Men's Jubah", slug: "mens-jubah-ramadhan", description: "Full-length jubah in premium cotton with embroidered neckline and side pockets.", basePrice: 399000, isFeatured: false, sizeType: "Clothing" },
  { name: "Eid Gift Box Scarf Set", slug: "eid-gift-box-scarf-set", description: "Curated gift box with two premium scarves in complementary colours. Ready to gift.", basePrice: 329000, isFeatured: false, sizeType: "Accessories" },
  { name: "Modest Swimwear Top", slug: "modest-swimwear-top-ramadhan", description: "Full-coverage swim top in quick-dry fabric with UPF 50+ protection.", basePrice: 249000, isFeatured: false, sizeType: "Clothing" },
  { name: "Embroidered Flat Shoes", slug: "embroidered-flat-shoes-ramadhan", description: "Pointed-toe flats with traditional embroidery motifs on satin upper.", basePrice: 299000, isFeatured: false, sizeType: "Shoes" },
  { name: "Tasbih Bracelet", slug: "tasbih-bracelet-ramadhan", description: "Natural stone tasbih bracelet with 33 beads and elastic cord. Functional and stylish.", basePrice: 79000, isFeatured: false, sizeType: "Accessories" },
];

const NEW_TREND_PRODUCTS: ProductTemplate[] = [
  { name: "Mesh Panel Sneakers", slug: "mesh-panel-sneakers-trend", description: "Futuristic sneakers with transparent mesh panels and chunky foam sole. Next-gen streetwear.", basePrice: 579000, isFeatured: true, sizeType: "Shoes" },
  { name: "Cropped Boxy Blazer", slug: "cropped-boxy-blazer-trend", description: "Sharp cropped blazer with exaggerated shoulders and double-breasted closure. Bold power dressing.", basePrice: 599000, isFeatured: true, sizeType: "Clothing" },
  { name: "Cutout Knit Top", slug: "cutout-knit-top-trend", description: "Ribbed knit top with asymmetric cutout details and mock neck. Sculptural modern design.", basePrice: 249000, isFeatured: true, sizeType: "Clothing" },
  { name: "Cargo Utility Vest", slug: "cargo-utility-vest-trend", description: "Oversized utility vest with multiple zip pockets and drawcord hem. Tactical meets fashion.", basePrice: 429000, isFeatured: true, sizeType: "Clothing" },
  { name: "Iridescent Mini Bag", slug: "iridescent-mini-bag-trend", description: "Holographic PU mini bag with chain strap. Catches light from every angle.", basePrice: 219000, isFeatured: true, sizeType: "Accessories" },
  { name: "Pleated Parachute Pants", slug: "pleated-parachute-pants-trend", description: "Voluminous parachute pants in tech nylon with adjustable toggle hems. Y2K revival.", basePrice: 379000, isFeatured: false, sizeType: "Clothing" },
  { name: "Platform Chelsea Boots", slug: "platform-chelsea-boots-trend", description: "Lug-sole Chelsea boots with exaggerated platform. Premium leather upper with elastic gusset.", basePrice: 699000, isFeatured: false, sizeType: "Shoes" },
  { name: "Color-Block Windbreaker", slug: "color-block-windbreaker-trend", description: "Retro color-block windbreaker with packable hood and contrast zip. 90s-inspired streetwear.", basePrice: 449000, isFeatured: false, sizeType: "Clothing" },
  { name: "Asymmetric Hem Skirt", slug: "asymmetric-hem-skirt-trend", description: "Draped midi skirt with dramatic asymmetric hemline in fluid satin.", basePrice: 339000, isFeatured: false, sizeType: "Clothing" },
  { name: "Chunky Chain Necklace", slug: "chunky-chain-necklace-trend", description: "Bold curb-chain necklace in gold-plated stainless steel with toggle clasp.", basePrice: 189000, isFeatured: false, sizeType: "Accessories" },
  { name: "Deconstructed Denim Shirt", slug: "deconstructed-denim-shirt-trend", description: "Raw-edge denim shirt with exposed seams and distressed wash. Anti-fashion statement.", basePrice: 349000, isFeatured: false, sizeType: "Clothing" },
  { name: "Rubber Ankle Rain Boots", slug: "rubber-rain-boots-trend", description: "Matte rubber ankle boots in trending earth tones. Waterproof with cushioned insole.", basePrice: 329000, isFeatured: false, sizeType: "Shoes" },
  { name: "Mesh Overlay Dress", slug: "mesh-overlay-dress-trend", description: "Layered mesh dress over jersey slip. Sheer texture play for night-out styling.", basePrice: 419000, isFeatured: false, sizeType: "Clothing" },
  { name: "Micro Sunglasses", slug: "micro-sunglasses-trend", description: "Slim micro-frame sunglasses with UV400 lenses. The Y2K accessory comeback.", basePrice: 159000, isFeatured: false, sizeType: "Accessories" },
  { name: "Patchwork Knit Cardigan", slug: "patchwork-knit-cardigan-trend", description: "Hand-assembled patchwork cardigan in mixed yarn textures. Each piece is one of a kind.", basePrice: 529000, isFeatured: false, sizeType: "Clothing" },
  { name: "Track Sole Loafers", slug: "track-sole-loafers-trend", description: "Classic penny loafers reimagined with aggressive lug sole. Heritage meets street.", basePrice: 549000, isFeatured: false, sizeType: "Shoes" },
  { name: "Corset Belt", slug: "corset-belt-trend", description: "Wide lace-up corset belt in vegan leather. Cinches any silhouette for a dramatic look.", basePrice: 179000, isFeatured: false, sizeType: "Accessories" },
  { name: "Sheer Organza Shirt", slug: "sheer-organza-shirt-trend", description: "Transparent organza button-up with visible seams. Boundary-pushing layering piece.", basePrice: 299000, isFeatured: false, sizeType: "Clothing" },
  { name: "Dad Sneakers", slug: "dad-sneakers-trend", description: "Retro-inspired dad sneakers with multi-layer sole and mixed material upper.", basePrice: 489000, isFeatured: false, sizeType: "Shoes" },
  { name: "Sculptural Earrings", slug: "sculptural-earrings-trend", description: "Abstract sculptural drop earrings in matte gold-plated brass. Wearable art.", basePrice: 139000, isFeatured: false, sizeType: "Accessories" },
];

// ============================================================================
// SIZE PRESETS
// ============================================================================

function clothingSizes(slug: string): { sizeName: string; sku: string; stock: number }[] {
  return [
    { sizeName: "XS", sku: `${slug}-XS-001`, stock: 10 + Math.floor(Math.random() * 15) },
    { sizeName: "S", sku: `${slug}-S-002`, stock: 15 + Math.floor(Math.random() * 15) },
    { sizeName: "M", sku: `${slug}-M-003`, stock: 20 + Math.floor(Math.random() * 15) },
    { sizeName: "L", sku: `${slug}-L-004`, stock: 20 + Math.floor(Math.random() * 15) },
    { sizeName: "XL", sku: `${slug}-XL-005`, stock: 10 + Math.floor(Math.random() * 15) },
    { sizeName: "XXL", sku: `${slug}-XXL-006`, stock: 5 + Math.floor(Math.random() * 10) },
  ];
}

function shoeSizes(slug: string): { sizeName: string; sku: string; stock: number }[] {
  return [
    { sizeName: "38", sku: `${slug}-38-001`, stock: 5 + Math.floor(Math.random() * 10) },
    { sizeName: "39", sku: `${slug}-39-002`, stock: 10 + Math.floor(Math.random() * 10) },
    { sizeName: "40", sku: `${slug}-40-003`, stock: 15 + Math.floor(Math.random() * 10) },
    { sizeName: "41", sku: `${slug}-41-004`, stock: 15 + Math.floor(Math.random() * 10) },
    { sizeName: "42", sku: `${slug}-42-005`, stock: 10 + Math.floor(Math.random() * 10) },
    { sizeName: "43", sku: `${slug}-43-006`, stock: 8 + Math.floor(Math.random() * 10) },
    { sizeName: "44", sku: `${slug}-44-007`, stock: 5 + Math.floor(Math.random() * 8) },
  ];
}

function accessorySizes(slug: string): { sizeName: string; sku: string; stock: number }[] {
  return [
    { sizeName: "One Size", sku: `${slug}-ONESIZE-001`, stock: 30 + Math.floor(Math.random() * 20) },
  ];
}

function getSizesForType(sizeType: string, slug: string) {
  switch (sizeType) {
    case "Clothing": return clothingSizes(slug);
    case "Shoes": return shoeSizes(slug);
    case "Accessories": return accessorySizes(slug);
    default: return clothingSizes(slug);
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedProducts() {
  console.log("🌱 Seeding products...\n");

  // Step 1: Build lookup maps
  const allCategories = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const categoryMap = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));
  console.log(`📂 Found ${allCategories.length} categories`);

  const allSizes = await db
    .select({ id: sizes.id, name: sizes.name, sizeTypeName: sizeTypes.name })
    .from(sizes)
    .innerJoin(sizeTypes, eq(sizes.sizeTypeId, sizeTypes.id));
  const sizeMap = Object.fromEntries(allSizes.map((s) => [`${s.sizeTypeName}:${s.name}`, s.id]));
  console.log(`📏 Found ${allSizes.length} sizes\n`);

  // Step 2: Seed each category
  const categoryGroups: { label: string; slug: string; products: ProductTemplate[] }[] = [
    { label: "Man", slug: "man", products: MAN_PRODUCTS },
    { label: "Woman", slug: "woman", products: WOMAN_PRODUCTS },
    { label: "Unisex", slug: "unisex", products: UNISEX_PRODUCTS },
    { label: "Ramadhan Sale", slug: "ramadhan-sale", products: RAMADHAN_SALE_PRODUCTS },
    { label: "New Trend", slug: "new-trend", products: NEW_TREND_PRODUCTS },
  ];

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const group of categoryGroups) {
    const categoryId = categoryMap[group.slug];
    if (!categoryId) {
      console.log(`⚠️  Category "${group.slug}" not found — skipping ${group.products.length} products`);
      totalSkipped += group.products.length;
      continue;
    }

    console.log(`\n📦 ${group.label} (${group.slug}):`);
    let inserted = 0;

    for (const product of group.products) {
      // Skip if already exists
      const existing = await db.query.products.findFirst({
        where: eq(products.slug, product.slug),
      });
      if (existing) {
        console.log(`   ⏭️  "${product.name}" (exists)`);
        totalSkipped++;
        continue;
      }

      // Resolve size IDs
      const productSizeData = getSizesForType(product.sizeType, product.slug);
      const resolvedSizes = productSizeData.map((s) => {
        const key = `${product.sizeType}:${s.sizeName}`;
        const sizeId = sizeMap[key];
        if (!sizeId) throw new Error(`Size "${s.sizeName}" in type "${product.sizeType}" not found`);
        return { sizeId, sku: s.sku, stock: s.stock };
      });

      // Insert in transaction
      await db.transaction(async (tx) => {
        const [newProduct] = await tx
          .insert(products)
          .values({
            name: product.name,
            slug: product.slug,
            description: product.description,
            basePrice: product.basePrice,
            status: "active",
            isFeatured: product.isFeatured,
          })
          .returning({ id: products.id });

        await tx.insert(productCategories).values({
          productId: newProduct.id,
          categoryId,
        });

        await tx.insert(productSizes).values(
          resolvedSizes.map((s) => ({
            productId: newProduct.id,
            sizeId: s.sizeId,
            sku: s.sku,
            stock: s.stock,
          }))
        );
      });

      const totalStock = resolvedSizes.reduce((sum, s) => sum + s.stock, 0);
      console.log(`   ✅ "${product.name}" — ${resolvedSizes.length} sizes, ${totalStock} stock`);
      inserted++;
      totalInserted++;
    }

    console.log(`   → ${inserted} inserted for ${group.label}`);
  }

  console.log(`\n🎉 Done! ${totalInserted} inserted, ${totalSkipped} skipped.`);
  process.exit(0);
}

seedProducts().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

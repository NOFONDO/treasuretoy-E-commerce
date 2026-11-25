import type { Product } from "@/types";

/**
 * Placeholder catalogue used ONLY when Supabase is not configured.
 * Names, prices and stock are fictional demo data. Replace with real stock
 * (and confirm manufacturer licensing) before going live.
 */
const base: Omit<Product, "id" | "slug" | "sku" | "name" | "description" | "department" | "audience" | "category" | "priceMinor"> = {
  manufacturer: null,
  scale: null,
  discountPercent: 0,
  stock: 12,
  ageMin: null,
  safetyNotes: null,
  occasions: [],
  isFeatured: false,
  isLimited: false,
  isNew: false,
  isPublished: true,
  seoTitle: null,
  seoDescription: null,
  images: [],
  videos: [],
};

const kid = (
  n: number,
  name: string,
  category: string,
  priceMinor: number,
  ageMin: number,
  description: string,
  extra: Partial<Product> = {},
): Product => ({
  ...base,
  id: `sample-kid-${n}`,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  sku: `SAMPLE-K${String(n).padStart(3, "0")}`,
  name,
  description,
  department: "kids",
  audience: "children",
  category,
  priceMinor,
  ageMin,
  safetyNotes:
    ageMin !== null && ageMin < 3
      ? "Suitable from the stated age. Check for loose parts before each use."
      : "Contains small parts and batteries. Adult supervision recommended.",
  ...extra,
});

const collector = (
  n: number,
  name: string,
  manufacturer: string,
  category: string,
  scale: string,
  priceMinor: number,
  description: string,
  extra: Partial<Product> = {},
): Product => ({
  ...base,
  id: `sample-col-${n}`,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  sku: `SAMPLE-C${String(n).padStart(3, "0")}`,
  name,
  description,
  department: "collectors",
  audience: "collectors",
  category,
  manufacturer,
  scale,
  priceMinor,
  ageMin: 14,
  safetyNotes: "Collector's model, not a toy. Contains small parts. Not suitable for children under 14.",
  stock: 4,
  ...extra,
});

export const sampleProducts: Product[] = [
  kid(1, "Velocity RC Racer", "Remote Control Cars", 3999, 6, "Fast 2.4GHz remote-control racer with rechargeable battery and rubber tyres.", { isFeatured: true, occasions: ["birthday", "christmas"] }),
  kid(2, "Apex Supercar Toy", "Supercar Toys", 1899, 3, "Pull-back supercar with opening doors and a smooth, rounded finish.", { isNew: true, occasions: ["birthday"] }),
  kid(3, "Mini Cruiser Ride-On", "Electric Ride-On Cars", 18999, 3, "12V electric ride-on with parental remote control and seat belt.", { isFeatured: true, occasions: ["birthday", "christmas", "premium"], safetyNotes: "Adult supervision required. Use the parental remote for first rides." }),
  kid(4, "Grand Prix Track Set", "Racing Tracks", 5499, 5, "3m looping race track with two cars, ideal for friendly races.", { occasions: ["christmas", "birthday"] }),
  kid(5, "Rescue Heroes Vehicle Set", "Emergency Vehicle Toys", 2499, 3, "Fire engine, ambulance and police car with lights and sounds.", { occasions: ["christmas"], isNew: true }),
  kid(6, "Builder's Dump Truck", "Construction Vehicles", 1499, 2, "Chunky, rounded dump truck built for sandpit adventures.", { occasions: ["birthday"], discountPercent: 10 }),
  kid(7, "Little Racers Gift Box", "Toy Car Gift Sets", 2999, 3, "Six pocket-sized racers in a presentation gift box.", { occasions: ["christmas", "birthday"], isFeatured: true }),
  kid(8, "Stocking Filler Mini Cars", "Toy Car Sets", 799, 3, "Three mini cars, the perfect stocking filler.", { occasions: ["christmas"] }),
  collector(1, "Prancing GT 1:18 Diecast", "Ferrari", "Luxury Supercars", "1:18", 18999, "Highly detailed 1:18 diecast with opening doors, bonnet and a fully modelled engine bay.", { isFeatured: true, isLimited: true, occasions: ["premium", "christmas", "birthday"] }),
  collector(2, "Raging Bull SVJ 1:18 Diecast", "Lamborghini", "Luxury Supercars", "1:18", 21999, "Premium display model with carbon-effect interior and a certificate of authenticity.", { isFeatured: true, occasions: ["premium", "birthday"] }),
  collector(3, "Stuttgart 911 Classic 1:24", "Porsche", "Classic Cars", "1:24", 6499, "A tribute to the air-cooled era in 1:24 scale, with a display plinth.", { occasions: ["birthday", "premium"], isNew: true }),
  collector(4, "Silver Arrow GP 1:43", "Mercedes-Benz", "Formula 1 Models", "1:43", 4999, "Grand prix car in 1:43 scale in a collector's acrylic case.", { occasions: ["birthday", "christmas"] }),
  collector(5, "Bavarian M Coupe 1:64", "BMW", "Sports Cars", "1:64", 1299, "Pocket-sized collectible, great for starting a display shelf.", { occasions: ["christmas", "birthday"], discountPercent: 5 }),
  collector(6, "Papaya Hypercar 1:18 Limited", "McLaren", "Limited Editions", "1:18", 29999, "Limited run of 500 with numbered base plate and display case.", { isLimited: true, occasions: ["premium"], stock: 2 }),
  collector(7, "Molsheim Hypercar 1:18", "Bugatti", "Premium Display Models", "1:18", 34999, "Flagship display model with working steering and detailed interior.", { occasions: ["premium"], isFeatured: true, stock: 2 }),
];

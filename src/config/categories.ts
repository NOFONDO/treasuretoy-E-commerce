import type { Department } from "@/types";

export const categorySuggestions: Record<Department, string[]> = {
  kids: [
    "Remote Control Cars", "Racing Cars", "Sports Car Toys", "Supercar Toys", "Electric Ride-On Cars",
    "Toy Car Sets", "Racing Tracks", "Construction Vehicles", "Emergency Vehicle Toys",
    "Toy Car Gift Sets", "Educational Vehicle Toys",
  ],
  collectors: [
    "Diecast Collectibles", "Luxury Supercars", "Classic Cars", "Sports Cars", "Racing Cars",
    "Formula 1 Models", "Limited Editions", "Exclusive Collections", "Vintage Cars", "Premium Display Models",
  ],
};

export const scales = ["1:18", "1:24", "1:32", "1:43", "1:64"] as const;

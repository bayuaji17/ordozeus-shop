"use server";

import { cache } from "react";
import { requireAdmin } from "@/lib/auth/server";

const WILAYAH_API_URL = "https://wilayah-id.bandev.my.id";

interface LocationOption {
  id: string;
  name: string;
}

interface WilayahApiResponse<T> {
  success: boolean;
  data: T[];
  count?: number;
}

interface ProvinceData {
  code: string;
  name: string;
}

interface RegencyData {
  code: string;
  name: string;
  province_code: string;
}

interface DistrictData {
  code: string;
  name: string;
  regency_code: string;
}

// Cache province fetch for request deduplication
const fetchProvinces = cache(async (): Promise<LocationOption[]> => {
  const response = await fetch(`${WILAYAH_API_URL}/provinces`, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch provinces: ${response.status}`);
  }

  const result: WilayahApiResponse<ProvinceData> = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data.map((province) => ({
    id: province.code,
    name: province.name,
  }));
});

export async function getProvinces() {
  await requireAdmin();
  try {
    const provinces = await fetchProvinces();
    return provinces;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw new Error("Failed to fetch provinces");
  }
}

export async function getCitiesByProvince(provinceId: string) {
  await requireAdmin();
  try {
    const response = await fetch(`${WILAYAH_API_URL}/regencies/${provinceId}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status}`);
    }

    const result: WilayahApiResponse<RegencyData> = await response.json();

    if (!result.success) {
      throw new Error("API returned unsuccessful response");
    }

    return result.data.map((regency) => ({
      id: regency.code,
      name: regency.name,
    }));
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw new Error("Failed to fetch cities");
  }
}

export async function getDistrictsByCity(cityId: string) {
  await requireAdmin();
  try {
    const response = await fetch(`${WILAYAH_API_URL}/districts/${cityId}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch districts: ${response.status}`);
    }

    const result: WilayahApiResponse<DistrictData> = await response.json();

    if (!result.success) {
      throw new Error("API returned unsuccessful response");
    }

    return result.data.map((district) => ({
      id: district.code,
      name: district.name,
    }));
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw new Error("Failed to fetch districts");
  }
}

interface DestinationResult {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zipCode: string;
}

export async function searchDestinations(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limit?: number,
): Promise<DestinationResult[]> {
  // Note: This function is used in checkout (client-side), so no requireAdmin()
  // TODO: Implement search using wilayah API or shipping provider
  // This requires building a search index or using a shipping provider's search API

  try {
    // For now, return empty array - this needs a shipping provider integration
    // or a local search index built from wilayah data
    console.warn("searchDestinations not implemented with wilayah API");
    return [];
  } catch (error) {
    console.error("Error searching destinations:", error);
    return [];
  }
}

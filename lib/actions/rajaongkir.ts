"use server";

import { unstable_cache } from "next/cache";

interface RajaOngkirDestination {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}

interface SearchResult {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zipCode: string;
}

const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1";

/**
 * Search destinations from RajaOngkir API
 * Results are cached for 24 hours since destination data rarely changes
 */
export async function searchDestinations(
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  console.log("[RajaOngkir] searchDestinations called:", { query, limit });

  if (!query || query.length < 2) {
    console.log("[RajaOngkir] Query too short, returning empty array");
    return [];
  }

  const cacheKey = `rajaongkir-search-${query.toLowerCase().trim()}-${limit}`;
  console.log("[RajaOngkir] Cache key:", cacheKey);

  const fetchDestinations = async () => {
    try {
      const url = new URL(
        `${RAJAONGKIR_BASE_URL}/destination/domestic-destination`,
      );
      url.searchParams.set("search", query);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", "0");

      console.log("[RajaOngkir] Searching destinations:", {
        query,
        limit,
        url: url.toString(),
        hasApiKey: !!process.env.SHIPPING_COST,
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          key: `${process.env.SHIPPING_COST}`,
        },
        next: { revalidate: 86400 }, // 24 hours
      });

      console.log("[RajaOngkir] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[RajaOngkir] API error response:", errorText);
        throw new Error(`RajaOngkir API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[RajaOngkir] Response data:", {
        meta: data.meta,
        resultCount: data.data?.length ?? 0,
        firstResult: data.data?.[0] ?? null,
      });

      if (data.meta?.status !== "success" || !Array.isArray(data.data)) {
        return [];
      }

      const destinations: RajaOngkirDestination[] = data.data;

      const mappedResults = destinations.map((dest) => ({
        id: dest.id,
        label: dest.label,
        province: dest.province_name,
        city: dest.city_name,
        district: dest.district_name,
        subdistrict: dest.subdistrict_name,
        zipCode: dest.zip_code,
      }));

      console.log("[RajaOngkir] Mapped results:", mappedResults.length);
      return mappedResults;
    } catch (error) {
      console.error("[RajaOngkir] Error fetching destinations:", error);
      return [];
    }
  };

  // Use unstable_cache for server-side caching
  const cachedFetch = unstable_cache(fetchDestinations, [cacheKey], {
    revalidate: 86400, // 24 hours
    tags: ["rajaongkir", `rajaongkir-search-${query.toLowerCase().trim()}`],
  });

  return cachedFetch();
}

/**
 * Get destination by ID
 */
export async function getDestinationById(
  id: number,
): Promise<SearchResult | null> {
  console.log("[RajaOngkir] getDestinationById called:", { id });

  const cacheKey = `rajaongkir-destination-${id}`;

  const fetchDestination = async () => {
    try {
      console.log("[RajaOngkir] Fetching destination by ID:", id);

      // RajaOngkir doesn't have a get-by-id endpoint, so we search with the ID
      const url = new URL(
        `${RAJAONGKIR_BASE_URL}/destination/domestic-destination`,
      );
      url.searchParams.set("search", id.toString());
      url.searchParams.set("limit", "50");
      url.searchParams.set("offset", "0");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          key: `${process.env.SHIPPING_COST}`,
        },
        next: { revalidate: 86400 },
      });

      console.log("[RajaOngkir] Get by ID response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[RajaOngkir] API error response:", errorText);
        throw new Error(`RajaOngkir API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[RajaOngkir] Get by ID response:", {
        meta: data.meta,
        resultCount: data.data?.length ?? 0,
      });

      if (data.meta?.status !== "success" || !Array.isArray(data.data)) {
        return null;
      }

      const destination: RajaOngkirDestination | undefined = data.data.find(
        (d: RajaOngkirDestination) => d.id === id,
      );

      if (!destination) {
        console.log("[RajaOngkir] Destination not found for ID:", id);
        return null;
      }

      console.log("[RajaOngkir] Found destination:", destination.label);

      return {
        id: destination.id,
        label: destination.label,
        province: destination.province_name,
        city: destination.city_name,
        district: destination.district_name,
        subdistrict: destination.subdistrict_name,
        zipCode: destination.zip_code,
      };
    } catch (error) {
      console.error("[RajaOngkir] Error fetching destination:", error);
      return null;
    }
  };

  const cachedFetch = unstable_cache(fetchDestination, [cacheKey], {
    revalidate: 86400,
    tags: ["rajaongkir", `rajaongkir-destination-${id}`],
  });

  return cachedFetch();
}

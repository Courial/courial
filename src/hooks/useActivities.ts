import { useInfiniteQuery } from "@tanstack/react-query";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

export interface ActivityItem {
  orderid: string;
  status: string;
  deliveryFee: number | string;
  providerId: string | number | null;
  orderDateTime: string;
  transport_mode: string | null;
  serviceType: string;
  type: string;
  scheduleType: string;
  pickupInfo: {
    fullAddress?: string;
    placeName?: string;
    address?: string;
    name?: string;
    latitude?: string;
    longitude?: string;
    [key: string]: any;
  } | null;
  deliveryInfo: {
    fullAddress?: string;
    placeName?: string;
    address?: string;
    name?: string;
    latitude?: string;
    longitude?: string;
    [key: string]: any;
  } | null;
  UserVehicle?: {
    make?: string;
    model?: string;
    color?: string;
    year?: string | number;
    [key: string]: any;
  } | null;
  Provider?: {
    first_name?: string;
    last_name?: string;
    image?: string;
    profile_image?: string;
    rating?: number | string;
    since_year?: string;
    latitude?: number | string;
    longitude?: number | string;
    language?: string;
    UserVehicle?: {
      make?: string;
      model?: string;
      color?: string;
      year?: string | number;
      license_plate?: string;
      [key: string]: any;
    } | null;
    [key: string]: any;
  } | null;
  provider?: ActivityItem["Provider"];
  category?: string;
  subCategory?: string;
  sub_category?: string;
  description?: string;
  notes?: string;
  scheduledDate?: string;
  scheduled_date?: string;
  scheduledTime?: string;
  scheduled_time?: string;
  concierge_vehicle?: string;
  conciergeVehicle?: string;
  paymentType?: string;
  payment_type?: string;
  cardType?: string;
  card_type?: string;
  [key: string]: any;
}

async function fetchActivities(type: "past" | "pending", page: number, token: string): Promise<ActivityItem[]> {
  const url = `https://${PROJECT_ID}.supabase.co/functions/v1/fetch-activities?type=${type}&page=${page}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const raw = await res.json();

  // Handle 401 / Invalid Token — clear stale token so user re-authenticates
  if (!res.ok || raw?.code === 401) {
    const msg = raw?.msg?.message || raw?.error?.message || "Invalid Token";
    if (msg.includes("Invalid Token") || res.status === 401) {
      localStorage.removeItem("courial_api_token");
      console.warn("[useActivities] Courial token expired — cleared from storage");
    }
    throw new Error(`Failed to fetch activities: ${res.status} — ${msg}`);
  }

  // The API wraps data in { success, code, msg, data: [...] }
  const arr = Array.isArray(raw) ? raw : raw.data ?? raw.activities ?? [];
  return Array.isArray(arr) ? arr : [];
}

export function useActivities(type: "past" | "pending") {
  const token = localStorage.getItem("courial_api_token") || "";

  return useInfiniteQuery<ActivityItem[]>({
    queryKey: ["activities", type, token],
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      // Re-read token at query time to avoid stale closures
      const freshToken = localStorage.getItem("courial_api_token") || "";
      if (!freshToken) throw new Error("No courial_api_token available");
      return fetchActivities(type, pageParam as number, freshToken);
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // Stop paginating if the page returned the same items as previous page or is empty
      if (lastPage.length === 0) return undefined;
      // Check for duplicate data (API returning same results for every page)
      if (allPages.length >= 2) {
        const prevPage = allPages[allPages.length - 2];
        if (prevPage.length > 0 && prevPage[0]?.orderid === lastPage[0]?.orderid) {
          return undefined;
        }
      }
      return (lastPageParam as number) + 1;
    },
  });
}

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
  pickupInfo: {
    address?: string;
    name?: string;
    [key: string]: any;
  } | null;
  deliveryInfo: {
    address?: string;
    name?: string;
    [key: string]: any;
  } | null;
  UserVehicle?: {
    make?: string;
    model?: string;
    color?: string;
    year?: string | number;
    [key: string]: any;
  } | null;
}

async function fetchActivities(type: "past" | "pending", page: number, token: string): Promise<ActivityItem[]> {
  const url = `https://${PROJECT_ID}.supabase.co/functions/v1/fetch-activities?type=${type}&page=${page}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch activities: ${res.status}`);
  }
  const data = await res.json();
  // The API may return an array directly or wrap in a property
  return Array.isArray(data) ? data : data.data ?? data.activities ?? [];
}

export function useActivities(type: "past" | "pending") {
  const token = localStorage.getItem("courial_api_token") || "";

  return useInfiniteQuery<ActivityItem[]>({
    queryKey: ["activities", type],
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchActivities(type, pageParam as number, token),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // If the page returned items, assume there may be more
      if (lastPage.length > 0) return (lastPageParam as number) + 1;
      return undefined;
    },
  });
}

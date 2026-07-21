"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { AccountData } from "@/lib/account";

export const accountKey = ["account"] as const;

/** The full account aggregate, cached and shared across the dashboard. */
export function useAccount(initialData?: AccountData) {
  return useQuery({
    queryKey: accountKey,
    queryFn: () => apiGet<AccountData>("/api/account"),
    initialData,
  });
}

/** Imperatively refresh the account cache after a mutation. */
export function useRefreshAccount() {
  const client = useQueryClient();
  return (data?: AccountData) => {
    if (data) client.setQueryData(accountKey, data);
    else client.invalidateQueries({ queryKey: accountKey });
  };
}

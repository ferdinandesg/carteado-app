import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import type { Catalog, CatalogItem, ProductType } from "shared/types";

import useAxiosAuth, { useAuthQueryEnabled } from "@/hooks/useAuthAxios";

export const STORE_QUERY_KEY = ["store"] as const;

const EMPTY_CATALOG: Catalog = { items: [], cash: 0 };

/** Código de erro da API (`message`) ou um fallback genérico. */
export function getStoreErrorCode(error: unknown): string {
  if (error instanceof AxiosError) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return "STORE_REQUEST_FAILED";
}

/**
 * Catálogo + mutações da loja. Toda mutação devolve o catálogo já
 * atualizado; em seguida forçamos o NextAuth a rebuscar `/auth/me` para
 * skin/avatar da sessão refletirem o loadout.
 */
export default function useStore() {
  const axiosAuth = useAxiosAuth();
  const authReady = useAuthQueryEnabled();
  const queryClient = useQueryClient();
  const { update } = useSession();

  const query = useQuery<Catalog>({
    queryKey: STORE_QUERY_KEY,
    queryFn: () => axiosAuth.get<Catalog>("/store").then((res) => res.data),
    enabled: authReady,
  });

  const applyCatalog = async (catalog: Catalog) => {
    queryClient.setQueryData(STORE_QUERY_KEY, catalog);
    await update();
  };

  const buy = useMutation({
    mutationFn: (productId: string) =>
      axiosAuth
        .post<Catalog>("/store/buy", { productId })
        .then((res) => res.data),
    onSuccess: applyCatalog,
  });

  const equip = useMutation({
    mutationFn: (productId: string) =>
      axiosAuth
        .patch<Catalog>("/store/equip", { productId })
        .then((res) => res.data),
    onSuccess: applyCatalog,
  });

  const unequip = useMutation({
    mutationFn: (type: ProductType) =>
      axiosAuth.delete<Catalog>(`/store/equip/${type}`).then((res) => res.data),
    onSuccess: applyCatalog,
  });

  const catalog = query.data ?? EMPTY_CATALOG;
  const itemsOf = (type: ProductType): CatalogItem[] =>
    catalog.items.filter((item) => item.type === type);
  const equippedOf = (type: ProductType): CatalogItem | undefined =>
    catalog.items.find((item) => item.type === type && item.equipped);

  return {
    catalog,
    itemsOf,
    equippedOf,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    buy,
    equip,
    unequip,
    isMutating: buy.isPending || equip.isPending || unequip.isPending,
  };
}

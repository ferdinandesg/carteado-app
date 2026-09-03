import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import useAxiosAuth from "@/hooks/useAuthAxios";

export type ProductType = "DECK" | "AVATAR";

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  imageUrl: string;
}

interface IInventoryItem {
  id: string;
  userId: string;
  productId: string;
  purchasedAt: string;
  product: IProduct;
}

interface IPurchaseResponse {
  inventory: IInventoryItem;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return "STORE_REQUEST_FAILED";
}

export default function useStore() {
  const axiosAuth = useAxiosAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [inventory, setInventory] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosAuth.get<IProduct[]>("/store");
      setProducts(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [axiosAuth]);

  const purchaseItem = useCallback(
    async (productId: string): Promise<IPurchaseResponse | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axiosAuth.post<IPurchaseResponse>("/store/buy", {
          productId,
        });
        setInventory((prev) => {
          if (prev.some((item) => item.id === data.inventory.product.id)) {
            return prev;
          }
          return [...prev, data.inventory.product];
        });
        return data;
      } catch (err) {
        setError(getErrorMessage(err));
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [axiosAuth]
  );

  const equipItem = useCallback(
    async (productId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await axiosAuth.patch("/store/equip", { productId });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [axiosAuth]
  );

  return {
    products,
    inventory,
    isLoading,
    error,
    fetchProducts,
    purchaseItem,
    equipItem,
  };
}

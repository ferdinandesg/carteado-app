import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UseFetchProps = {
  url: string;
} & ({ method: "POST" | "PUT"; body: any } | { method: "GET" });

export default function useFetch<T>({ url, method, ...props }: UseFetchProps) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const { status, data: session } = useSession();
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(session.user && { Authorization: session.user.id! }),
      },
      method,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        setData(result);
      })
      .catch((er) => {
        setError(er);
      })
      .finally(() => setLoading(false));
  }, [status]);
  return { data, error, isLoading };
}

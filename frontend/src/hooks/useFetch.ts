import { useEffect, useState } from "react";

type UseFetchProps = {
  url: string;
} & ({ method: "POST"; body: any } | { method: "GET" });

export default function useFetch<T = any>({ url, method }: UseFetchProps) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T>();
  const [error, setError] = useState<T>();
  useEffect(() => {
    fetch(url, {
      headers: { "Content-Type": "application/json" },
      method,
      //   body,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log({ result });
        setData(result);
      })
      .catch((er) => setError(er))
      .finally(() => setLoading(false));
  }, []);
  return { isLoading, data };
}

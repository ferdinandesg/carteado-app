import { useSession } from "next-auth/react";
import { apiClient, setApiAuthToken } from "@/lib/api/client";

/** Só dispara queries autenticadas quando a sessão JWT já está disponível. */
export function useAuthQueryEnabled(): boolean {
  const { status, data } = useSession();
  return (
    status === "authenticated" && Boolean(data?.user?.accessToken)
  );
}

const useAxiosAuth = () => {
  const { status, data } = useSession();
  const token = data?.user?.accessToken;

  if (token) {
    setApiAuthToken(token);
  } else if (status === "unauthenticated") {
    setApiAuthToken(undefined);
  }

  return apiClient;
};

export default useAxiosAuth;

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FriendListItem } from "shared/types";
import useAxiosAuth, { useAuthQueryEnabled } from "../useAuthAxios";

/** Friendlist é só para contas persistidas; convidados não têm acesso. */
export function useIsRegisteredUser(): boolean {
  const { data } = useSession();
  return Boolean(data?.user) && data?.user.role !== "guest";
}

export function useFriendsQueryEnabled(): boolean {
  const authReady = useAuthQueryEnabled();
  const isRegistered = useIsRegisteredUser();
  return authReady && isRegistered;
}

export default function useFriends() {
  const axiosAuth = useAxiosAuth();
  const enabled = useFriendsQueryEnabled();
  const { data, isLoading, isError } = useQuery<FriendListItem[]>({
    queryKey: ["friends"],
    queryFn: () => axiosAuth.get("/friends").then((res) => res.data),
    enabled,
  });
  return { friends: data || [], isLoading: enabled && isLoading, isError };
}

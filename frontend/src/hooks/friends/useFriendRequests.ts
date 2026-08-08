import { useQuery } from "@tanstack/react-query";
import { FriendRequestsResponse } from "shared/types";
import useAxiosAuth from "../useAuthAxios";
import { useFriendsQueryEnabled } from "./useFriends";

const EMPTY_REQUESTS: FriendRequestsResponse = { incoming: [], outgoing: [] };

export default function useFriendRequests() {
  const axiosAuth = useAxiosAuth();
  const enabled = useFriendsQueryEnabled();
  const { data, isLoading, isError } = useQuery<FriendRequestsResponse>({
    queryKey: ["friends", "requests"],
    queryFn: () => axiosAuth.get("/friends/requests").then((res) => res.data),
    enabled,
  });
  return { requests: data || EMPTY_REQUESTS, isLoading, isError };
}

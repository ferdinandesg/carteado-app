import { useQuery } from "@tanstack/react-query";
import { FriendSearchResult } from "shared/types";
import useAxiosAuth from "../useAuthAxios";
import { useFriendsQueryEnabled } from "./useFriends";

export const MIN_SEARCH_LENGTH = 2;

export default function useSearchUsers(query: string) {
  const axiosAuth = useAxiosAuth();
  const enabled = useFriendsQueryEnabled();
  const trimmed = query.trim();
  const { data, isFetching } = useQuery<FriendSearchResult[]>({
    queryKey: ["friends", "search", trimmed],
    queryFn: () =>
      axiosAuth
        .get("/friends/search", { params: { q: trimmed } })
        .then((res) => res.data),
    enabled: enabled && trimmed.length >= MIN_SEARCH_LENGTH,
  });
  return { results: data || [], isSearching: isFetching };
}

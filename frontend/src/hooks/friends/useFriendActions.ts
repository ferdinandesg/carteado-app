import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../useAuthAxios";

/** Mutations da friendlist; todas revalidam as queries de amigos. */
export default function useFriendActions() {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["friends"] });

  const sendRequest = useMutation({
    mutationFn: (userId: string) =>
      axiosAuth.post("/friends/requests", { userId }),
    onSuccess: invalidate,
  });

  const acceptRequest = useMutation({
    mutationFn: (friendshipId: string) =>
      axiosAuth.post(`/friends/requests/${friendshipId}/accept`),
    onSuccess: invalidate,
  });

  const dismissRequest = useMutation({
    mutationFn: (friendshipId: string) =>
      axiosAuth.delete(`/friends/requests/${friendshipId}`),
    onSuccess: invalidate,
  });

  const removeFriend = useMutation({
    mutationFn: (userId: string) => axiosAuth.delete(`/friends/${userId}`),
    onSuccess: invalidate,
  });

  return { sendRequest, acceptRequest, dismissRequest, removeFriend };
}

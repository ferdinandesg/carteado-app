import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../axios";
import { Player } from '@/models/Users';
import { RoomStatus } from '@/models/room';

type RoomsInterface = {
  id: string;
  hash: string;
  name: string;
  status: RoomStatus;
  createdAt: string;
  players: Player[];
};
const fetchRoomByHash = async (hash: string) => {
  const response = await axiosInstance.get(`/rooms/${hash}`);
  return response.data;
};
export default function useRoomByHash(hash: string) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<RoomsInterface>({
    queryKey: ['room', hash],
    queryFn: () => fetchRoomByHash(hash),
    enabled: !!hash,
    retry: 1
  });

  return {
    room: data,
    isLoading,
    isError,
    error,
    refetch
  };
}
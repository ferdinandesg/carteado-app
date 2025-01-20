import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../axios";
import { Player } from '@/models/Users';

type RoomsInterface = {
  id: string;
  hash: string;
  name: string;
  status: "open" | "playing";
  createdAt: string;
  players: Player[];
};

const rawFetchRooms = async () => {
  const response = await axiosInstance.get('/rooms');
  return response.data;
};

export default function fetchRooms() {
  const { data, isLoading, isError } = useQuery<RoomsInterface[]>({
    queryKey: ['rooms'],
    queryFn: rawFetchRooms
  });

  return {
    data,
    isLoading,
    isError
  }
}
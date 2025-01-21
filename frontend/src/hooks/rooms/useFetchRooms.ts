import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../axios";
import { Player } from 'shared/types';

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

export default function useFetchRooms() {
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
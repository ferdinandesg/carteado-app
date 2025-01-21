import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../axios"
import { RoomInterface } from "@/models/room";

type CreateRoomPayload = {
  name: string;
  size: number
}

async function postRoom(room: CreateRoomPayload): Promise<RoomInterface> {
  const response = await axiosInstance.post('/rooms', room);
  return response.data;
}

export function useCreateRoom() {
  return useMutation<RoomInterface, Error, CreateRoomPayload>(
    {
      mutationFn: (room: CreateRoomPayload) => postRoom(room),
      onSuccess: (data) => {
        console.log("Room created successfully:", data);
      },
      onError: (error) => {
        console.error("Error creating room:", error);
      }
    }
  );
}

export default function CreateRoom() {
  const { mutate, isError, data, isPending } = useCreateRoom();

  const handleSubmit = (room: CreateRoomPayload) => {
    mutate(room);
  };

  return {
    handleSubmit,
    isError,
    data,
    isLoading: isPending
  }
}
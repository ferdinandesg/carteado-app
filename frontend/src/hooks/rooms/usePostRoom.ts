import axiosInstance from "../axios"

type CreateRoomPayload = {
  name: string;
  size: number
}

async function rawPostRoom(room: CreateRoomPayload) {
  const response = await axiosInstance.post('/rooms', room);
  const data = response.data;
  return data
}

export default function usePostRoom() {

  const createRoom = async (room: CreateRoomPayload) => {
    try {
      const data = await rawPostRoom(room);
      return data
    } catch (error) {
      console.error(error);
    }
  }
  return {
    createRoom
  }
}
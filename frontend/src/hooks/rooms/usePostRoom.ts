import logger from "@/tests/utils/logger";
import useAxiosAuth from "../useAuthAxios";

type CreateRoomPayload = {
  name: string;
  size: number;
};

export default function usePostRoom() {
  const axiosAuth = useAxiosAuth();
  const createRoom = async (room: CreateRoomPayload) => {
    try {
      const response = await axiosAuth.post("/rooms", room);

      return response.data;
    } catch (error) {
      logger.error(error);
    }
  };
  return {
    createRoom,
  };
}

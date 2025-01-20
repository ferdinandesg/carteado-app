import { Player } from "@prisma/client";
import GameClass from "./game";
type RoomCache = {
  [key: string]: GameClass;
};
function Rooms() {
  let cache: RoomCache = {};

  return {
    get: (roomId: string): GameClass => {
      return cache[roomId];
    },
    create: (players: Player[], roomId: string) => {
      if (cache[roomId]) return cache[roomId];
      cache[roomId] = new GameClass(players);
      return cache[roomId];
    },
  };
}
export default Rooms();

import { User } from "@prisma/client";

export type RoomUsers = User & {
  status?: string;
  role?: "guest" | "user";
};

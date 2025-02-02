export type UserRole = "guest" | "user";

type UserMeta = {
  rank: number;
  room: string;
  status: string;
};

export type EmptyGuestType = Omit<GuestType, "room" | "status">;

export type GuestType = UserMeta & {
  id: string;
  email: string;
  name: string;
  role: "guest";
};

export type SocketUser = UserMeta & {
  id: string;
  email: string;
  name: string;
  role: "user";
  image: string;
};

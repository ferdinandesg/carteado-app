export type UserRole = "guest" | "user";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image: string;
};

type UserMeta = {
  id: string;
  email: string;
  name: string;
  rank: number;
  room: string;
  status: string;
  isRegistered: boolean;
  image?: string;
};

export type EmptyGuestType = Omit<GuestType, "room" | "status">;

export type GuestType = UserMeta & {
  role: "guest";
  isRegistered: boolean;
};

export type SocketUser = UserMeta & {
  role: "user";
};

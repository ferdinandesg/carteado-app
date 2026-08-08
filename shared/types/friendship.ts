// DTOs (formato wire/JSON) das rotas de friendlist em /api/v1/friends

export type FriendUser = {
  id: string;
  name: string;
  image: string;
  rank: number;
};

export type FriendListItem = {
  friendshipId: string;
  since: string | null;
  user: FriendUser;
};

export type FriendRequestItem = {
  friendshipId: string;
  createdAt: string;
  user: FriendUser;
};

export type FriendRequestsResponse = {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
};

export type FriendRelation = "NONE" | "PENDING" | "ACCEPTED" | "BLOCKED";

export type FriendSearchResult = FriendUser & {
  relation: FriendRelation;
};

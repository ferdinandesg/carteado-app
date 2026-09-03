export const DEFAULT_AVATAR = "/assets/avatars/avatar1.png";

export const avatarOptions = [
  "/assets/avatars/avatar1.png",
  "/assets/avatars/avatar2.png",
  "/assets/avatars/avatar3.png",
  "/assets/avatars/avatar4.png",
] as const;

export const skinOptions = [
  {
    name: "Baralho 01",
    value: "baralho01",
    path: "/assets/skins/baralho01/clubs/Kclubs.png",
  },
  {
    name: "Baralho 02",
    value: "baralho02",
    path: "/assets/skins/baralho02/clubs/Kclubs.png",
  },
  {
    name: "Baralho 03",
    value: "baralho03",
    path: "/assets/skins/baralho03/clubs/Kclubs.png",
  },
  {
    name: "Baralho 04",
    value: "baralho04",
    path: "/assets/skins/baralho04/clubs/Kclubs.png",
  },
] as const;

export type AvatarOption = (typeof avatarOptions)[number];
export type SkinOption = (typeof skinOptions)[number]["value"];

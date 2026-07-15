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
    path: "/assets/skins/baralho01/clubs/2clubs.png",
  },
  {
    name: "8-bit Blue",
    value: "8bit",
    path: "/assets/skins/8bit/clubs/2clubs.png",
  },
  {
    name: "Basics White",
    value: "basics/white",
    path: "/assets/skins/basics/white/clubs/2clubs.png",
  },
  {
    name: "Basics Black",
    value: "basics/black",
    path: "/assets/skins/basics/black/clubs/2clubs.png",
  },
] as const;

export type AvatarOption = (typeof avatarOptions)[number];
export type SkinOption = (typeof skinOptions)[number]["value"];

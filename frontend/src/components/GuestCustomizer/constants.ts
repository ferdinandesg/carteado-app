export const DEFAULT_AVATAR = "/assets/avatars/default.jpg";

export const avatarOptions = [
  "/assets/avatars/avatar3.png",
  "/assets/avatars/avatar4.png",
  "/assets/avatars/avatar5.png",
  "/assets/avatars/avatar6.png",
] as const;

export const skinOptions = [
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
  {
    name: "Poker",
    value: "poker",
    path: "/assets/skins/poker/clubs/2clubs.png",
  },
] as const;

export type AvatarOption = (typeof avatarOptions)[number];
export type SkinOption = (typeof skinOptions)[number]["value"];

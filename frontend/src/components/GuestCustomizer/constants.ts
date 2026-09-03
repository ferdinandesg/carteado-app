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
  },
  {
    name: "Baralho 02",
    value: "baralho02",
  },
  {
    name: "Baralho 03",
    value: "baralho03",
  },
  {
    name: "Baralho 04",
    value: "baralho04",
  },
] as const;

export type AvatarOption = (typeof avatarOptions)[number];
export type SkinOption = (typeof skinOptions)[number]["value"];

export const DEFAULT_SKIN: SkinOption = "baralho01";

export function resolveSkin(skin: string | null | undefined): SkinOption {
  return skinOptions.some((option) => option.value === skin)
    ? (skin as SkinOption)
    : DEFAULT_SKIN;
}

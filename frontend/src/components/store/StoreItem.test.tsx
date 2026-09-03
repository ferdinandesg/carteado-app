import { fireEvent, render, screen } from "@testing-library/react";
import type { CatalogItem } from "shared/types";

import StoreItem from "./StoreItem";

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

const deck: CatalogItem = {
  id: "deck-02",
  type: "DECK",
  assetKey: "baralho02",
  name: "Baralho 02",
  description: "Deck clássico",
  price: 400,
  imageUrl: null,
  isDefault: false,
  owned: false,
  equipped: false,
};

describe("StoreItem", () => {
  const onBuy = jest.fn();
  const onEquip = jest.fn();

  beforeEach(() => {
    onBuy.mockReset();
    onEquip.mockReset();
  });

  it("shows the price and asks to buy when not owned", () => {
    render(
      <StoreItem
        item={deck}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Store.buyFor" }));
    expect(onBuy).toHaveBeenCalledWith(deck);
    expect(onEquip).not.toHaveBeenCalled();
  });

  it("equips when owned and not equipped", () => {
    const owned = { ...deck, owned: true };
    render(
      <StoreItem
        item={owned}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Store.equip" }));
    expect(onEquip).toHaveBeenCalledWith(owned);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it("disables the action when already equipped", () => {
    render(
      <StoreItem
        item={{ ...deck, owned: true, equipped: true }}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    );

    expect(
      screen.getByRole("button", { name: "Store.equipped" })
    ).toBeDisabled();
  });

  it("renders the royalty preview fan with the product skin", () => {
    render(
      <StoreItem
        item={deck}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByAltText("K of clubs")).toHaveAttribute(
      "src",
      expect.stringContaining("/assets/skins/baralho02/clubs/Kclubs.png")
    );
  });

  it("renders the avatar image for AVATAR items", () => {
    render(
      <StoreItem
        item={{
          ...deck,
          id: "avatar-1",
          type: "AVATAR",
          assetKey: "avatar1",
          name: "Avatar 1",
          imageUrl: "/assets/avatars/avatar1.png",
        }}
        onBuy={onBuy}
        onEquip={onEquip}
      />
    );

    expect(screen.getByAltText("Avatar 1")).toHaveAttribute(
      "src",
      expect.stringContaining("avatar1.png")
    );
  });
});

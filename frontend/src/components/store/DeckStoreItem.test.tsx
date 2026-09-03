import { fireEvent, render, screen } from "@testing-library/react";

import DeckStoreItem from "./DeckStoreItem";
import type { DeckProduct } from "./DeckStoreItem";

const mockStore = {
  inventory: [] as Array<{ id: string }>,
  purchaseItem: jest.fn(),
  equipItem: jest.fn(),
};

jest.mock("@/hooks/store/useStore", () => ({
  __esModule: true,
  default: () => ({
    inventory: mockStore.inventory,
    isLoading: false,
    purchaseItem: mockStore.purchaseItem,
    equipItem: mockStore.equipItem,
  }),
}));

const product: DeckProduct = {
  id: "deck-02",
  name: "Baralho 02",
  description: "Deck clássico",
  price: 250,
  type: "DECK",
  imageUrl: "/assets/skins/baralho02/clubs/Kclubs.png",
};

describe("DeckStoreItem", () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
  });

  beforeEach(() => {
    mockStore.inventory = [];
    mockStore.purchaseItem.mockReset();
    mockStore.equipItem.mockReset();
  });

  it("shows the price and purchases when the deck is not owned", () => {
    render(<DeckStoreItem product={product} />);

    fireEvent.click(screen.getByRole("button", { name: "250" }));
    expect(mockStore.purchaseItem).toHaveBeenCalledWith("deck-02");
    expect(mockStore.equipItem).not.toHaveBeenCalled();
  });

  it("shows Equipar and equips when the deck is owned", () => {
    mockStore.inventory = [{ id: "deck-02" }];
    render(<DeckStoreItem product={product} />);

    fireEvent.click(screen.getByRole("button", { name: "Equipar" }));
    expect(mockStore.equipItem).toHaveBeenCalledWith("deck-02");
    expect(mockStore.purchaseItem).not.toHaveBeenCalled();
  });

  it("renders the K, J and Q preview fan", () => {
    render(<DeckStoreItem product={product} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByAltText("K of hearts")).toBeInTheDocument();
    expect(screen.getByAltText("J of spades")).toBeInTheDocument();
    expect(screen.getByAltText("Q of diamonds")).toBeInTheDocument();
  });
});

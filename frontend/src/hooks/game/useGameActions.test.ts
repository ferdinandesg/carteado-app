import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Card } from "shared/cards";

import { useSocket } from "@/contexts/socket.context";

import {
  GameActionsProvider,
  SocketGameActionsProvider,
  useGameActions,
  type GameActions,
} from "./useGameActions";

jest.mock("@/contexts/socket.context", () => ({
  useSocket: jest.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SocketGameActionsProvider, null, children);

describe("useGameActions", () => {
  const socket = { emit: jest.fn(), on: jest.fn(), off: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({
      socket,
      isConnected: true,
    });
  });

  it.each([
    ["endTurn", "end_turn"],
    ["pickUpBunch", "draw_table"],
    ["undoPlay", "retrieve_card"],
    ["askTruco", "ask_truco"],
    ["acceptTruco", "accept_truco"],
    ["rejectTruco", "reject_truco"],
  ] as const)("%s emits %s without payload", (action, event) => {
    const { result } = renderHook(() => useGameActions(), { wrapper });

    result.current[action]();

    expect(socket.emit).toHaveBeenCalledWith(event);
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });

  it("playCard emits play_card with the card", () => {
    const card = { suit: "clubs", rank: "K" } as unknown as Card;
    const { result } = renderHook(() => useGameActions(), { wrapper });

    result.current.playCard(card);

    expect(socket.emit).toHaveBeenCalledWith("play_card", { card });
  });

  it("handlePickCards emits pick_hand with the cards", () => {
    const cards = [{ suit: "hearts", rank: "10" }] as unknown as Card[];
    const { result } = renderHook(() => useGameActions(), { wrapper });

    result.current.handlePickCards(cards);

    expect(socket.emit).toHaveBeenCalledWith("pick_hand", { cards });
  });

  it("keeps a stable actions object across renders", () => {
    const { result, rerender } = renderHook(() => useGameActions(), {
      wrapper,
    });
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it("uses the injected actions when a provider overrides them (sandbox)", () => {
    const local = { playCard: jest.fn() } as unknown as GameActions;
    const { result } = renderHook(() => useGameActions(), {
      wrapper: ({ children }) =>
        createElement(GameActionsProvider, { value: local }, children),
    });

    expect(result.current).toBe(local);
    expect(useSocket).not.toHaveBeenCalled();
  });
});

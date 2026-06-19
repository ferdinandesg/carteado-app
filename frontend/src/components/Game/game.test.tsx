import { render, screen } from "@testing-library/react";

import Game from "@/components/Game/game";
import { useRoomContext } from "@/contexts/room.context";
import { RoomInterface } from "@/models/room";

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("@/contexts/room.context", () => ({
  useRoomContext: jest.fn(),
}));

jest.mock("./carteado.game", () => ({
  __esModule: true,
  default: () => <div>carteado-game</div>,
}));

jest.mock("./truco.game", () => ({
  __esModule: true,
  default: () => <div>truco-game</div>,
}));

const baseRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 2,
  participants: [],
  rule: "CarteadoGameRules",
  createdAt: "2026-01-01T00:00:00.000Z",
  ownerId: "user-1",
  owner: {
    id: "user-1",
    name: "Owner",
    email: "owner@example.com",
    image: "/avatar.png",
  },
};

describe("Game", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing while room is loading", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: null,
      isLoading: true,
    });

    const { container } = render(<Game />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders CarteadoGame for CarteadoGameRules", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: baseRoom,
      isLoading: false,
    });

    render(<Game />);
    expect(screen.getByText("carteado-game")).toBeInTheDocument();
  });

  it("renders TrucoGame for TrucoGameRules", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: { ...baseRoom, rule: "TrucoGameRules" },
      isLoading: false,
    });

    render(<Game />);
    expect(screen.getByText("truco-game")).toBeInTheDocument();
  });
});

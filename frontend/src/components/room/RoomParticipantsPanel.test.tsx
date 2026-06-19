import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerStatus } from "shared/game";

import RoomParticipantsPanel from "@/components/room/RoomParticipantsPanel";
import { useRoomContext } from "@/contexts/room.context";
import { RoomInterface } from "@/models/room";
import { testIds } from "@/tests/testIds";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("@/contexts/room.context", () => ({
  useRoomContext: jest.fn(),
}));

const mockRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 2,
  participants: [
    {
      userId: "user-1",
      socketId: "socket-1",
      name: "Owner",
      status: PlayerStatus.READY,
      isRegistered: true,
      isOnline: true,
    },
    {
      userId: "user-2",
      socketId: "socket-2",
      name: "Guest",
      status: PlayerStatus.NOT_READY,
      isRegistered: false,
      isOnline: true,
    },
  ],
  rule: "CarteadoGameRules",
  createdAt: "2026-01-01T00:00:00.000Z",
  ownerId: "user-1",
};

describe("RoomParticipantsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRoomContext as jest.Mock).mockReturnValue({ room: mockRoom });
  });

  it("renders participants and navigates back to menu", async () => {
    const user = userEvent.setup();
    render(<RoomParticipantsPanel />);

    expect(
      screen.getByTestId(testIds.room.participantsPanel)
    ).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();

    await user.click(screen.getByTestId(testIds.room.backButton));
    expect(mockPush).toHaveBeenCalledWith("/menu");
  });
});

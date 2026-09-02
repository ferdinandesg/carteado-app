import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Chat from "@/components/Chat";
import RoomInfo from "@/components/room/RoomInfo";
import RoomShell from "@/components/room/RoomShell";
import { useSocket } from "@/contexts/socket.context";
import { RoomInterface } from "shared/types";
import { testIds } from "@/tests/testIds";

jest.mock("@/contexts/socket.context", () => {
  const useSocket = jest.fn();
  return {
    useSocket,
    useOptionalSocket: useSocket,
  };
});

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Me" } },
    status: "authenticated",
  }),
}));

type Handler = (...args: unknown[]) => void;
const handlers = new Map<string, Handler>();
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn((event: string, handler: Handler) =>
    handlers.set(event, handler)
  ),
  off: jest.fn(),
  connected: true,
};

const mockRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 2,
  participants: [],
  rule: "TrucoGameRules",
  createdAt: "2026-01-01T00:00:00.000Z",
  ownerId: "user-1",
  owner: { name: "Owner", email: "o@x.com", image: "/a.png" },
};

function mockViewport(mobile: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: mobile && query.includes("max-width"),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}

function renderShell() {
  return render(
    <RoomShell
      participants={<aside>participants</aside>}
      info={<RoomInfo room={mockRoom} />}
      chat={<Chat roomHash={mockRoom.hash} />}>
      <section>center</section>
    </RoomShell>
  );
}

describe("RoomShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    (useSocket as jest.Mock).mockReturnValue({
      socket: mockSocket,
      isConnected: true,
    });
  });

  it("desktop: renders info and chat side by side without the mobile bar", () => {
    mockViewport(false);
    renderShell();

    expect(screen.getByTestId(testIds.room.info)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.room.chat)).toBeInTheDocument();
    expect(screen.queryByTestId(testIds.room.sheet)).toBeNull();
    expect(screen.queryByTestId(testIds.room.panelToggle("chat"))).toBeNull();
  });

  it("mobile: opens panels in a bottom sheet and tracks unread chat messages", async () => {
    mockViewport(true);
    const user = userEvent.setup();
    renderShell();

    const sheet = screen.getByTestId(testIds.room.sheet);
    expect(sheet).toHaveAttribute("data-open", "false");
    expect(screen.queryByTestId(testIds.room.chatUnread)).toBeNull();

    act(() => {
      handlers.get("load_messages")?.([]);
      handlers.get("receive_message")?.({ name: "Other", message: "oi" });
    });
    expect(screen.getByTestId(testIds.room.chatUnread)).toHaveTextContent("1");

    await user.click(screen.getByTestId(testIds.room.panelToggle("chat")));
    expect(sheet).toHaveAttribute("data-open", "true");
    expect(screen.queryByTestId(testIds.room.chatUnread)).toBeNull();
    expect(screen.getByText("oi")).toBeVisible();

    await user.click(screen.getByTestId(testIds.room.panelToggle("info")));
    expect(screen.getByText("abcd")).toBeVisible();
    expect(screen.getByText("oi")).not.toBeVisible();

    await user.click(screen.getByTestId(testIds.room.sheetClose));
    expect(sheet).toHaveAttribute("data-open", "false");
  });
});

describe("RoomInfo", () => {
  it("copies the room code", async () => {
    // user-event instala um stub de clipboard em `setup()`.
    const user = userEvent.setup();

    render(<RoomInfo room={mockRoom} />);

    await user.click(screen.getByTestId(testIds.room.copyHash));

    expect(await navigator.clipboard.readText()).toBe("abcd");
    expect(screen.getByText("RoomInfo.copied")).toBeInTheDocument();
    expect(screen.getByText("RoomItem.TrucoGameRules")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });
});

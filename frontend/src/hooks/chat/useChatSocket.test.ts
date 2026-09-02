import { act, renderHook } from "@testing-library/react";

import { useSocket } from "@/contexts/socket.context";

import { useChatSocket } from "./useChatSocket";

jest.mock("@/contexts/socket.context", () => ({
  useSocket: jest.fn(),
}));

describe("useChatSocket", () => {
  const roomHash = "abcd";
  let handlers: Record<string, (...args: unknown[]) => void>;
  const socket = {
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = handler;
    }),
    off: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = {};
    (useSocket as jest.Mock).mockReturnValue({ socket, isConnected: true });
  });

  it("joins the chat once connected and loads history", () => {
    const { result } = renderHook(() => useChatSocket(roomHash));

    expect(socket.emit).toHaveBeenCalledWith("join_chat", { roomHash });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      handlers.load_messages([{ name: "a", message: "hi" }]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages).toEqual([{ name: "a", message: "hi" }]);
  });

  it("replaces history on load_messages instead of accumulating", () => {
    const { result } = renderHook(() => useChatSocket(roomHash));

    act(() => {
      handlers.load_messages([{ name: "a", message: "1" }]);
      handlers.load_messages([{ name: "a", message: "1" }]);
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it("counts unread messages only while unfocused and resets on markAsRead", () => {
    let focused = false;
    const { result } = renderHook(() =>
      useChatSocket(roomHash, { isFocused: () => focused })
    );

    act(() => {
      handlers.receive_message({ name: "b", message: "x" });
    });
    expect(result.current.unreadCount).toBe(1);

    focused = true;
    act(() => {
      handlers.receive_message({ name: "b", message: "y" });
    });
    expect(result.current.unreadCount).toBe(1);

    act(() => result.current.markAsRead());
    expect(result.current.unreadCount).toBe(0);
  });

  it("translates join notices into system messages", () => {
    const { result } = renderHook(() => useChatSocket(roomHash));

    act(() => {
      handlers.join_chat({ name: "system", message: "Ana" });
    });

    expect(result.current.messages[0]).toEqual({
      name: "system",
      message: "ServerMessages.infos.PLAYER_JOINED",
    });
  });

  it("sends trimmed messages and ignores blank ones", () => {
    const { result } = renderHook(() => useChatSocket(roomHash));
    socket.emit.mockClear();

    result.current.sendMessage("   ");
    result.current.sendMessage("  ola ");

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("send_message", {
      roomHash,
      message: "ola",
    });
  });

  it("does not join before the socket is connected", () => {
    (useSocket as jest.Mock).mockReturnValue({ socket, isConnected: false });
    renderHook(() => useChatSocket(roomHash));

    expect(socket.emit).not.toHaveBeenCalled();
  });
});

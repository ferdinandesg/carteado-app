import { renderHook } from "@testing-library/react";
import type { RoomInterface } from "shared/types";

import { useRoomSocket } from "@/hooks/rooms/useRoomSocket";
import { useSocket } from "@/contexts/socket.context";

jest.mock("@/contexts/socket.context", () => ({
  useSocket: jest.fn(),
}));

describe("useRoomSocket", () => {
  const roomHash = "abcd";
  const mockRoom = { hash: roomHash } as RoomInterface;
  const updateRoom = jest.fn();

  let socketHandlers: Record<string, (...args: unknown[]) => void>;
  const socket = {
    on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
      socketHandlers[event] = handler;
    }),
    off: jest.fn(),
    emit: jest.fn(),
  };

  const mockConnection = (isConnected: boolean) => {
    (useSocket as jest.Mock).mockReturnValue({ socket, isConnected });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    socketHandlers = {};
  });

  it("registers listeners before emitting join_room when connected", () => {
    mockConnection(true);
    const callOrder: string[] = [];

    socket.on.mockImplementation(
      (event: string, handler: (...args: unknown[]) => void) => {
        callOrder.push(`on:${event}`);
        socketHandlers[event] = handler;
      }
    );
    socket.emit.mockImplementation((event: string) => {
      callOrder.push(`emit:${event}`);
    });

    renderHook(() => useRoomSocket({ roomHash, authReady: true, updateRoom }));

    expect(callOrder.indexOf("on:room_updated")).toBeLessThan(
      callOrder.indexOf("emit:join_room")
    );
    expect(socket.emit).toHaveBeenCalledWith("join_room", { roomHash });
  });

  it("updates room state from room_updated and room_joined", () => {
    mockConnection(true);
    renderHook(() => useRoomSocket({ roomHash, authReady: true, updateRoom }));

    socketHandlers.room_updated(mockRoom);
    socketHandlers.room_joined({ room: mockRoom });

    expect(updateRoom).toHaveBeenCalledTimes(2);
    expect(updateRoom).toHaveBeenCalledWith(mockRoom);
  });

  it("does not emit join_room until socket is connected", () => {
    mockConnection(false);
    renderHook(() => useRoomSocket({ roomHash, authReady: true, updateRoom }));

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("does not subscribe or join before auth is ready", () => {
    mockConnection(true);
    renderHook(() => useRoomSocket({ roomHash, authReady: false, updateRoom }));

    expect(socket.on).not.toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("removes listeners on unmount", () => {
    mockConnection(true);
    const { unmount } = renderHook(() =>
      useRoomSocket({ roomHash, authReady: true, updateRoom })
    );

    unmount();

    expect(socket.off).toHaveBeenCalledWith(
      "room_updated",
      expect.any(Function)
    );
    expect(socket.off).toHaveBeenCalledWith(
      "room_joined",
      expect.any(Function)
    );
  });
});

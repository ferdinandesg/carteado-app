import { renderHook } from "@testing-library/react";
import type { Socket } from "socket.io-client";

import { useRoomSocket } from "@/hooks/rooms/useRoomSocket";
import { RoomInterface } from "@/models/room";

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
  } as unknown as Socket;

  beforeEach(() => {
    jest.clearAllMocks();
    socketHandlers = {};
    updateRoom.mockClear();
  });

  it("registers listeners before emitting join_room when connected", () => {
    const callOrder: string[] = [];

    (socket.on as jest.Mock).mockImplementation(
      (event: string, handler: (...args: unknown[]) => void) => {
        callOrder.push(`on:${event}`);
        socketHandlers[event] = handler;
      }
    );
    (socket.emit as jest.Mock).mockImplementation((event: string) => {
      callOrder.push(`emit:${event}`);
    });

    renderHook(() =>
      useRoomSocket({
        roomHash,
        socket,
        isConnected: true,
        authReady: true,
        updateRoom,
      })
    );

    expect(callOrder.indexOf("on:room_updated")).toBeLessThan(
      callOrder.indexOf("emit:join_room")
    );
    expect(socket.emit).toHaveBeenCalledWith("join_room", { roomHash });
  });

  it("updates room state from room_joined ack", () => {
    renderHook(() =>
      useRoomSocket({
        roomHash,
        socket,
        isConnected: true,
        authReady: true,
        updateRoom,
      })
    );

    socketHandlers.room_joined({ room: mockRoom });

    expect(updateRoom).toHaveBeenCalledWith(mockRoom);
  });

  it("does not emit join_room until socket is connected", () => {
    renderHook(() =>
      useRoomSocket({
        roomHash,
        socket,
        isConnected: false,
        authReady: true,
        updateRoom,
      })
    );

    expect(socket.emit).not.toHaveBeenCalled();
  });
});

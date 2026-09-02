import { renderHook } from "@testing-library/react";

import { useSocket } from "@/contexts/socket.context";

import { useSocketEvent } from "./useSocketEvent";

jest.mock("@/contexts/socket.context", () => ({
  useSocket: jest.fn(),
}));

describe("useSocketEvent", () => {
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

  it("subscribes once and unsubscribes with the same listener on unmount", () => {
    const handler = jest.fn();
    const { unmount } = renderHook(() => useSocketEvent("info", handler));

    expect(socket.on).toHaveBeenCalledTimes(1);
    const registered = socket.on.mock.calls[0][1];

    unmount();

    expect(socket.off).toHaveBeenCalledWith("info", registered);
  });

  it("always invokes the latest handler without re-subscribing", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ handler }) => useSocketEvent("info", handler),
      { initialProps: { handler: first } }
    );

    rerender({ handler: second });
    handlers.info("YOUR_TURN");

    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("YOUR_TURN");
  });

  it("does not subscribe while disabled", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useSocketEvent("info", jest.fn(), { enabled }),
      { initialProps: { enabled: false } }
    );

    expect(socket.on).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(socket.on).toHaveBeenCalledWith("info", expect.any(Function));
  });
});

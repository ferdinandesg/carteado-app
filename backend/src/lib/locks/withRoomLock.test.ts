import { pendingRoomLocks, withRoomLock } from "./withRoomLock";

const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));

describe("withRoomLock", () => {
  it("runs actions for the same room one at a time, in order", async () => {
    const events: string[] = [];
    const task = (id: string, delay: number) => async () => {
      events.push(`start:${id}`);
      await tick(delay);
      events.push(`end:${id}`);
      return id;
    };

    const results = await Promise.all([
      withRoomLock("room-1", task("a", 15)),
      withRoomLock("room-1", task("b", 1)),
      withRoomLock("room-1", task("c", 1)),
    ]);

    expect(results).toEqual(["a", "b", "c"]);
    expect(events).toEqual([
      "start:a",
      "end:a",
      "start:b",
      "end:b",
      "start:c",
      "end:c",
    ]);
  });

  it("lets different rooms run in parallel", async () => {
    const events: string[] = [];
    await Promise.all([
      withRoomLock("room-a", async () => {
        events.push("start:a");
        await tick(15);
        events.push("end:a");
      }),
      withRoomLock("room-b", async () => {
        events.push("start:b");
        await tick(1);
        events.push("end:b");
      }),
    ]);

    expect(events.indexOf("end:b")).toBeLessThan(events.indexOf("end:a"));
  });

  it("keeps the queue going after a failure and propagates the error", async () => {
    const failing = withRoomLock("room-err", async () => {
      throw new Error("boom");
    });
    const next = withRoomLock("room-err", async () => "ok");

    await expect(failing).rejects.toThrow("boom");
    await expect(next).resolves.toBe("ok");
  });

  it("releases the room entry once the queue is empty", async () => {
    await withRoomLock("room-clean", async () => undefined);
    expect(pendingRoomLocks()).toBe(0);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "./EventBus";

describe("eventBus", () => {
  describe("constructor", () => {
    it("creates an EventBus with an empty event map when no parameter is given", () => {
      const eventBus = new EventBus();
      expect(eventBus.eventMap).toEqual({});
    });

    it("creates an EventBus and sort the event map entries given in parameter from the highest to the lowest priority", () => {
      const entry1 = {
        priority: 0,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry2 = {
        priority: 99,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry3 = {
        priority: -42,
        handler: (_event: unknown, _eventName: string) => {},
      };

      const eventBus = new EventBus({
        test: [entry1, entry2, entry3],
      });

      expect(eventBus.eventMap.test).toHaveLength(3);
      expect(eventBus.eventMap.test[0].priority).toBe(entry2.priority);
      expect(eventBus.eventMap.test[0].handler).toBe(entry2.handler);
      expect(eventBus.eventMap.test[1].priority).toBe(entry1.priority);
      expect(eventBus.eventMap.test[1].handler).toBe(entry1.handler);
      expect(eventBus.eventMap.test[2].priority).toBe(entry3.priority);
      expect(eventBus.eventMap.test[2].handler).toBe(entry3.handler);
    });
  });

  describe("on", () => {
    let eventBus: EventBus;

    beforeEach(() => {
      eventBus = new EventBus();
    });

    it("stores a new entry with the priority to 0 when handler callback is given in parameter", () => {
      const eventHandler = (_event: unknown, _eventName: string) => {};
      eventBus.on("test", eventHandler);
      expect(eventBus.eventMap.test).toHaveLength(1);
      expect(eventBus.eventMap.test[0].priority).toBe(0);
      expect(eventBus.eventMap.test[0].handler).toBe(eventHandler);
    });

    it("stores a new entry with the correct priority when full entry is given in parameter", () => {
      const eventHandler = (_event: unknown, _eventName: string) => {};
      eventBus.on("test", {
        priority: 99,
        handler: eventHandler,
      });
      expect(eventBus.eventMap.test).toHaveLength(1);
      expect(eventBus.eventMap.test[0].priority).toBe(99);
      expect(eventBus.eventMap.test[0].handler).toBe(eventHandler);
    });

    it("stores and sorts entries from the highest to the lowest priority when method is called multiple times", () => {
      const entry1 = {
        priority: 0,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry2 = {
        priority: 99,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry3 = {
        priority: -42,
        handler: (_event: unknown, _eventName: string) => {},
      };

      eventBus.on("test", entry1);
      eventBus.on("test", entry2);
      eventBus.on("test", entry3);
      expect(eventBus.eventMap.test).toHaveLength(3);
      expect(eventBus.eventMap.test[0].priority).toBe(entry2.priority);
      expect(eventBus.eventMap.test[0].handler).toBe(entry2.handler);
      expect(eventBus.eventMap.test[1].priority).toBe(entry1.priority);
      expect(eventBus.eventMap.test[1].handler).toBe(entry1.handler);
      expect(eventBus.eventMap.test[2].priority).toBe(entry3.priority);
      expect(eventBus.eventMap.test[2].handler).toBe(entry3.handler);
    });

    it("stores and sorts entries from the highest to the lowest priority when method once with an array of entries", () => {
      const entry1 = {
        priority: 0,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry2 = {
        priority: 99,
        handler: (_event: unknown, _eventName: string) => {},
      };
      const entry3 = {
        priority: -42,
        handler: (_event: unknown, _eventName: string) => {},
      };

      eventBus.on("test", [entry1, entry2, entry3]);
      expect(eventBus.eventMap.test).toHaveLength(3);
      expect(eventBus.eventMap.test[0].priority).toBe(entry2.priority);
      expect(eventBus.eventMap.test[0].handler).toBe(entry2.handler);
      expect(eventBus.eventMap.test[1].priority).toBe(entry1.priority);
      expect(eventBus.eventMap.test[1].handler).toBe(entry1.handler);
      expect(eventBus.eventMap.test[2].priority).toBe(entry3.priority);
      expect(eventBus.eventMap.test[2].handler).toBe(entry3.handler);
    });

    it.each([
      [
        "the priority is not a number in a single entry",
        {
          priority: "not a number" as unknown as number,
          handler: () => {},
        },
      ],
      [
        "the priority is not a number in an array of entries",
        [
          {
            priority: 0,
            handler: () => {},
          },
          {
            priority: "not a number" as unknown as number,
            handler: () => {},
          },
        ],
      ],
      [
        "the handler is not a function and not a callback in a single handler",
        "not a function" as unknown as () => void,
      ],
      [
        "the handler is not a function and not a callback in a single entry",
        {
          priority: 0,
          handler: "not a function" as unknown as () => void,
        },
      ],
      [
        "the handler is not a function and not a callback in an array of entries",
        [
          {
            priority: 0,
            handler: () => {},
          },
          {
            priority: 0,
            handler: "not a function" as unknown as () => void,
          },
        ],
      ],
    ])("throws an error when %s", (_, arg) => {
      expect(() => eventBus.on("test", arg)).toThrow();
    });
  });

  describe("emit", () => {
    let eventBus: EventBus;

    beforeEach(() => {
      eventBus = new EventBus();
    });

    it("calls the handlers with the correct event and eventName", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      eventBus.on("test", [handler1, handler2, handler3]);

      await eventBus.emit("test", { message: "This is a test" });

      expect(handler1).toHaveBeenCalledWith(
        { message: "This is a test" },
        "test",
      );
      expect(handler2).toHaveBeenCalledWith(
        { message: "This is a test" },
        "test",
      );
      expect(handler3).toHaveBeenCalledWith(
        { message: "This is a test" },
        "test",
      );
    });

    it("calls the handler with no event data when no parameter is given", async () => {
      const handler = vi.fn();
      eventBus.on("test", handler);

      await eventBus.emit("test");

      expect(handler).toHaveBeenCalledWith(undefined, "test");
    });

    it("calls the handlers in the correct order", async () => {
      const callOrder: string[] = [];
      const entry1 = {
        priority: 0,
        handler: vi.fn().mockImplementation(() => callOrder.push("entry1")),
      };
      const entry2 = {
        priority: 99,
        handler: vi.fn().mockImplementation(() => callOrder.push("entry2")),
      };
      const entry3 = {
        priority: -42,
        handler: vi.fn().mockImplementation(() => callOrder.push("entry3")),
      };
      eventBus.on("test", [entry1, entry2, entry3]);

      await eventBus.emit("test", { message: "This is a test" });

      expect(callOrder).toEqual(["entry2", "entry1", "entry3"]);
    });

    it("calls the async & non-async handlers in the correct order", async () => {
      const waitMs = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const callOrder: string[] = [];
      const entry1 = {
        priority: 0,
        handler: vi.fn().mockImplementation(async () => {
          await waitMs(20);
          callOrder.push("entry1");
        }),
      };
      const entry2 = {
        priority: 99,
        handler: vi.fn().mockImplementation(async () => {
          await waitMs(100);
          callOrder.push("entry2");
        }),
      };
      const entry3 = {
        priority: -42,
        handler: vi.fn().mockImplementation(() => callOrder.push("entry3")),
      };
      const entry4 = {
        priority: -99,
        handler: vi.fn().mockImplementation(async () => {
          await waitMs(30);
          callOrder.push("entry4");
        }),
      };
      eventBus.on("test", [entry1, entry2, entry3, entry4]);

      await eventBus.emit("test", { message: "This is a test" });

      expect(callOrder).toEqual(["entry2", "entry1", "entry3", "entry4"]);
    });

    it("doesn't call any handler when emitted event is not of the correct one", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      eventBus.on("test", [handler1, handler2, handler3]);

      await eventBus.emit("other-test", { message: "This is a test" });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).not.toHaveBeenCalled();
    });

    it("doesn't throw an error when no handler is registered for the emmited event", () => {
      expect(() =>
        eventBus.emit("test", { message: "This is a test" }),
      ).not.toThrow();
    });
  });
});

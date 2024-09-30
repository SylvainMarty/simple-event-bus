import { SimpleEventBusModule } from "@lib/simple-event-bus";
import {
  EventSubscriber,
  On,
} from "@lib/simple-event-bus/event-handler.decorator";
import { Inject, Injectable, Module } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@sylvmty/simple-event-bus";

@Injectable()
@EventSubscriber()
class AppSubscriberTest {
  callOrder: string[] = [];
  spy: Record<keyof Omit<AppSubscriberTest, "spy" | "callOrder">, jest.Mock> = {
    singleEventHandler: jest.fn(),
    singleEventHandlerTriggerOtherEvent: jest.fn(),
    multipleEventHandlers: jest.fn(),
    multipleEventHandlersWithPriority: jest.fn(),
    singleAsyncEventHandler: jest.fn(),
  };
  constructor(private readonly eventBus: EventBus) {}

  @On("myEvent")
  singleEventHandler(message: string) {
    this.spy.singleEventHandler(message);
    this.callOrder.push("singleEventHandler");
  }

  @On("myEvent")
  async singleEventHandlerTriggerOtherEvent(message: string) {
    this.spy.singleEventHandlerTriggerOtherEvent(message);
    await this.eventBus.emit("myOtherEvent", message);
    this.callOrder.push("singleEventHandlerTriggerOtherEvent");
  }

  @On(["myEvent", "myOtherEvent"])
  multipleEventHandlers(message: string, eventName: string) {
    this.spy.multipleEventHandlers(message, eventName);
    this.callOrder.push("multipleEventHandlers");
  }

  @On({
    myEvent: 99,
    myOtherEvent: -42,
  })
  multipleEventHandlersWithPriority(message: string, eventName: string) {
    this.spy.multipleEventHandlersWithPriority(message, eventName);
    this.callOrder.push("multipleEventHandlersWithPriority");
  }

  @On("myEvent")
  async singleAsyncEventHandler(message: string, eventName: string) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.spy.singleAsyncEventHandler(message, eventName);
    this.callOrder.push("singleAsyncEventHandler");
  }
}

describe("EventBus usage", () => {
  [
    [
      "with SimpleEventBusModule.forRoot()",
      () => SimpleEventBusModule.forRoot(),
    ],
    [
      "with SimpleEventBusModule.register()",
      () => SimpleEventBusModule.register(),
    ],
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ].forEach(([description, simpleEventModuleFactory]: [string, () => any]) => {
    describe(description, () => {
      let eventBus: EventBus;
      let subscriber: AppSubscriberTest;

      beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
          imports: [simpleEventModuleFactory()],
          providers: [AppSubscriberTest],
        }).compile();
        await app.init();

        subscriber = app.get<AppSubscriberTest>(AppSubscriberTest);

        eventBus = app.get<EventBus>(EventBus);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it("should be defined", () => {
        expect(eventBus).toBeDefined();
      });

      it("calls the handlers with the correct event and eventName", async () => {
        await eventBus.emit("myEvent", "Hello world!");

        expect(subscriber.spy.singleEventHandler).toHaveBeenCalledWith(
          "Hello world!",
        );
        expect(
          subscriber.spy.singleEventHandlerTriggerOtherEvent,
        ).toHaveBeenCalledWith("Hello world!");
        expect(subscriber.spy.multipleEventHandlers).toHaveBeenCalledTimes(2);
        expect(subscriber.spy.multipleEventHandlers).toHaveBeenCalledWith(
          "Hello world!",
          "myOtherEvent",
        );
        expect(subscriber.spy.multipleEventHandlers).toHaveBeenCalledWith(
          "Hello world!",
          "myEvent",
        );
        expect(
          subscriber.spy.multipleEventHandlersWithPriority,
        ).toHaveBeenCalledTimes(2);
        expect(
          subscriber.spy.multipleEventHandlersWithPriority,
        ).toHaveBeenCalledWith("Hello world!", "myEvent");
        expect(
          subscriber.spy.multipleEventHandlersWithPriority,
        ).toHaveBeenCalledWith("Hello world!", "myOtherEvent");
        expect(subscriber.spy.singleAsyncEventHandler).toHaveBeenCalledWith(
          "Hello world!",
          "myEvent",
        );
      });

      it("calls the handlers in the correct order", async () => {
        await eventBus.emit("myEvent", "Hello world!");

        expect(subscriber.callOrder).toEqual([
          "multipleEventHandlersWithPriority",
          "singleEventHandler",
          "multipleEventHandlers",
          "multipleEventHandlersWithPriority",
          "singleEventHandlerTriggerOtherEvent",
          "multipleEventHandlers",
          "singleAsyncEventHandler",
        ]);
      });
    });
  });
});

describe("EventBus service scope", () => {
  describe("can resolve dependencies", () => {
    [
      [
        "from global module with SimpleEventBusModule.register({ isGlobal: true })",
        () => SimpleEventBusModule.register({ isGlobal: true }),
      ],
      [
        "from global module with SimpleEventBusModule.forRoot()",
        () => SimpleEventBusModule.forRoot(),
      ],
    ].forEach(
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ([description, simpleEventModuleFactory]: [string, () => any]) => {
        describe(description, () => {
          it("doesn't throws a dependency error", async () => {
            @Module({
              imports: [simpleEventModuleFactory()],
            })
            class AppModule {}

            @Module({
              providers: [AppSubscriberTest],
            })
            class OtherModule {}

            await expect(async () => {
              const app: TestingModule = await Test.createTestingModule({
                imports: [AppModule, OtherModule],
              }).compile();
              await app.init();
            }).not.toThrow();
          });
        });
      },
    );
  });

  describe("Cannot resolve dependencies", () => {
    describe("between modules with SimpleEventBusModule.register()", () => {
      const consoleBackup = global.console;

      beforeEach(() => {
        global.console = jest.fn() as unknown as Console;
      });

      afterEach(() => {
        global.console = consoleBackup;
      });

      it("throws a dependency error", async () => {
        expect.assertions(1);

        @Module({
          imports: [SimpleEventBusModule.register()],
        })
        class AppModule {}

        @Module({
          providers: [AppSubscriberTest],
        })
        class OtherModule {}

        try {
          const app: TestingModule = await Test.createTestingModule({
            imports: [AppModule, OtherModule],
          }).compile();
          await app.init();
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});

describe("Multiple EventBus instances with SimpleEventBusModule.register()", () => {
  const EVENT_BUS_2_TOKEN = Symbol("event-bus-2");

  @Injectable()
  @EventSubscriber()
  class AppSubscriberTest2 {
    spy: Record<keyof Omit<AppSubscriberTest2, "spy">, jest.Mock> = {
      singleEventHandler: jest.fn(),
      multipleEventHandlers: jest.fn(),
    };
    constructor(
      @Inject(EVENT_BUS_2_TOKEN)
      private readonly eventBus2: EventBus,
    ) {}

    @On(["myEvent", { token: EVENT_BUS_2_TOKEN }])
    singleEventHandler(message: string) {
      this.spy.singleEventHandler(message);
      this.eventBus2.emit("myOtherEvent", message);
    }

    @On([["myEvent", "myOtherEvent"], { token: EVENT_BUS_2_TOKEN }])
    multipleEventHandlers(message: string) {
      this.spy.multipleEventHandlers(message);
    }
  }

  @Module({
    imports: [SimpleEventBusModule.register()],
    providers: [AppSubscriberTest],
  })
  class AppModule {}

  @Module({
    imports: [
      SimpleEventBusModule.register({ eventBusToken: EVENT_BUS_2_TOKEN }),
    ],
    providers: [AppSubscriberTest2],
  })
  class OtherModule {}

  let defaultEventBus: EventBus;
  let eventBus2: EventBus;
  let subscriber1: AppSubscriberTest;
  let subscriber2: AppSubscriberTest2;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OtherModule],
    }).compile();
    await app.init();

    subscriber1 = app.get<AppSubscriberTest>(AppSubscriberTest);
    subscriber2 = app.get<AppSubscriberTest2>(AppSubscriberTest2);

    defaultEventBus = app.get<EventBus>(EventBus);
    eventBus2 = app.get<EventBus>(EVENT_BUS_2_TOKEN);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("all services should be defined", () => {
    expect(defaultEventBus).toBeDefined();
    expect(eventBus2).toBeDefined();
    expect(subscriber1).toBeDefined();
    expect(subscriber2).toBeDefined();
  });

  it("calls the handlers of the subscriber 1 and not the subscriber 2 when using the default event bus", async () => {
    await defaultEventBus.emit("myEvent", "Hello world!");

    expect(subscriber1.spy.singleEventHandler).toHaveBeenCalledTimes(1);
    expect(
      subscriber1.spy.singleEventHandlerTriggerOtherEvent,
    ).toHaveBeenCalledTimes(1);
    expect(subscriber1.spy.multipleEventHandlers).toHaveBeenCalledTimes(2);
    expect(
      subscriber1.spy.multipleEventHandlersWithPriority,
    ).toHaveBeenCalledTimes(2);
    expect(subscriber1.spy.singleAsyncEventHandler).toHaveBeenCalledTimes(1);
    expect(subscriber2.spy.singleEventHandler).not.toHaveBeenCalled();
    expect(subscriber2.spy.multipleEventHandlers).not.toHaveBeenCalled();
  });

  it("calls the handlers of the subscriber 2 and not the subscriber 1 when using the event bus 2", async () => {
    await eventBus2.emit("myEvent", "Hello world!");

    expect(subscriber2.spy.singleEventHandler).toHaveBeenCalledTimes(1);
    expect(subscriber2.spy.multipleEventHandlers).toHaveBeenCalledTimes(2);
    expect(subscriber1.spy.singleEventHandler).not.toHaveBeenCalled();
    expect(
      subscriber1.spy.singleEventHandlerTriggerOtherEvent,
    ).not.toHaveBeenCalled();
    expect(subscriber1.spy.multipleEventHandlers).not.toHaveBeenCalled();
    expect(
      subscriber1.spy.multipleEventHandlersWithPriority,
    ).not.toHaveBeenCalled();
    expect(subscriber1.spy.singleAsyncEventHandler).not.toHaveBeenCalled();
  });
});

import { Inject, Injectable, InjectionToken } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, ModuleRef } from "@nestjs/core";
import { EventBus, EventMapEntryType } from "@sylvmty/simple-event-bus";
import {
  DEFAULT_SIMPLE_EVENT_BUS_TOKEN,
  SIMPLE_EVENT_BUS_TOKEN,
} from "./constants";
import {
  EventSubscriber,
  On,
  OnEventOptions,
  OnEventParams,
} from "./event-handler.decorator";

type ComputedEventEntry = {
  eventBusToken: string | symbol;
  eventName: string;
  priority: number;
};

@Injectable()
export class SimpleEventBusSubscriberRegistry {
  private tokenInjectionRecord: Record<string | symbol, InjectionToken> = {};

  constructor(
    @Inject(SIMPLE_EVENT_BUS_TOKEN)
    private readonly eventBusToken: symbol,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    const entriesByEventBusToken = this.getEntriesByEventBusToken();
    for (const [eventBusToken, handlers] of Object.entries(
      entriesByEventBusToken,
    )) {
      const realToken =
        this.tokenInjectionRecord[eventBusToken] ?? eventBusToken;
      if (realToken !== this.eventBusToken) {
        continue;
      }
      const eventBus = this.moduleRef.get<EventBus>(realToken);
      if (!eventBus) {
        throw new Error(`Event bus ${String(realToken)} not found`);
      }
      for (const [eventName, entries] of Object.entries(handlers)) {
        eventBus.on(eventName, entries);
      }
    }
  }

  getEntriesByEventBusToken(): Record<string | symbol, EventMapEntryType[]> {
    const handlers = this.discoveryService.getProviders({
      metadataKey: EventSubscriber.KEY,
    });

    const entriesByEventBusToken: Record<string | symbol, EventMapEntryType[]> =
      {};
    for (const wrapper of handlers) {
      const methodNames = this.metadataScanner.getAllMethodNames(
        wrapper.metatype.prototype,
      );
      for (const methodName of methodNames) {
        const events = this.discoveryService.getMetadataByDecorator(
          On,
          wrapper,
          methodName,
        );
        if (!events) {
          continue;
        }
        const computedEvents = this.prepareEntriesOrThrowError(events);

        for (const { eventName, priority, eventBusToken } of computedEvents) {
          if (!entriesByEventBusToken[eventBusToken]) {
            entriesByEventBusToken[eventBusToken] =
              {} as (typeof entriesByEventBusToken)[string];
          }
          if (!entriesByEventBusToken[eventBusToken][eventName]) {
            entriesByEventBusToken[eventBusToken][eventName] = [];
          }
          const subscriberInstance = this.moduleRef.get(wrapper.token, {
            strict: false,
          });
          entriesByEventBusToken[eventBusToken][eventName].push({
            priority,
            handler: subscriberInstance[methodName].bind(subscriberInstance),
          });
        }
      }
    }

    return entriesByEventBusToken;
  }

  private prepareEntriesOrThrowError(
    events: OnEventParams,
  ): ComputedEventEntry[] {
    let computedEvents: ComputedEventEntry[] = [];
    const defaultEventBusToken = this.convertInjectionTokenToString(
      DEFAULT_SIMPLE_EVENT_BUS_TOKEN,
    );
    if (!Array.isArray(events)) {
      if (typeof events === "string") {
        computedEvents = [
          {
            eventName: events,
            priority: 0,
            eventBusToken: defaultEventBusToken,
          },
        ];
      } else if (events instanceof Object) {
        computedEvents = Object.entries(events).map(
          ([eventName, priority]) => ({
            eventName,
            priority,
            eventBusToken: defaultEventBusToken,
          }),
        );
      } else {
        throw new Error("Invalid options passed to @On()");
      }
    } else if (Array.isArray(events) && events.length > 0) {
      if (typeof events[1] === "string") {
        computedEvents = (events as string[]).map((eventName: string) => ({
          eventName,
          priority: 0,
          eventBusToken: defaultEventBusToken,
        }));
      } else if (typeof events[0] === "string") {
        const opt = events[1] as OnEventOptions;
        const eventBusToken = this.convertInjectionTokenToString(
          opt?.token ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN,
        );
        computedEvents = [
          { eventName: events[0], priority: opt?.priority ?? 0, eventBusToken },
        ];
      } else if (Array.isArray(events[0])) {
        const opt = events[1] as OnEventOptions;
        const eventBusToken = this.convertInjectionTokenToString(
          opt?.token ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN,
        );
        computedEvents = events[0].map((eventName) => ({
          eventName,
          priority: opt?.priority ?? 0,
          eventBusToken,
        }));
      } else if (events[0] instanceof Object) {
        const eventBusToken = this.convertInjectionTokenToString(
          (events[1] as InjectionToken) ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN,
        );
        computedEvents = Object.entries(events).map(
          ([eventName, priority]) => ({ eventName, priority, eventBusToken }),
        );
      }
    } else {
      throw new Error("Invalid options passed to @On()");
    }
    return computedEvents;
  }

  private convertInjectionTokenToString(
    token: InjectionToken,
  ): string | symbol {
    if (typeof token === "string") {
      return token;
    }
    if (typeof token === "symbol") {
      const tokenString = token.toString();
      this.tokenInjectionRecord[tokenString] = token;
      return tokenString;
    }
    if ("name" in token) {
      this.tokenInjectionRecord[token.name] = token;
      return token.name;
    }
    throw new Error(`Invalid injection token: ${token}`);
  }
}

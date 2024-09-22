import { InjectionToken } from '@nestjs/common';
import { DEFAULT_SIMPLE_EVENT_BUS_TOKEN } from './constants';
import { EventMapEntryType } from 'simple-event-bus/src/EventBus';

const eventHandlersMap: Record<string | symbol, Record<string, EventMapEntryType[]>> = {};

export function getEventHandlersMapForToken(eventBusToken: InjectionToken): Record<string, EventMapEntryType[]> {
  const entries = eventHandlersMap[convertInjectionTokenToString(eventBusToken)];
  return entries ? Object.assign({}, entries) : {};
}

export function EventHandler(
  events: string | string[] | Record<string, number>,
  options?: {
    eventBusToken?: InjectionToken
  },
): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    if (!descriptor?.value) {
      throw new Error("Invalid decorator usage");
    }
    let eventBusToken = convertInjectionTokenToString(options?.eventBusToken ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN);
    let computedEvents: { eventName: string, priority: number }[] = [];
    if (!Array.isArray(events)) {
      if (typeof events === 'string') {
        computedEvents = [{ eventName: events, priority: 0 }];
      } else {
        computedEvents = Object.entries(events).map(([eventName, priority]) => ({ eventName, priority }));
      }
    } else if (events.length > 0) {
      computedEvents = events.map((eventName: string) => ({ eventName, priority: 0 }));
    }

    if (!eventHandlersMap[eventBusToken]) {
      eventHandlersMap[eventBusToken] = {};
    }
    for (const { eventName, priority } of computedEvents) {
      if (!eventHandlersMap[eventBusToken][eventName]) {
        eventHandlersMap[eventBusToken][eventName] = [];
      }
      eventHandlersMap[eventBusToken][eventName].push({
        priority,
        handler: descriptor.value!,
      });
    }
    return descriptor;
  };
}

function convertInjectionTokenToString(token: InjectionToken): string | symbol {
  if (typeof token === 'string' || typeof token === 'symbol') {
    return token;
  }
  if ("name" in token) {
    return token.name;
  }
  throw new Error(`Invalid injection token: ${token}`);
}

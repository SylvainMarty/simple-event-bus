import { Injectable, InjectionToken } from "@nestjs/common";
import { EventBus } from "simple-event-bus/src/EventBus";
import { getEventHandlersMapForToken } from "./event-handler.decorator";

@Injectable()
export class SimpleEventBusFactory {
  create(eventBusToken: InjectionToken): EventBus {
    return new EventBus(getEventHandlersMapForToken(eventBusToken));
  }
}

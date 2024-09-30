import {
  EventSubscriber,
  On,
} from "@lib/simple-event-bus/event-handler.decorator";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@sylvmty/simple-event-bus";

@Injectable()
@EventSubscriber()
export class AppSubscriber {
  constructor(private readonly eventBus: EventBus) {}

  @On("myEvent")
  singleEventHandler(message: string) {
    console.log("onMyEvent:", message);
  }

  @On("myEvent")
  singleEventHandlerTriggerOtherEvent(message: string) {
    this.triggerOtherEvent(message);
  }

  @On(["myEvent", "myOtherEvent"])
  multipleEventHandlers(message: string, eventName: string) {
    console.log(`on_${eventName}:`, message);
  }

  @On({
    myEvent: 99,
    myOtherEvent: -42,
  })
  multipleEventHandlersWithPriority(message: string, eventName: string) {
    console.log(`on_${eventName}:`, message);
  }

  private triggerOtherEvent(message: string) {
    this.eventBus.emit("myOtherEvent", message);
  }
}

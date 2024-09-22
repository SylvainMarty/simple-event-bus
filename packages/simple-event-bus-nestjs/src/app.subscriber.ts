import { Injectable } from '@nestjs/common';
import { EventHandler } from '@lib/simple-event-bus/event-handler.decorator';

@Injectable()
export class AppSubscriber {
  @EventHandler('myEvent')
  singleEventHandler(message: string) {
    console.log('onMyEvent:', message);
  }

  @EventHandler(['myEvent', 'myOtherEvent'])
  multipleEventHandlers(message: string, eventName: string) {
    console.log(`on_${eventName}:`, message);
  }

  @EventHandler({
    myEvent: 99,
    myOtherEvent: -42,
  })
  multipleEventHandlersWithPriority(message: string, eventName: string) {
    console.log(`on_${eventName}:`, message);
  }
}

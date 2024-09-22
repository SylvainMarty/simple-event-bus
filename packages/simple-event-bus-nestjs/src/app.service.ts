import { Injectable } from '@nestjs/common';
import { EventBus } from 'simple-event-bus/src/EventBus';

@Injectable()
export class AppService {
  constructor(private readonly eventBus: EventBus) { }

  triggerEvent() {
    this.eventBus.emit('myEvent', 'Hello world!');
  }
}

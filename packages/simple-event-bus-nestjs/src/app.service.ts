import { Injectable } from '@nestjs/common';
import { EventBus } from '@sylvmty/simple-event-bus';

@Injectable()
export class AppService {
  constructor(private readonly eventBus: EventBus) { }

  triggerEvent() {
    this.eventBus.emit('myEvent', 'Hello world!');
  }
}

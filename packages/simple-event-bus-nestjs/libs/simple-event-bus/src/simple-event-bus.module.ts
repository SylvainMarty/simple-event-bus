import { DynamicModule, Provider, InjectionToken } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventBus } from '@sylvmty/simple-event-bus';
import { DEFAULT_SIMPLE_EVENT_BUS_TOKEN, SIMPLE_EVENT_BUS_TOKEN } from './constants';
import { SimpleEventBusSubscriberRegistry } from './simple-event-bus-subscriber.registry';

export type SimpleEventBusModuleOptions = {
  isGlobal?: boolean,
  eventBusToken?: InjectionToken
};

const createSimpleEventBusProvider: (eventBusToken: InjectionToken) => Provider = (eventBusToken) => ({
  provide: eventBusToken,
  useFactory: () => new EventBus(),
});

export class SimpleEventBusModule {
  static register(options?: SimpleEventBusModuleOptions): DynamicModule {
    const eventBusToken = options?.eventBusToken ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN;
    return {
      global: !!options?.isGlobal,
      module: SimpleEventBusModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: SIMPLE_EVENT_BUS_TOKEN,
          useValue: eventBusToken,
        },
        SimpleEventBusSubscriberRegistry,
        createSimpleEventBusProvider(eventBusToken)
      ],
      exports: [eventBusToken],
    };
  }

  static forRoot(eventBusToken?: InjectionToken): DynamicModule {
    return SimpleEventBusModule.register({
      isGlobal: true,
      eventBusToken,
    });
  }
}

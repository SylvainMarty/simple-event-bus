import { DynamicModule, Module, Provider, InjectionToken } from '@nestjs/common';
import { DEFAULT_SIMPLE_EVENT_BUS_TOKEN } from './constants';
import { SimpleEventBusFactory } from './simple-event-bus.factory';

export type SimpleEventBusModuleOptions = {
  isGlobal: boolean,
  eventBusToken?: InjectionToken
};

const createSimpleEventBusProvider: (eventBusToken: InjectionToken) => Provider = (eventBusToken) => ({
  provide: eventBusToken,
  useFactory: (factory: SimpleEventBusFactory) => factory.create(eventBusToken),
  inject: [SimpleEventBusFactory],
});

@Module({
  providers: [SimpleEventBusFactory, createSimpleEventBusProvider(DEFAULT_SIMPLE_EVENT_BUS_TOKEN)],
  exports: [DEFAULT_SIMPLE_EVENT_BUS_TOKEN],
})
export class SimpleEventBusModule {
  static register(options?: SimpleEventBusModuleOptions): DynamicModule {
    const eventBusToken = options?.eventBusToken ?? DEFAULT_SIMPLE_EVENT_BUS_TOKEN;
    return {
      global: !!options?.isGlobal,
      module: SimpleEventBusModule,
      providers: [SimpleEventBusFactory, createSimpleEventBusProvider(eventBusToken)],
      exports: [eventBusToken],
    }
  }

  static forRoot(eventBusToken?: InjectionToken): DynamicModule {
    return SimpleEventBusModule.register({
      isGlobal: true,
      eventBusToken,
    });
  }
}

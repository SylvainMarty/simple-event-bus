import { InjectionToken } from '@nestjs/common';
import { EventMapEntryType } from '@sylvmty/simple-event-bus';
import { DiscoveryService } from '@nestjs/core';

export type OnEventWithToken = { token?: InjectionToken };
export type OnEventOptions = {
  priority?: EventMapEntryType["priority"],
  token?: InjectionToken
};
export type OnEventParams =
  | string
  | Record<string, number>
  | string[]
  | [string, OnEventOptions]
  | [string[], OnEventOptions]
  | [Record<string, number>, InjectionToken];

export const EventSubscriber = DiscoveryService.createDecorator();
export const On = DiscoveryService.createDecorator<OnEventParams>();

import { InjectionToken } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { EventMapEntryType } from "@sylvmty/simple-event-bus";

export type OnEventWithToken = { token?: InjectionToken };
export type OnEventOptions = {
  priority?: EventMapEntryType["priority"];
  token?: InjectionToken;
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

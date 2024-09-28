export type EventHandler =
  | (<T>(event: T, eventName: string) => void)
  | (<T>(event: T) => void)
  | (<T>(event: T, eventName: string) => Promise<void>)
  | (<T>(event: T) => Promise<void>)

export interface EventMapEntryType {
  priority: number
  handler: EventHandler
}

export class EventBus {
  public readonly eventMap: Record<string, EventMapEntryType[]> = {}

  constructor(eventMap: Record<string, EventMapEntryType[]> = {}) {
    for (const [eventName, entries] of Object.entries(eventMap)) {
      this.on(eventName, entries)
    }
  }

  on(
    eventName: string,
    args: EventHandler | EventMapEntryType | EventHandler[] | EventMapEntryType[],
  ): void {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = []
    }
    const entries = Array.isArray(args) ? args : [args]
    for (const entry of entries) {
      this.eventMap[eventName].push(this.validateAndPrepareEntry(entry))
    }
    this.eventMap[eventName].sort((a, b) => b.priority - a.priority)
  }

  private validateAndPrepareEntry(arg: EventHandler | EventMapEntryType): EventMapEntryType {
    const entry = 'priority' in arg ? arg : { priority: 0, handler: arg }
    if (typeof entry.priority !== 'number') {
      throw new TypeError('Event handler priority must be a number')
    }
    if (typeof entry.handler !== 'function') {
      throw new TypeError('Event handler must be a function')
    }
    return entry
  }

  async emit<T>(eventName: string, eventData?: T): Promise<void> {
    if (!this.eventMap[eventName]) {
      return
    }
    for (const entry of this.eventMap[eventName]) {
      await entry.handler(eventData, eventName)
    }
  }
}

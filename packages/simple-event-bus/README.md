# Simple Event Bus native TypeScript package

```bash
# NPM
npm i --save simple-event-bus
# PNPM
pnpm add --save simple-event-bus
# Yarn
yarn add simple-event-bus
```

## How to use this library

### Basic usage
```ts
import { EventBus } from 'simple-event-bus'

const eventBus = new EventBus()

eventBus.on('myEvent', (message: string, eventName: string) => {
  console.log('Handler 1:', message, `(event name: ${eventName})`)
})
eventBus.on('myEvent', async (message: string, eventName: string) => {
  console.log('Handler 2:', message, `(event name: ${eventName})`)
})

eventBus.emit('myEvent', 'This is a message')

// Output:
// Handler 1: This is a message (event name: myEvent)
// Handler 2: This is a message (event name: myEvent)
```

### Advanced usage with priorities

By default, all event handlers are executed in the order they were registered.
You can change the order by giving a priority to specific event handler.
Event handlers with higher priority will be executed first.

```ts
import { EventBus } from 'simple-event-bus'

const eventBus = new EventBus()

interface MyEvent {
  message: string
}

eventBus.on('myEvent', {
  priority: 9,
  handler: (event: MyEvent) => {
    console.log('handler with priority 9 executed third', event)
  }
})
eventBus.on('myEvent', {
  priority: -9,
  handler: (event: MyEvent) => {
    console.log('handler with priority -9 executed first', event)
  }
})
eventBus.on('myEvent', (event: MyEvent) => {
  console.log('handler with priority 0 executed second', event)
})

eventBus.emit('myEvent', {
  message: 'This is a new event',
})

// Output:
// handler with priority -9 executed first { message: 'This is a new event' }
// handler with priority 0 executed second { message: 'This is a new event' }
// handler with priority 9 executed third { message: 'This is a new event' }
```

### Setup flexibility
```ts
import { EventBus } from 'simple-event-bus'

const eventBus = new EventBus({
  event1: [() => console.log('#1: event1')],
  event2: [
    {
      priority: 1,
      handler: () => console.log('#1: event2'),
    },
    {
      priority: 2,
      handler: () => console.log('#2: event2'),
    }
  ],
  event3: [
    {
      priority: -99,
      handler: () => console.log('#3: event3'),
    },
    () => console.log('#1: event3'),
    () => console.log('#2: event3'),
  ],
})

eventBus.emit('event1')
// Output:
// #1: event1

eventBus.emit('event2')
// Output:
// #1: event2
// #2: event2

eventBus.emit('event3')
// Output:
// #1: event3
// #2: event3
// #3: event3

eventBus.on('event4', () => console.log('#1: event4'))
eventBus.on('event4', [
  () => console.log('#2: event4'),
  () => console.log('#3: event4'),
])
eventBus.on('event4', {
  priority: 99,
  handler: () => console.log('#4: event4'),
})

eventBus.emit('event4')
// Output:
// #1: event4
// #2: event4
// #3: event4
// #3: event4
```

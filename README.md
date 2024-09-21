# Simple event bus
![](https://github.com/SylvainMarty/simple-event-bus/workflows/ci.yml/badge.svg)

A simple, no-dependency, synchronous event bus written in TypeScript

```bash
# NPM
npm i --save simple-event-bus
# PNPM
pnpm add --save simple-event-bus
# Yarn
yarn add simple-event-bus
```

## Features

* Native TypeScript support
* No dependencies
* Synchronous event bus
* Event handlers with priority (sorted execution)
* Easy to use
* Lightweight: 0.88 kB (0.39 kB with gzip)
* Compiled in ESM, CJS, UMD for convenience

## Motivations

I decided to create my own library after using [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) for some time in my projects.

I found it too complex for my needs and it was also lacking some features like prioritized event handlers.

## How to use this library

### Basic usage
```ts
import { EventBus } from 'simple-event-bus'

const eventBus = new EventBus()

eventBus.addEventHandlerEntry('myEvent', (message: string, eventName: string) => {
  console.log(message, `(event name: ${eventName})`)
})

eventBus.emit('myEvent', 'This is a message')

// Output:
// This is a message (event name: myEvent)
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

eventBus.addEventHandlerEntry('myEvent', {
  priority: 9,
  handler: (event: MyEvent) => {
    console.log('handler with priority 9 executed third', event)
  }
})
eventBus.addEventHandlerEntry('myEvent', {
  priority: -9,
  handler: (event: MyEvent) => {
    console.log('handler with priority -9 executed first', event)
  }
})
eventBus.addEventHandlerEntry('myEvent', (event: MyEvent) => {
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

eventBus.addEventHandlerEntry('event4', () => console.log('#1: event4'))
eventBus.addEventHandlerEntry('event4', [
  () => console.log('#2: event4'),
  () => console.log('#3: event4'),
])
eventBus.addEventHandlerEntry('event4', {
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

## Contribute

If you have an idea for an improvement, feel free to fork this repository and submit a PR!

### Requirements

* Node.js LTS (you can use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions)
* pnpm (`npm install -g pnpm`)

### Install dependencies

```bash
pnpm install
```

### Scripts

The template contains the following `pnpm` scripts:

* `dev` - Start the file watcher (will recompile the code on source file change)
* `build` - Build for production
* `lint` - Checks your code for any linting errors
* `test` - Run all tests
* `test:watch` - Run all tests with watch mode
* `test:coverage` - Run all tests with code coverage report

## License

This repository under the [MIT License](LICENSE), feel free to use it and modify it.

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
* NestJS native package

## Motivations

I decided to create my own library after using [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) for some time in my projects.

I found it too complex for my needs and it was also lacking some features like prioritized event handlers.

## Documentations

### Example
```ts
import { EventBus } from 'simple-event-bus'

const eventBus = new EventBus()

eventBus.addEventHandlerEntry('myEvent', (message: string, eventName: string) => {
  console.log("Handler 1:", message, `(event name: ${eventName})`)
})
eventBus.addEventHandlerEntry('myEvent', (message: string, eventName: string) => {
  console.log("Handler 2:", message, `(event name: ${eventName})`)
})

eventBus.emit('myEvent', 'This is a message')

// Output:
// Handler 1: This is a message (event name: myEvent)
// Handler 2: This is a message (event name: myEvent)
```

### [Native TypeScript package documentation](https://github.com/SylvainMarty/simple-event-bus/tree/main/packages/simple-event-bus)

### [NestJS package documentation](https://github.com/SylvainMarty/simple-event-bus/tree/main/packages/simple-event-bus)

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

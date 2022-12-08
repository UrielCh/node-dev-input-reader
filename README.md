# node-dev-input-reader

Read input from /dev/input/* on a linux Host.

Dual Stack package ESM + CJS, should work in deno

## Feature

* Detect double press / click
* Detect long press / click
* Detect Key combinaison
* Support hardware disconnect / reconnect.
* Can work from /dev/input/by-id/ and /dev/input/by-path/
* Detect device type (event/joystick/mouse)
* Writen in Typescript

## Usage

With raw events:
```typescript
    // use RAW event
    const reader = new DevInputReader('event0');
    reader.on('error', console.error)
      .on("keyup", (data) => console.log('keyup:', data))
      .on("keypress", (data) => console.log('keypress:', data));

```

With syntetic events (recommanded):
```typescript
    // use simple events
    const reader = new DevInputReader('event0'm { retryInterval: 10000});
    reader.on('error', console.error)
      .on("key", (data) => console.log('key:', data))
      .on("error", (data) => console.log('an error occure:', data))
    // data contain the durration of the press and the concurently press key
    // in case oh hardware lost, will reconnect every retryInterval 10sec
```

With syntetic events with double/long click detection (if needed):
```typescript
    // use simple events
    const reader = new DevInputReader('event0', { retryInterval: 10000, longPress: 5000, doublePress: 300 });
    reader.on('error', console.error)
      .on("simple", (data) => console.log('simple press:', data))
      .on("double", (data) => console.log('double press:', data))
      .on("long", (data) => console.log('long press:', data))
    // long press is trigered if you keep a key pressed for more than 5 seconds
    // double press is trigered if press a key 2 time within 300 ms
    // in case oh hardware lost, will reconnect every retryInterval 10sec
```

## FAQ

> Why a new Module ?

There is a lot of existing module that can deal with input:
- [dev-input](https://www.npmjs.com/package/dev-input) Looks nice in typescript, but no docs, only used by hist owner.
- [linux-keyboard-catcher](https://www.npmjs.com/package/linux-keyboard-catcher) highly Keyboard oriented, simple interface.
- [node-keylogger](https://www.npmjs.com/package/node-keylogger) very low level + forck from [node-keyboard](https://github.com/Bornholm/node-keyboard) + contains bug..
- [raw-keyboard](https://www.npmjs.com/package/raw-keyboard) very low level + use C code.

Relative package:
- [linux-key-info](https://www.npmjs.com/package/linux-key-info) Key mapping for keyboard, I may integrate it on day.

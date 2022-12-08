import fs, { ReadStream } from 'node:fs';
import { EventEmitter } from 'node:events';
import KeysCodes from './KeysCodes.js';
import delay from './delay.js';
import { KbEvent2, JsEvent, KbEvent } from './InputInterfaces.js';
import UnixTimeval from './UnixTimeval.js';
import { SUPPORTED_USB_DEVICE_TYPES, SUPPORTED_USB_DEVICE_TYPES_SET, EVENT_TYPES } from './enums.js';
import KeyInternalState, { KeyState } from './KeyInternalState.js';

export const standardEvents = ['error', 'connecting'] as const;
export const simpleEvents = ['keyup', 'keypress', 'keydown'] as const; // Keep this order
export const synticEvents = ['key', 'long', 'double', 'simple'] as const;

export type StandardEventsType = typeof standardEvents[number];
export type SimpleEventsType = typeof simpleEvents[number];
export type SynticEventsType = typeof synticEvents[number];

export type AllEventsType = StandardEventsType | SimpleEventsType | SynticEventsType | 'joystick';

export const specialEventsSet = new Set([...simpleEvents, ...synticEvents]) as Set<string>;

export interface DevInputReaderOption {
    retryInterval?: number;
    doublePress?: number;
    longPress?: number;
}

export default class DevInputReader extends EventEmitter {
    dev: string;
    devType?: typeof SUPPORTED_USB_DEVICE_TYPES[number];
    // eventPath?: string;
    data: ReadStream | null = null;
    // public keys = toKey;
    private options: DevInputReaderOption;

    listener = 0;

    public static registerKey(id: number, name: string): void {
        KeysCodes[id] = name;
    }

    constructor(dev: string, options?: DevInputReaderOption) {
        super();
        options = options || {};
        this.options = { ...options };
        this.dev = dev || 'event0';
    }

    private async startLoop() {
        while (this.options.retryInterval) {
            this.data = null;
            if (this.start()) {
                return;
            }
            await delay(this.options.retryInterval);
        }
    }

    private start() {
        this.emit('connecting', '');
        let eventPath = '';
        // this.buffer = Buffer.alloc(this.bufferSize);
        if (this.dev === 'dummy') {
            // for test only
            this.devType = 'event';
            return true;
        } else if (this.dev.startsWith('event'))
            eventPath = `/dev/input/${this.dev}`;
        else if (this.dev.startsWith('pci-'))
            eventPath = `/dev/input/by-path/${this.dev}`;
        else if (this.dev.startsWith('latform-'))
            eventPath = `/dev/input/by-path/${this.dev}`;
        else if (this.dev.startsWith('/'))
            eventPath = this.dev;
        else
            eventPath = `/dev/input/by-id/${this.dev}`;
        let lnk = eventPath;
        try {
            if (eventPath)
                fs.statSync(eventPath);
        } catch (e) {
            this.emit('error', Error(`Can not find dev "${eventPath}"`));
            return false;
        }
        try {
            if (eventPath)
                lnk = fs.readlinkSync(eventPath, 'utf8');
        } catch (e) {
            // keep lnk as its
        }
        const m = lnk.match(/\/([a-z]+)\d+$/);
        if (!m) {
            this.emit('error', Error(`Can Not identify device type from: "${lnk}"`));
            return false;
        }
        if (!SUPPORTED_USB_DEVICE_TYPES_SET.has(m[1])) {
            this.emit('error', Error(`Unknow input type for: ${lnk} Supported:${SUPPORTED_USB_DEVICE_TYPES.join(', ')}`));
            return false;
        }
        this.devType = m[1] as typeof SUPPORTED_USB_DEVICE_TYPES[number];

        if (!this.data) {
            this.data = fs.createReadStream(eventPath);
            if (this.devType === 'event')
                this.data.on('data', (data: Buffer) => {
                    const event: KbEvent | null = this.parseEvent(data);
                    if (event) {
                        this.digestEvent(event);
                    }
                });
            else if (this.devType === 'js')
                this.data.on('data', (data: Buffer) => {
                    const event: JsEvent | null = this.parseJoystick(data);
                    if (event) {
                        this.emit('joystick', event)
                    }
                });
            else if (this.devType === 'mouse')
                this.data.on('data', (data: Buffer) => {
                    this.parseMouse(data);
                });

            this.data.on('error', async err => {
                this.emit('error', err);
                if (this.options.retryInterval) {
                    await delay(this.options.retryInterval);
                    this.data = null;
                    this.startLoop();
                }
            });
        }
        return true;
    }

    private stop() {
        if (this.data) {
            this.data.close();
            this.data = null;
        }
    }

    private keyStatus: { [key: string]: KeyInternalState } = {};
    private keyCodePresses: Set<number> = new Set();
    private keyNamePresses: Set<string> = new Set();

    private async digestEvent(event: KbEvent): Promise<void> {
        const type: SimpleEventsType = event.type;

        this.emit(type, event);
        // get / init key internal state
        let keyStatus = this.keyStatus[event.keyCode];
        if (!keyStatus) {
            keyStatus = new KeyInternalState();
            this.keyStatus[event.keyCode] = keyStatus;
        }
        switch (event.type) {
            case 'keydown':
            case 'keypress': {
                keyStatus.state = KeyState.Down;
                keyStatus.prevDown = keyStatus.down;
                keyStatus.down = event.time;
                this.keyCodePresses.add(event.keyCode);
                if (event.keyName)
                    this.keyNamePresses.add(event.keyName);

                if (this.options.longPress) {
                    await delay(this.options.longPress);

                    if (keyStatus.state === KeyState.Down && keyStatus.down === event.time) {
                        this.emit('long', {
                            dev: this.dev,
                            time: keyStatus.down,
                            durationMs: this.options.longPress,
                            keyCode: event.keyCode,
                            keyName: event.keyName,
                            type: event.type,
                            keyCodePressed: [...this.keyCodePresses],
                            keyNamePressed: [...this.keyNamePresses],
                        } as KbEvent2);
                        keyStatus.flush();
                    }
                }
                break;
            }
            case 'keyup': {
                this.keyCodePresses.delete(event.keyCode);
                if (event.keyName)
                    this.keyNamePresses.delete(event.keyName);
                if (!keyStatus.down) {
                    // a long press already occured
                    return;
                }
                keyStatus.up = event.time;
                if (keyStatus.state === KeyState.Down) {
                    this.emit('key', {
                        dev: this.dev,
                        time: keyStatus.up,
                        durationMs: keyStatus.up.fromMs(keyStatus.down),
                        keyCode: event.keyCode,
                        keyName: event.keyName,
                        type: event.type,
                    } as KbEvent2);
                }
                keyStatus.state = KeyState.Up;
                keyStatus.prevUp = keyStatus.up;
                const durationDoubleMs = keyStatus.up.fromMs(keyStatus.prevDown);
                if (this.options.doublePress && (durationDoubleMs < this.options.doublePress)) {
                    this.emit('double', {
                        dev: this.dev,
                        time: keyStatus.up,
                        durationMs: durationDoubleMs,
                        keyCode: event.keyCode,
                        keyName: event.keyName,
                        type: event.type,
                        keyCodePressed: [...this.keyCodePresses],
                        keyNamePressed: [...this.keyNamePresses],
                    } as KbEvent2);
                    keyStatus.flush();
                } else {
                    if (this.options.doublePress)
                        await delay(this.options.doublePress)
                    if (keyStatus.up === event.time) {
                        this.emit('simple', {
                            dev: this.dev,
                            time: keyStatus.up,
                            durationMs: keyStatus.up.fromMs(keyStatus.down),
                            keyCode: event.keyCode,
                            keyName: event.keyName,
                            type: event.type,
                            keyCodePressed: [...this.keyCodePresses],
                            keyNamePressed: [...this.keyNamePresses],
                        } as KbEvent2);
                    }
                }
                break;
            }
        }
    }

    private parseEvent(data: Buffer): KbEvent | null {
        // if (this.devType === 'event') {
        if (data.length >= 48) {
            // 72 or 96
            const offset = 24;
            const evType = data.readUInt16LE(offset + 16);
            if (evType === 1) { // const EV_KEY = 1;
                const tv_sec = data.readUInt32LE(offset + 0);
                const tv_usec = data.readUInt32LE(offset + 8);
                const keyCode = data.readUInt16LE(offset + 18);
                const type = data.readUInt32LE(offset + 20);
                return {
                    dev: this.dev,
                    time: new UnixTimeval(tv_sec, tv_usec),
                    keyCode,
                    keyName: KeysCodes[keyCode],
                    type: EVENT_TYPES[type],
                } as KbEvent;
            }
        }
        return null;
    }

    private parseJoystick(data: Buffer): JsEvent | null {
        // } else if (this.devType === 'js') {
        const ts = data.readUInt32LE(0);
        const value = data.readInt16LE(4);
        const type = data.readUInt8(6);
        const number = data.readUInt8(7);
        return {
            dev: this.devType,
            ts,
            value,
            type,
            number,
        } as JsEvent
        // this.emit('joystick',  as JsEvent)
        // return null;
    }

    private parseMouse(data: Buffer): KbEvent | null {
        // } else if (this.devType === 'mouse') {
        // legacy mouse sould not be use anymore.
        if (data.length === 3) {
            const v1 = data.readUInt8(0);
            const v2 = data.readUInt8(1);
            const v3 = data.readUInt8(2);
            console.log(`mouse ${data.length}: ${v1} ${v2} ${v3}`);
        }
        //} else {
        //    console.log(`missing implementation for ${this.devType}`);
        //}
        return null;
    }

    ///////////////////////////
    // @param event EVENTS
    //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(event: string, listener: (...args: any[]) => void): this {
        if (specialEventsSet.has(event))
            throw Error(`once not implemented on event: "${event}"`);
        return super.once(event, listener);
    }

    removeAllListeners(event: string): this {
        if (specialEventsSet.has(event))
            throw Error(`removeAllListeners not implemented on event: "${event}"`);
        return super.removeAllListeners(event);
    }

    on(event: SimpleEventsType, listener: (event: KbEvent) => void): this;
    on(event: SynticEventsType, listener: (event: KbEvent2) => void): this;
    on(event: 'joystick', listener: (event: JsEvent) => void): this;
    on(event: 'connecting', listener: (event: string) => void): this;
    on(event: 'error', listener: (event: Error) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: AllEventsType, listener: (...args: any[]) => void): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.addListener(event as any, listener);
    }

    addListener(event: SimpleEventsType, listener: (event: KbEvent) => void): this;
    addListener(event: SynticEventsType, listener: (event: KbEvent2) => void): this;
    addListener(event: 'joystick', listener: (event: JsEvent) => void): this;
    addListener(event: 'connecting', listener: (event: string) => void): this;
    addListener(event: 'error', listener: (event: Error) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener(event: AllEventsType, listener: (...args: any[]) => void): this {
        super.on(event, listener);
        if (specialEventsSet.has(event) && ++this.listener === 1) {
            this.startLoop();
        }
        return this;
    }

    off(event: SimpleEventsType, listener: (event: KbEvent) => void): this;
    off(event: SynticEventsType, listener: (event: KbEvent2) => void): this;
    off(event: 'joystick', listener: (event: JsEvent) => void): this;
    off(event: 'connecting', listener: (event: string) => void): this;
    off(event: 'error', listener: (error: Error) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event: AllEventsType, listener: (...args: any[]) => void): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.removeListener(event as any, listener);
    }

    removeListener(event: SimpleEventsType, listener: (event: KbEvent) => void): this;
    removeListener(event: SynticEventsType, listener: (event: KbEvent2) => void): this;
    removeListener(event: 'joystick', listener: (event: JsEvent) => void): this;
    removeListener(event: 'connecting', listener: (event: string) => void): this;
    removeListener(event: 'error', listener: (error: Error) => void): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener(event: AllEventsType, listener: (...args: any[]) => void): this {
        super.off(event, listener);
        if (specialEventsSet.has(event) && --this.listener === 0) {
            this.stop();
        }
        return this;
    }

    emit(event: SimpleEventsType, data: KbEvent): boolean;
    emit(event: SynticEventsType, data: KbEvent2): boolean;
    emit(event: 'joystick', data: JsEvent): boolean;
    emit(event: 'connecting', data: string): boolean;
    emit(event: 'error', data: Error): boolean;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    emit(event: AllEventsType, data: any): boolean {
        return super.emit(event, data);
    }
}

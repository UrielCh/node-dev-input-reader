import { EVENT_TYPES } from "./enums";
import UnixTimeval from "./UnixTimeval";

export interface JsEvent {
    dev: string;
    ts: number,
    value: number;
    /**
     * #define JS_EVENT_BUTTON         0x01 // button pressed/released
     * #define JS_EVENT_AXIS           0x02 // joystick moved 
     * #define JS_EVENT_INIT           0x80 // initial state of device
     */
    type: number;
    /**
     * 1st Axis X	0
     * 1st Axis Y	1
     * 2nd Axis X	2
     * 2nd Axis Y	3
     */
    number: number,
}

export interface KbEvent {
    readonly dev: string;
    readonly time: UnixTimeval,
    readonly keyCode: number;
    readonly keyName: string,
    readonly type: typeof EVENT_TYPES[number],
}

export interface KbEvent2 extends KbEvent {
    readonly keyCodePressed: number[];
    readonly keyNamePressed: string[];
    readonly durationMs: number;
}

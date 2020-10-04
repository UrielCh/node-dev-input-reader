import { UnixTimeval } from ".";

export enum KeyState {
    Up = 0,
    Down = 1,
    Repeat = 2
}

export default class KeyInternalState {
    state!: KeyState;// 'down' | 'up';
    up!: UnixTimeval | null;
    down!: UnixTimeval | null;
    prevUp!: UnixTimeval | null;
    prevDown!: UnixTimeval | null;

    public constructor() {
        this.flush();
    }

    public flush() {
        this.state = KeyState.Up;
        this.up = null;
        this.down = null;
        this.prevUp = null;
        this.prevDown = null;
    }
}

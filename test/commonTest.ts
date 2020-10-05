import * as DIR from "../src/";
import KeysCodes from "../src/KeysCodes";

/**
 * Call private function
 * 
 */
export const privateDigestEvent = (reader: DIR.DevInputReader, event: DIR.KbEvent): Promise<void> => (reader as any).digestEvent(event);

export const newEvent = (type: DIR.SimpleEventsType, keyCode: number): DIR.KbEvent => {
  let now = Date.now();
  const time = new DIR.UnixTimeval(Math.floor(now / 1000), 1000 * (now % 1000));
  return {
    dev: 'dumy',
    time,
    keyCode: keyCode,
    keyName: KeysCodes[keyCode],
    type,
  } as DIR.KbEvent;
}

export function listenAction(reader: DIR.DevInputReader, actions: DIR.AllEventsType[]): string[] {
  const actionSet = new Set(actions);
  const array = [] as string[];

  const pushEv = (t: string) => (ev: DIR.KbEvent2 | DIR.KbEvent) => {
    let txt = `${t}${ev.keyName.replace(/KEY_/g, '')}`;
    if ((ev as DIR.KbEvent2).keyCodePressed && (ev as DIR.KbEvent2).keyCodePressed.length)
      txt += `[${(ev as DIR.KbEvent2).keyNamePressed.join(',').replace(/KEY_/g, '')}]`;
    array.push(txt)
  }

  if (actionSet.has("keyup"))
    reader.on("keyup", pushEv("up"));
  if (actionSet.has("keydown"))
    reader.on("keydown", pushEv("down"));
  if (actionSet.has("key"))
    reader.on("key", pushEv('key'));
  if (actionSet.has("simple"))
    reader.on("simple", pushEv('simple'));
  if (actionSet.has("double"))
    reader.on("double", pushEv('double'));
  if (actionSet.has("long"))
    reader.on("long", pushEv('long'));
  return array;
}

export enum TestKey {
  B = 48,
  N = 49,
}

export function preparEnv(actions: DIR.AllEventsType[], options?: DIR.DevInputReaderOption) {
  const reader = new DIR.DevInputReader('dummy', options);
  const array = listenAction(reader, actions);
  const ev = (type: DIR.SimpleEventsType, keyCode: number) => privateDigestEvent(reader, newEvent(type, keyCode));
  return { reader, array, ev };
}

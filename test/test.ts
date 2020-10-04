import { read } from "fs";
import { delay, DevInputReader, KbEvent, UnixTimeval } from "../src/";
import KeysCodes from "../src/KeysCodes";

DevInputReader.registerKey(288, 'PAD_X');
DevInputReader.registerKey(289, 'PAD_A');
DevInputReader.registerKey(290, 'PAD_B');
DevInputReader.registerKey(291, 'PAD_Y');
DevInputReader.registerKey(292, 'PAD_L1');
DevInputReader.registerKey(294, 'PAD_R1');
DevInputReader.registerKey(296, 'PAD_SELECT');
DevInputReader.registerKey(297, 'PAD_START');
DevInputReader.registerKey(272, 'MOUSE_Clic_L');
DevInputReader.registerKey(273, 'MOUSE_Clic_R');
DevInputReader.registerKey(274, 'MOUSE_Clic_M');

/**
 * https://www.kernel.org/doc/Documentation/input/input.txt
 * https://www.kernel.org/doc/Documentation/input/joystick-api.txt
 * 
 */
/**
 * joystick-api.txt
 * https://www.mjmwired.net/kernel/Documentation/input/joystick-api.txt
 * 
 */


function startTest(node: string) {
    const K0 = new DevInputReader(node, { retryInterval: 500, longPress: 2000, doublePress: 300 });
    // const K0 = new DevInputReader(node, {retryInterval: 5000} );
    K0.on('error', console.error)
        .on('connecting', () => console.log('cnx...'))
        // .on("keypress", (data) => console.log('keypress:', JSON.stringify(data)))
        .on("long", (data) => console.log('long:', JSON.stringify(data)))
        .on("simple", (data) => console.log('simple:', JSON.stringify(data)))
        .on("double", (data) => console.log('double:', JSON.stringify(data)))
}
//startTest('event5');
//startTest('usb-0810_usb_gamepad-event-joystick');
// startTest('usb-Antecer_AmusingKeyPadK6-event-kbd');


async function testAll() {
    const reader = new DevInputReader('dummy', { longPress: 2000, doublePress: 300 });
    // const digestEvent = (reader: DevInputReader, event: KbEvent): Promise<void> => (reader as any).digestEvent(event);
    const digestEvent = (event: KbEvent): Promise<void> => (reader as any).digestEvent(event);
    
    const newEvent = (type: 'keyup' | 'keypress' | 'keydown', keyCode: number): KbEvent => {
        let now = Date.now();
        const time = new UnixTimeval(Math.floor(now / 1000), 1000 * (now % 1000));
        return {
            dev: 'dumy',
            time,
            keyCode: keyCode,
            keyName: KeysCodes[keyCode],
            type,
        } as KbEvent;
    }

    reader.on

    digestEvent(newEvent('keydown', 48));
    await delay(100);
    digestEvent(newEvent('keyup', 48));
}

// private async digestEvent(event: KbEvent): Promise<void> {


// const K6 = new LinuxInputEvent('usb-Antecer_AmusingKeyPadK6-event-kbd');
// Ok 
// K6.on("keypress", (data) => { console.log(data) });
// Ok 
// K6.on("key", (data) => { console.log(data) });
// K6.on("double", (data) => { console.log(data) });
// K6.on("simple", (data) => { });
// const K5 = new Keyboard('event5');

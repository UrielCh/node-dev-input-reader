import { DevInputReader } from "../src/";

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
    const K0 = new DevInputReader(node, {retryInterval: 1000});
    K0.on('error', console.error)
    .on('connecting', () => console.log('cnx...'))
//    .on("keypress", (data) => console.log('keypress:', JSON.stringify(data)))
    .on("simple", (data) => console.log('simple:', JSON.stringify(data)))
    .on("double", (data) => console.log('double:', JSON.stringify(data)))
}
//startTest('event5');
//startTest('usb-0810_usb_gamepad-event-joystick');
startTest('usb-Antecer_AmusingKeyPadK6-event-kbd');

// const K6 = new LinuxInputEvent('usb-Antecer_AmusingKeyPadK6-event-kbd');
// Ok 
// K6.on("keypress", (data) => { console.log(data) });
// Ok 
// K6.on("key", (data) => { console.log(data) });
// K6.on("double", (data) => { console.log(data) });
// K6.on("simple", (data) => { });
// const K5 = new Keyboard('event5');

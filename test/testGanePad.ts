import assert from 'assert';
import * as DIR from "../src/index.js";
import { preparEnv } from "./commonTest.js";

describe('Test custom gamepad event', () => {
  const { array, ev } = preparEnv(['simple', 'double', 'long']);

  it('declar new Keys', async () => {
    DIR.DevInputReader.registerKey(288, 'PAD_X');
    DIR.DevInputReader.registerKey(289, 'PAD_A');
    DIR.DevInputReader.registerKey(290, 'PAD_B');
    DIR.DevInputReader.registerKey(291, 'PAD_Y');
    DIR.DevInputReader.registerKey(292, 'PAD_L1');
    DIR.DevInputReader.registerKey(294, 'PAD_R1');
    DIR.DevInputReader.registerKey(296, 'PAD_SELECT');
    DIR.DevInputReader.registerKey(297, 'PAD_START');
    DIR.DevInputReader.registerKey(272, 'MOUSE_Clic_L');
    DIR.DevInputReader.registerKey(273, 'MOUSE_Clic_R');
    DIR.DevInputReader.registerKey(274, 'MOUSE_Clic_M');
  });


  it('single', async () => {
    array.splice(0, array.length)
    ev('keydown', 289);
    await DIR.delay(1);
    ev('keyup', 289);
    await DIR.delay(1);
    ev('keydown', 290);
    await DIR.delay(1);
    ev('keyup', 290);
    await DIR.delay(1);
    assert.strictEqual(array.join(','), 'simplePAD_A,simplePAD_B', 'Should RVC 2 simple Pad button')
  })
});

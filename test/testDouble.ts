import assert from 'assert';
import * as DIR from "../src/index.js";
import { TestKey, preparEnv } from "./commonTest.js";

const { KEY_B } = TestKey;

describe('sintetic event + double detection:', () => {
    {
        const doublePress = 100;
        const { array, ev } = preparEnv(['simple', 'double', 'long'], { doublePress });
        it('Simple with double event detection', async () => {
            array.splice(0, array.length); // flush array
            ev('keydown', KEY_B);
            await DIR.delay(1);
            ev('keyup', KEY_B);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), '', `Simple event are delayed by doublePress (${doublePress}ms)`)
            await DIR.delay(doublePress + 1);
            assert.strictEqual(array.join(','), 'simpleB', `simple append after doublePress (${doublePress}ms)`)
        });
        //const { array, ev } = preparEnv(['simple', 'double', 'long'], {doublePress:5});
        it(`double event detection within ${doublePress} ms`, async () => {
            await DIR.delay(doublePress);
            array.splice(0, array.length); // flush array
            ev('keydown', KEY_B);
            await DIR.delay(1);
            ev('keyup', KEY_B);
            await DIR.delay(1);
            ev('keydown', KEY_B);
            await DIR.delay(1);
            ev('keyup', KEY_B);
            await DIR.delay(1);
            console.log(array);
            assert.strictEqual(array.join(','), 'doubleB', `doublePress is set to ${doublePress}ms, should see a double press of B`)
        });
    }
});

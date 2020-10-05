import assert from 'assert';
import * as DIR from "../src";
import { TestKey, preparEnv } from "./commonTest";

describe('sintetic event + double detection:', () => {
    {
        const { array, ev } = preparEnv(['simple', 'double', 'long'], { doublePress: 5 });
        it('Simple with double detection', async () => {
            array.splice(0, array.length);
            ev('keydown', 48);
            await DIR.delay(1);
            ev('keyup', TestKey.B);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), '')
            await DIR.delay(6);
            assert.strictEqual(array.join(','), 'simpleB')
        });
        //const { array, ev } = preparEnv(['simple', 'double', 'long'], {doublePress:5});
        it('double', async () => {
            array.splice(0, array.length);
            ev('keydown', 48);
            await DIR.delay(1);
            ev('keyup', TestKey.B);
            await DIR.delay(1);
            ev('keydown', 48);
            await DIR.delay(1);
            ev('keyup', TestKey.B);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), 'doubleB')
        });
    }
});

import assert from 'assert';
import * as DIR from "../src/index.js";
import { TestKey, preparEnv } from "./commonTest.js";

describe('sintetic event + long detection:', () => {
    {
        const { array, ev } = preparEnv(['simple', 'double', 'long'], { longPress: 5 });
        it('waiting longpress', async () => {
            array.splice(0, array.length);
            ev('keydown', 48);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), '')
        });

        it('longpress', async () => {
            await DIR.delay(5);
            assert.strictEqual(array.join(','), 'longB[B]')
        });

        it('no extra event on up', async () => {
            ev('keyup', TestKey.B);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), 'longB[B]')
        });

        it('simple on longpress', async () => {
            array.splice(0, array.length);
            ev('keydown', 48);
            await DIR.delay(1);
            ev('keyup', 48);
            assert.strictEqual(array.join(','), 'simpleB')
        });
    }
});

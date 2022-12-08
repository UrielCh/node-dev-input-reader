import assert from 'assert';
import * as DIR from "../src/index.js";
import { TestKey, preparEnv } from "./commonTest.js";

describe('sintetic event:', () => {
    {
        const { array, ev } = preparEnv(['simple', 'double', 'long']);

        it('single', async () => {
            array.splice(0, array.length)
            ev('keydown', TestKey.KEY_B);
            await DIR.delay(1);
            ev('keyup', TestKey.KEY_B);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), 'simpleB')
            await DIR.delay(1);
        });

        it('Key combinaison', async () => {
            array.splice(0, array.length)
            ev('keydown', TestKey.KEY_B);
            await DIR.delay(1);
            ev('keydown', TestKey.KEY_N);
            await DIR.delay(1);
            ev('keyup', TestKey.KEY_B);
            await DIR.delay(1);
            ev('keyup', TestKey.KEY_N);
            await DIR.delay(1);
            assert.strictEqual(array.join(','), 'simpleB[N],simpleN')
        }); // .timeout(600000)
    }
});

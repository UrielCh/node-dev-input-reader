import assert from 'assert';
import * as DIR from "../src/index.js";
import { TestKey, preparEnv } from "./commonTest";


const { KEY_B, KEY_N } = TestKey;

describe('Raw Test', () => {
  {
    const { array, ev } = preparEnv(['keyup', 'keydown']);
    it('single down/up', async () => {
      ev('keydown', KEY_B);
      await DIR.delay(1);
      ev('keyup', KEY_B);
      assert.strictEqual(array.join(','), 'downB,upB')
    });

    it('no phantom key event', async () => {
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,upB')
    });

    it('mutiples down/up', async () => {
      array.splice(0, array.length)
      ev('keydown', KEY_B);
      await DIR.delay(1);
      ev('keyup', KEY_B);
      await DIR.delay(1);
      ev('keydown', KEY_N);
      await DIR.delay(1);
      ev('keyup', KEY_N);
      await DIR.delay(1);
      ev('keydown', KEY_N);
      await DIR.delay(1);
      ev('keyup', KEY_N);
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,upB,downN,upN,downN,upN')
    });

    it('mutiples down/up concurent key', async () => {
      array.splice(0, array.length)
      ev('keydown', KEY_B);
      await DIR.delay(1);
      ev('keydown', KEY_N);
      await DIR.delay(1);
      ev('keyup', KEY_B);
      await DIR.delay(1);
      ev('keyup', KEY_N);
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,downN,upB,upN')
    });
  }
});

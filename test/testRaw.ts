import assert from 'assert';
import * as DIR from "../src/index.js";
import { TestKey, preparEnv } from "./commonTest";

describe('Raw Test', () => {
  {
    const { array, ev } = preparEnv(['keyup', 'keydown']);
    it('single down/up', async () => {
      ev('keydown', TestKey.B);
      await DIR.delay(1);
      ev('keyup', TestKey.B);
      assert.strictEqual(array.join(','), 'downB,upB')
    });

    it('no phantom key event', async () => {
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,upB')
    });

    it('mutiples down/up', async () => {
      array.splice(0, array.length)
      ev('keydown', TestKey.B);
      await DIR.delay(1);
      ev('keyup', TestKey.B);
      await DIR.delay(1);
      ev('keydown', TestKey.N);
      await DIR.delay(1);
      ev('keyup', TestKey.N);
      await DIR.delay(1);
      ev('keydown', TestKey.N);
      await DIR.delay(1);
      ev('keyup', TestKey.N);
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,upB,downN,upN,downN,upN')
    });

    it('mutiples down/up concurent key', async () => {
      array.splice(0, array.length)
      ev('keydown', TestKey.B);
      await DIR.delay(1);
      ev('keydown', TestKey.N);
      await DIR.delay(1);
      ev('keyup', TestKey.B);
      await DIR.delay(1);
      ev('keyup', TestKey.N);
      await DIR.delay(1);
      assert.strictEqual(array.join(','), 'downB,downN,upB,upN')
    });
  }
});

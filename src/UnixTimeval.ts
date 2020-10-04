/**
 * map Linux OS time
 */
export default class UnixTimeval {
    constructor(public tv_sec: number, public tv_usec: number) {}
    /**
     * return time difference in ms
     * @param time dest date
     */
    public fromMs(time?: UnixTimeval | null) {
        if (!time)
            return NaN;
        let mSec = (this.tv_sec - time.tv_sec) * 1000;
        mSec += (this.tv_usec - time.tv_usec) / 1000;
        return mSec;
    }

    /**
     * return Javascript timeStamp in milliSec
     */
    public toTs(): Number {
        const sec = this.tv_sec * 1000;
        const mSec = Math.round(this.tv_usec / 1000);
        return sec + mSec;
    }

};


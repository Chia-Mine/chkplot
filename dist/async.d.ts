export declare function sleep(ms: number): Promise<unknown>;
export declare type TLoopOption = {
    stop: boolean;
    sleepMs: number;
};
export declare function createTimerLoop(option?: Partial<TLoopOption>): AsyncGenerator<unknown, any, undefined | Partial<TLoopOption>>;

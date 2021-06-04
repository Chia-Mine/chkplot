import { TParsed, TSize, TSizeUnit } from "./parse";
export declare function resolveSizeUnit(size: [number, string]): number;
export declare function summarizeSizeUnit(sizeInByte: number, unit?: TSizeUnit): TSize;
export declare function getProgress(log: string): number;
export declare function getPhase1TimeSeries(parsedLog: TParsed<true>): number[];
export declare function getPhase1CPUSeries(parsedLog: TParsed<true>): number[];
export declare function getPhase2TimeSeries(parsedLog: TParsed<true>): number[];
export declare function getPhase2CPUSeries(parsedLog: TParsed<true>): number[];
export declare function parseTime(time: number): {
    hour: number;
    minute: number;
    second: number;
};
export declare function compileTime(parsedTime: ReturnType<typeof parseTime>): number;
export declare function summarize(log: string, uuid?: string): {
    uuid: string | undefined;
    id: string | undefined;
    start_date: Date | null;
    k: number | undefined;
    r: number | undefined;
    b: TSize | undefined;
    t: string | undefined;
    d: string | undefined;
    phase1CompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    phase2CompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    phase3CompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    phase4CompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    plotCompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    copyTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    overallCompleteTime: {
        hour: number;
        minute: number;
        second: number;
    } | null;
    progress: number;
    phase: string;
    finish_date: string | null;
};
export declare function formatDate(d: Date): string;
export declare function printSummary(summary: ReturnType<typeof summarize>): void;
export declare type TPrintProgressOption = {
    shortUUID: boolean;
    noTempDir: boolean;
    noFinalDir: boolean;
};
export declare function printProgress(summary: ReturnType<typeof summarize>, option?: Partial<TPrintProgressOption>): void;

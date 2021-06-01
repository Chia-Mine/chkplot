import { Stats } from "fs";
export declare function listPlotterLogFiles(dirPath?: string): Promise<{
    stats: Stats;
    path: string;
}[]>;
export declare type TGetPlotterLogSummaryOption = {
    unfinishedOnly: boolean;
    n: number;
};
export declare function getPlotterLogSummary(fileStats: ReturnType<typeof listPlotterLogFiles> extends Promise<infer T> ? T : never, option?: Partial<TGetPlotterLogSummaryOption>): AsyncGenerator<{
    uuid: string | undefined;
    id: string | undefined;
    start_date: string | null;
    k: number | undefined;
    r: number | undefined;
    b: import("./parse").TSize | undefined;
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
}, void, unknown>;

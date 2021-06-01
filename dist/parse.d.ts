export declare type TSizeUnit = "B" | "KiB" | "MiB" | "GiB" | "TiB" | "PiB" | "EiB";
export declare type TSize = [number, TSizeUnit];
export declare type TPlotterParams = {
    start_time: Date;
    k: number;
    pool_public_key: string;
    farmer_public_key: string;
    memo: string;
    temp1_dir: string;
    temp2_dir: string;
    id: string;
    buffer_size: TSize;
    buckets: number;
    final_dir: string;
    threads: number;
    stripe_size: number;
    process_id: string;
};
export declare type TBucketInfo = {
    bucket: number;
    sort: string;
    ram: TSize;
    u_sort_min: TSize;
    qs_min: TSize;
    force_qs?: string;
};
export declare type TComplete = {
    time: number;
    cpu: number;
    date: Date;
};
export declare type TPhase1BucketProgress = {
    bucketInfo: TBucketInfo[];
    total_matches: number;
    complete: TComplete;
};
export declare type TPhase1<IsComplete extends boolean = false> = IsComplete extends true ? {
    start_date: Date;
    table1: {
        f1_complete: TComplete;
    };
    table2: TPhase1BucketProgress;
    table3: TPhase1BucketProgress;
    table4: TPhase1BucketProgress;
    table5: TPhase1BucketProgress;
    table6: TPhase1BucketProgress;
    table7: TPhase1BucketProgress;
    complete: TComplete;
} : {
    start_date: Date;
    table1: {
        f1_complete: TComplete;
    };
    table2: Partial<TPhase1BucketProgress>;
    table3: Partial<TPhase1BucketProgress>;
    table4: Partial<TPhase1BucketProgress>;
    table5: Partial<TPhase1BucketProgress>;
    table6: Partial<TPhase1BucketProgress>;
    table7: Partial<TPhase1BucketProgress>;
    complete: TComplete;
};
export declare type TPhase2 = {
    start_date: Date;
    table7: TComplete;
    table6: TComplete;
    table5: TComplete;
    table4: TComplete;
    table3: TComplete;
    table2: TComplete;
    table1_new_size: number;
    complete: TComplete;
    wrote: number;
};
export declare type TPhase3BucketProgress = {
    bucketInfo: TBucketInfo[];
    firstComputationSummary: TComplete;
    secondComputationSummary: TComplete;
    totalCompressSummary: TComplete;
    wrote: number;
};
export declare type TPhase3<IsComplete extends boolean = false> = IsComplete extends true ? {
    tmp_path: string;
    start_date: Date;
    table1and2: TPhase3BucketProgress;
    table2and3: TPhase3BucketProgress;
    table3and4: TPhase3BucketProgress;
    table4and5: TPhase3BucketProgress;
    table5and6: TPhase3BucketProgress;
    table6and7: TPhase3BucketProgress;
    complete: TComplete;
} : {
    tmp_path: string;
    start_date: Date;
    table1and2: Partial<TPhase3BucketProgress>;
    table2and3: Partial<TPhase3BucketProgress>;
    table3and4: Partial<TPhase3BucketProgress>;
    table4and5: Partial<TPhase3BucketProgress>;
    table5and6: Partial<TPhase3BucketProgress>;
    table6and7: Partial<TPhase3BucketProgress>;
    complete: TComplete;
};
export declare type TPhase4 = {
    tmp_path: string;
    start_date: Date;
    bucketInfo: TBucketInfo[];
    P1: string;
    P2: string;
    P3: string;
    P4: string;
    P5: string;
    P6: string;
    P7: string;
    C1: string;
    C2: string;
    C3: string;
    complete: TComplete;
};
export declare type TPhaseSummary = {
    approximate_working_space_used: TSize;
    final_file_size: TSize;
    complete: TComplete;
    finished_time: Date;
};
export declare type TCopyPhase = {
    from: string;
    to: string;
    complete: TComplete;
    removed_temp2_file: string;
    renamed_final_file: {
        from: string;
        to: string;
    };
};
export declare type TParsed<IsComplete extends boolean = false> = IsComplete extends true ? {
    params: TPlotterParams;
    phase1: TPhase1<true>;
    phase2: TPhase2;
    phase3: TPhase3<true>;
    phase4: TPhase4;
    phaseSummary: TPhaseSummary;
    copyPhase: TCopyPhase;
} : {
    params: Partial<TPlotterParams>;
    phase1: Partial<TPhase1>;
    phase2: Partial<TPhase2>;
    phase3: Partial<TPhase3>;
    phase4: Partial<TPhase4>;
    phaseSummary: Partial<TPhaseSummary>;
    copyPhase: Partial<TCopyPhase>;
};
export declare function parsePlotterLog(log: string | string[]): TParsed;

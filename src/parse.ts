export type TSizeUnit = "B"|"KiB"|"MiB"|"GiB"|"TiB"|"PiB"|"EiB";
export type TSize = [number, TSizeUnit];
export type TPlotterParams = {
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
export type TBucketInfo = {
  bucket: number;
  sort: string;
  ram: TSize;
  u_sort_min: TSize;
  qs_min: TSize;
  force_qs?: string;
};
export type TComplete = {
  time: number;
  cpu: number;
  date: Date;
};
export type TPhase1BucketProgress = {
  bucketInfo: TBucketInfo[];
  total_matches: number;
  complete: TComplete;
};
export type TPhase1<IsComplete extends boolean = false> = IsComplete extends true ? {
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
export type TPhase2 = {
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
export type TPhase3BucketProgress = {
  bucketInfo: TBucketInfo[];
  firstComputationSummary: TComplete;
  secondComputationSummary: TComplete;
  totalCompressSummary: TComplete;
  wrote: number;
};
export type TPhase3<IsComplete extends boolean = false> = IsComplete extends true ? {
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
export type TPhase4 = {
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
export type TPhaseSummary = {
  approximate_working_space_used: TSize;
  final_file_size: TSize;
  complete: TComplete;
  finished_time: Date;
};
export type TCopyPhase = {
  from: string;
  to: string;
  complete: TComplete;
  removed_temp2_file: string;
  renamed_final_file: {
    from: string;
    to: string;
  }
};

export type TParsed<IsComplete extends boolean = false> = IsComplete extends true ? {
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

export function parse(log: string|string[]): TParsed {
  const lines = Array.isArray(log) ? log : log.trim().split(/\r\n|\r|\n/);
  const maxLine = lines.length;
  
  const params: Partial<TPlotterParams> = {};
  const phase1: Partial<TPhase1> = {};
  const phase2: Partial<TPhase2> = {};
  const phase3: Partial<TPhase3> = {};
  const phase4: Partial<TPhase4> = {};
  const phaseSummary: Partial<TPhaseSummary> = {};
  const copyPhase: Partial<TCopyPhase> = {};
  
  let currentPhase = "starting";
  let subState = "";
  
  for(let l=0;l<maxLine;l++){
    const lineNo = l + 1;
    const line = lines[l];
  
    if(currentPhase === "starting"){
      const regex = /^(.+?)\s+chia.+Creating\s+(\d+)\s+plots of size\s+(\d+),\s+pool public key:\s+([a-fA-F0-9]+)\s+farmer public key:\s+([a-fA-F0-9]+).+$/;
      let match = regex.exec(line);
      if(match){
        params.start_time = new Date(match[1]);
        params.k = +match[3];
        params.pool_public_key = match[4];
        params.farmer_public_key = match[5];
        continue;
      }
      const regex2 = /^(.+?)\s+chia.+INFO.+Memo:\s+([a-fA-F0-9]+).+$/;
      match = regex2.exec(line);
      if(match){
        params.memo = match[2];
        continue;
      }
      const regex3 = /^Starting plotting progress into temporary dirs: (.+) and (.+)$/;
      match = regex3.exec(line);
      if(match){
        params.temp1_dir = match[1];
        params.temp2_dir = match[2];
        continue;
      }
  
      const regex4 = /^ID:\s+(.+)$/;
      match = regex4.exec(line);
      if(match){
        params.id = match[1];
        continue;
      }
      const regex5 = /^Buffer size is:\s+([\d.]+)(.+)$/;
      match = regex5.exec(line);
      if(match){
        params.buffer_size = [+match[1], match[2] as TSizeUnit];
        continue;
      }
      
      const regex6 = /^Using (\d+) buckets$/;
      match = regex6.exec(line);
      if(match){
        params.buckets = +match[1];
        continue;
      }
  
      const regex8 = /^Final Directory is: (.+)$/;
      match = regex8.exec(line);
      if(match){
        params.final_dir = match[1];
        continue;
      }
  
      const regex7 = /^Using (\d+) threads of stripe size (\d+)$/;
      match = regex7.exec(line);
      if(match){
        params.threads = +match[1];
        params.stripe_size = +match[2];
        currentPhase = "phase1";
        // Do not 'continue' here because some version of chiapos may output log like "Process ID is:...". 
      }
      
      const line2 = lines[l+1];
      
      const regex9 = /^Process ID is: (.+)$/;
      match = regex9.exec(line2);
      if(match){
        params.process_id = match[1];
        l+=2; // Skip a blank line
        currentPhase = "phase1";
        continue;
      }
      
      continue;
    }
    else if(currentPhase === "phase1"){
      const regexForPhase1Start = /^Starting phase 1\/4: Forward Propagation into tmp files\.\.\. (.+)$/;
      let match = regexForPhase1Start.exec(line);
      if(match){
        phase1.start_date = new Date(match[1]);
        continue;
      }
  
      const regexF1Complete = /^F1 complete, time: (\d+\.?\d*) seconds. CPU \((.+)%\) (.+)$/;
      match = regexF1Complete.exec(line);
      if(match){
        phase1.table1 = {
          f1_complete: {
            time: +match[1],
            cpu: +match[2],
            date: new Date(match[3]),
          }
        };
        continue;
      }
      
      type TSubState = "table2"|"table3"|"table4"|"table5"|"table6"|"table7";
      const regexForComputingTable = /^Computing table (\d+)$/;
      match = regexForComputingTable.exec(line);
      if(match){
        subState = `table${match[1]}`;
        phase1[subState as TSubState] = phase1[subState as TSubState] || {};
        continue;
      }
  
      const regexForBuckets = /^\tBucket (\d+) (.+)\. Ram: ([\d.]+)(.+), u_sort min: ([\d.]+)(.+), qs min: ([\d.]+)(.+)\.( force_qs: (.*))?$/;
      match = regexForBuckets.exec(line);
      if(match){
        (phase1[subState as TSubState] as TPhase1BucketProgress).bucketInfo = (phase1[subState as TSubState])?.bucketInfo || [];
        const bucketInfo: TBucketInfo = {
          bucket: +match[1],
          sort: match[2],
          ram: [+match[3], match[4] as TSizeUnit],
          u_sort_min: [+match[5], match[6] as TSizeUnit],
          qs_min: [+match[7], match[8] as TSizeUnit],
          force_qs: match.length > 10 ? match[10] : undefined,
        };
        ((phase1[subState as TSubState] as TPhase1BucketProgress).bucketInfo as unknown[]).push(bucketInfo);
        continue;
      }
      
      const regexForTotalMatches = /^\tTotal matches: (\d+)$/;
      match = regexForTotalMatches.exec(line);
      if(match){
        (phase1[subState as TSubState] as TPhase1BucketProgress).total_matches = +match[1];
        continue;
      }
      
      const regexForForwardPropagation = /^Forward propagation table time: (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForForwardPropagation.exec(line);
      if(match){
        (phase1[subState as TSubState] as TPhase1BucketProgress).complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
      
      const regexForPhase1Complete = /^Time for phase 1 = (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForPhase1Complete.exec(line);
      if(match){
        phase1.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        currentPhase = "phase2";
        subState = "";
        l++; // Skip a blank line between phase 1 and 2.
        continue;
      }
    }
    else if(currentPhase === "phase2"){
      const regexForPhase2Start = /^Starting phase 2\/4.+\.\.\. (.+)$/;
      let match = regexForPhase2Start.exec(line);
      if(match){
        phase2.start_date = new Date(match[1]);
        continue;
      }
  
      type TSubState = "table2"|"table3"|"table4"|"table5"|"table6"|"table7";
      const regexIgnoring = /^Backpropagating on table (\d+)$/;
      const regexIgnoring2 = /^scanned table (\d+)$/;
      const regexIgnoring3 = /^sorting table (\d+)$/;
      match = regexIgnoring.exec(line) || regexIgnoring2.exec(line) || regexIgnoring3.exec(line);
      if(match){
        subState = `table${match[1]}`;
        continue;
      }
      
      const regexScannedTime = /^scanned time\s+=\s+(.+)\s+seconds. CPU\s+\((.+)%\)\s+(.+)$/;
      match = regexScannedTime.exec(line);
      if(match){
        phase2[subState as TSubState] = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
      
      const regexTable1NewSize = /^table 1 new size: (\d+)$/;
      match = regexTable1NewSize.exec(line);
      if(match){
        phase2.table1_new_size = +match[1];
        continue;
      }
  
      const regexPhase2Time = /^Time for phase 2 =\s+(.+)\s+seconds. CPU\s+\((.+)%\)\s+(.+)$/;
      match = regexPhase2Time.exec(line);
      if(match){
        phase2.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
  
      const regexWrote = /^Wrote: (.+)$/;
      match = regexWrote.exec(line);
      if(match){
        phase2.wrote = +match[1];
        currentPhase = "phase3";
        subState = "";
        l++; // Skip a blank line between phase 2 and 3.
      }
    }
    else if(currentPhase === "phase3"){
      const regexForPhase3Start = /^Starting phase 3\/4.+from tmp files into "(.+)"\s+\.\.\.\s+(.+)$/;
      let match = regexForPhase3Start.exec(line);
      if(match){
        phase3.tmp_path = match[1];
        phase3.start_date = new Date(match[2]);
        continue;
      }
      
      type TSubState = "table1and2"|"table2and3"|"table3and4"|"table4and5"|"table5and6"|"table6and7";
      
      const regexForTables1And2 = /^Compressing tables (.+) and (.+)$/;
      match = regexForTables1And2.exec(line);
      if(match){
        subState = `table${match[1]}and${match[2]}`
        phase3[subState as TSubState] = phase3[subState as TSubState] || {};
        continue;
      }
  
      const regexForBuckets = /^\tBucket (\d+) (.+)\. Ram: ([\d.]+)(.+), u_sort min: ([\d.]+)(.+), qs min: ([\d.]+)(.+)\.( force_qs: (.*))?$/;
      match = regexForBuckets.exec(line);
      if(match){
        (phase3[subState as TSubState] as TPhase3BucketProgress).bucketInfo = (phase3[subState as TSubState] as TPhase3BucketProgress).bucketInfo || [];
        const bucketInfo: TBucketInfo = {
          bucket: +match[1],
          sort: match[2],
          ram: [+match[3], match[4] as TSizeUnit],
          u_sort_min: [+match[5], match[6] as TSizeUnit],
          qs_min: [+match[7], match[8] as TSizeUnit],
          force_qs: match.length > 10 ? match[10] : undefined,
        };
        ((phase3[subState as TSubState] as TPhase3BucketProgress).bucketInfo).push(bucketInfo);
        continue;
      }
      
      const regexForFirstComputationSummary = /^\tFirst computation pass time: (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForFirstComputationSummary.exec(line);
      if(match){
        (phase3[subState as TSubState] as TPhase3BucketProgress).firstComputationSummary = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
  
      const regexForSecondComputationSummary = /^\tSecond computation pass time: (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForSecondComputationSummary.exec(line);
      if(match){
        (phase3[subState as TSubState] as TPhase3BucketProgress).secondComputationSummary = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
  
      const regexForWrote = /^\tWrote (.+) entries$/;
      match = regexForSecondComputationSummary.exec(line);
      if(match){
        (phase3[subState as TSubState] as TPhase3BucketProgress).wrote = +match[1];
        continue;
      }
  
      const regexForTotalCompressTableTime = /^Total compress table time: (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForTotalCompressTableTime.exec(line);
      if(match){
        (phase3[subState as TSubState] as TPhase3BucketProgress).totalCompressSummary = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
  
      const regexForPhase3Summary = /^Time for phase 3 = (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForPhase3Summary.exec(line);
      if(match){
        phase3.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        currentPhase = "phase4";
        subState = "";
        l++; // Skip a blank line between phase 2 and 3.
        continue;
      }
    }
    else if(currentPhase === "phase4"){
      const regexForPhase4Start = /^Starting phase 4\/4: Write Checkpoint tables into "(.+)"\s+\.\.\.\s+(.+)$/;
      let match = regexForPhase4Start.exec(line);
      if(match){
        phase4.tmp_path = match[1];
        phase4.start_date = new Date(match[2]);
        continue;
      }
  
      const regexForStartingToWriteC1AndC3 = /^\tStarting to write C1 and C3 tables$/;
      match = regexForStartingToWriteC1AndC3.exec(line);
      if(match){
        continue;
      }
  
      type TSubState = ""
  
      const regexForBuckets = /^\tBucket (\d+) (.+)\. Ram: ([\d.]+)(.+), u_sort min: ([\d.]+)(.+), qs min: ([\d.]+)(.+)\.( force_qs: (.*))?$/;
      match = regexForBuckets.exec(line);
      if(match){
        phase4.bucketInfo = phase4.bucketInfo || [];
        const bucketInfo: TBucketInfo = {
          bucket: +match[1],
          sort: match[2],
          ram: [+match[3], match[4] as TSizeUnit],
          u_sort_min: [+match[5], match[6] as TSizeUnit],
          qs_min: [+match[7], match[8] as TSizeUnit],
          force_qs: match.length > 10 ? match[10] : undefined,
        };
        phase4.bucketInfo.push(bucketInfo);
        continue;
      }
  
      const regexForFinishedToWriteC1AndC3 = /^\tFinished writing C1 and C3 tables$/;
      const regexForWritingC2Table = /^\tWriting C2 table$/;
      const regexForFinishedWritingC2 = /^\tFinished writing C2 table$/;
      const regexForFinalTablePointers = /^\tFinal table pointers:$/;
      match = regexForFinishedToWriteC1AndC3.exec(line)
        || regexForWritingC2Table.exec(line)
        || regexForFinishedWritingC2.exec(line)
        || regexForFinalTablePointers.exec(line);
      if(match){
        continue;
      }
      
      type XX = "P1"|"P2"|"P3"|"P4"|"P5"|"P6"|"P7"|"C1"|"C2"|"C3"
      const regexForXX: Record<XX, RegExp> = {
        P1: /^\tP1: (.+)$/,
        P2: /^\tP2: (.+)$/,
        P3: /^\tP3: (.+)$/,
        P4: /^\tP4: (.+)$/,
        P5: /^\tP5: (.+)$/,
        P6: /^\tP6: (.+)$/,
        P7: /^\tP7: (.+)$/,
        C1: /^\tC1: (.+)$/,
        C2: /^\tC2: (.+)$/,
        C3: /^\tC3: (.+)$/,
      };
      for(const XX in regexForXX){
        if(regexForXX.hasOwnProperty(XX)){
          match = regexForXX[XX as XX].exec(line);
          if(match){
            phase4[XX as XX] = match[1];
            continue;
          }
        }
      }
  
      const regexForPhase3Summary = /^Time for phase 4 = (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regexForPhase3Summary.exec(line);
      if(match){
        phase4.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        currentPhase = "create_plots_result";
        subState = "";
        continue;
      }
    }
    else if(currentPhase === "create_plots_result"){
      const regex1 = /^Approximate working space used \(without final file\): ([\d.]+)(.+)$/;
      let match = regex1.exec(line);
      if(match){
        phaseSummary.approximate_working_space_used = [+match[1], match[2] as TSizeUnit];
        continue;
      }
      
      const regex2 = /^Final File size: ([\d.]+)(.+)$/;
      match = regex2.exec(line);
      if(match){
        phaseSummary.final_file_size = [+match[1], match[2] as TSizeUnit];
        continue;
      }
      
      const regex3 = /^Total time = (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regex3.exec(line);
      if(match){
        phaseSummary.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
      
      const regex4 = /^Copied final file from "(.+)" to "(.+)"$/;
      match = regex4.exec(line);
      if(match){
        copyPhase.from = match[1];
        copyPhase.to = match[2];
        continue;
      }
      
      const regex5 = /^Copy time = (.+) seconds. CPU \((.+)%\) (.+)$/;
      match = regex5.exec(line);
      if(match){
        copyPhase.complete = {
          time: +match[1],
          cpu: +match[2],
          date: new Date(match[3]),
        };
        continue;
      }
  
      const regex6 = /^Removed temp2 file "(.+)"\?\s+(.+)$/;
      match = regex6.exec(line);
      if(match){
        copyPhase.removed_temp2_file = match[1];
        continue;
      }
  
      const regex7 = /^Renamed final file from "(.+)" to "(.+)"$/;
      match = regex7.exec(line);
      if(match){
        copyPhase.renamed_final_file = {
          from: match[1],
          to: match[2],
        };
        currentPhase = "finishing";
        subState = "1";
        continue;
      }
    }
    else if(currentPhase === "finishing"){
      if(subState === "1"){
        const regex1 = /^([^\s]+)\s+chia\.plotting\.create_plots\s+:.+INFO\s+.+\s+Summary:.+$/;
        let match = regex1.exec(line);
        if(match){
          subState = "2";
          phaseSummary.finished_time = new Date(match[1]);
          continue;
        }
        
        const regex2 = /^([^\s]+)\s+chia\.plotting\.create_plots\s+:.+INFO\s+.+Created a total of (\d+) new plots.+$/;
        match = regex2.exec(line);
        if(match){
          subState = "3";
          phaseSummary.finished_time = new Date(match[1]);
          continue;
        }
  
        const regex3 = /^([^\s]+)\s+chia\.plotting\.create_plots\s+:.+INFO\s+.+Created a total of (\d+) new plots.+$/;
        match = regex3.exec(line);
        if(match){
          phaseSummary.finished_time = new Date(match[1]);
          continue;
        }
      }
    }
  }
  
  return {
    params,
    phase1,
    phase2,
    phase3,
    phase4,
    phaseSummary,
    copyPhase,
  };
}
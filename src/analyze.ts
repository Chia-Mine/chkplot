import {parsePlotterLog, TParsed, TSize, TSizeUnit} from "./parse";

export function resolveSizeUnit(size: [number, string]){
  let p = 0;
  if(size[1] === "KiB"){
    p = 1;
  }
  if(size[1] === "MiB"){
    p = 2;
  }
  else if(size[1] === "GiB"){
    p = 3;
  }
  else if(size[1] === "TiB"){
    p = 4;
  }
  else if(size[1] === "PiB"){
    p = 5;
  }
  else if(size[1] === "EiB"){
    p = 6;
  }
  
  return size[0] * 1024**p;
}

export function summarizeSizeUnit(sizeInByte: number, unit?: TSizeUnit): TSize {
  let p = 0;
  if(unit === "B"){
    p = 0;
  }
  else if(unit === "KiB"){
    p = 1;
  }
  else if(unit === "MiB"){
    p = 2;
  }
  else if(unit === "GiB"){
    p = 3;
  }
  else if(unit === "TiB"){
    p = 4;
  }
  else if(unit === "PiB"){
    p = 5;
  }
  else{
    const log = Math.floor(Math.log2(sizeInByte) / 10);
    if(log === 1){ p = 1; unit = "KiB"; }
    else if(log === 2){ p = 2; unit = "MiB"; }
    else if(log === 3){ p = 3; unit = "GiB"; }
    else if(log === 4){ p = 4; unit = "TiB"; }
    else if(log === 5){ p = 5; unit = "PiB"; }
    else if(log === 6){ p = 6; unit = "EiB"; }
    else{
      return [sizeInByte, "B"];
    }
  }
  
  return [sizeInByte / (1024**p), unit];
}

const FINISHED_LOG_LINES = 2626; // 128
const FINISHED_LOG_LINES_64 = 1379; // 64
const FINISHED_LOG_LINES_32 = 754; // 32

export function getProgress(log: string){
  const lines = log.trim().split(/\r\n|\r|\n/).length;
  return lines > FINISHED_LOG_LINES ? 1 : lines / FINISHED_LOG_LINES;
}

export function getPhase1TimeSeries(parsedLog: TParsed<true>){
  return [
    parsedLog.phase1.table1.f1_complete.time,
    parsedLog.phase1.table2.complete.time,
    parsedLog.phase1.table3.complete.time,
    parsedLog.phase1.table4.complete.time,
    parsedLog.phase1.table5.complete.time,
    parsedLog.phase1.table6.complete.time,
    parsedLog.phase1.table7.complete.time,
  ];
}

export function getPhase1CPUSeries(parsedLog: TParsed<true>){
  return [
    parsedLog.phase1.table1.f1_complete.cpu,
    parsedLog.phase1.table2.complete.cpu,
    parsedLog.phase1.table3.complete.cpu,
    parsedLog.phase1.table4.complete.cpu,
    parsedLog.phase1.table5.complete.cpu,
    parsedLog.phase1.table6.complete.cpu,
    parsedLog.phase1.table7.complete.cpu,
  ];
}

export function getPhase2TimeSeries(parsedLog: TParsed<true>){
  return [
    parsedLog.phase2.table7.time,
    parsedLog.phase2.table6.time,
    parsedLog.phase2.table5.time,
    parsedLog.phase2.table4.time,
    parsedLog.phase2.table3.time,
    parsedLog.phase2.table2.time,
  ];
}

export function getPhase2CPUSeries(parsedLog: TParsed<true>){
  return [
    parsedLog.phase2.table7.cpu,
    parsedLog.phase2.table6.cpu,
    parsedLog.phase2.table5.cpu,
    parsedLog.phase2.table4.cpu,
    parsedLog.phase2.table3.cpu,
    parsedLog.phase2.table2.cpu,
  ];
}

export function parseTime(time: number){
  return {
    hour: Math.floor(time / 60 / 60),
    minute: Math.floor((time % 3600) / 60),
    second: Math.round((time % 60) * 1000) / 1000,
  };
}

export function compileTime(parsedTime: ReturnType<typeof parseTime>){
  return parsedTime.hour*3600 + parsedTime.minute*60 + parsedTime.second;
}

export function summarize(log: string, uuid?: string){
  const parsedLog = parsePlotterLog(log);
  const startDate = parsedLog.params.start_time || parsedLog.phase1.start_date;
  const endDate = parsedLog.phaseSummary.finished_time;
  
  const phase1CompleteTime = parsedLog.phase1.complete ? parseTime(parsedLog.phase1.complete.time) : null;
  const phase2CompleteTime = parsedLog.phase2.complete ? parseTime(parsedLog.phase2.complete.time) : null;
  const phase3CompleteTime = parsedLog.phase3.complete ? parseTime(parsedLog.phase3.complete.time) : null;
  const phase4CompleteTime = parsedLog.phase4.complete ? parseTime(parsedLog.phase4.complete.time) : null;
  const plotCompleteTime = parsedLog.phaseSummary.complete ? parseTime(parsedLog.phaseSummary.complete.time) : null;
  const copyTime = parsedLog.copyPhase.complete ? parseTime(parsedLog.copyPhase.complete.time) : null;
  const timeForPlotPlusCopy = parsedLog.phaseSummary.complete ? (parsedLog.phaseSummary.complete.time + (parsedLog.copyPhase.complete?.time || 0)) : null;
  const overallCompleteTime = timeForPlotPlusCopy ? parseTime(timeForPlotPlusCopy) : null;
  
  const phase = copyTime ? "complete" : plotCompleteTime ? "complete" : phase4CompleteTime ? "final copy"
  : phase3CompleteTime ? "phase4" : phase2CompleteTime ? "phase3" : phase1CompleteTime ? "phase2" : "phase1";
  
  return {
    uuid,
    id: parsedLog.params.id,
    start_date: startDate ? startDate.toLocaleString() : null,
    k: parsedLog.params.k,
    r: parsedLog.params.threads,
    b: parsedLog.params.buffer_size,
    t: parsedLog.params.temp1_dir,
    d: parsedLog.params.final_dir,
    phase1CompleteTime,
    phase2CompleteTime,
    phase3CompleteTime,
    phase4CompleteTime,
    plotCompleteTime,
    copyTime,
    overallCompleteTime,
    progress: Math.floor(getProgress(log)*1000)/10,
    phase,
    finish_date: endDate ? endDate.toLocaleString() : null,
  };
}

export function printSummary(summary: ReturnType<typeof summarize>){
  let longestKeyName = "";
  for(const key in summary) {
    if (summary.hasOwnProperty(key)) {
      longestKeyName = longestKeyName.length < key.length ? key : longestKeyName;
    }
  }
    
  for(const key in summary){
    if(!summary.hasOwnProperty(key)){
      continue;
    }
    const val = summary[key as keyof typeof summary];
    
    const formattedKey = key.padEnd(longestKeyName.length + 1, " ");
    let formattedValue = "";
    if(typeof val === "string" || typeof val === "number"){
      formattedValue = `${val}`;
    }
    else if (Array.isArray(val)){
      formattedValue = `${val[0]}${val[1]}`;
    }
    else if(val && typeof val === "object"){
      formattedValue = `${val.hour.toString().padStart(2, "0")}:${val.minute.toString().padStart(2, "0")}:${val.minute.toString().padStart(2, "0")}`;
    }
    
    console.log(`${formattedKey}: ${formattedValue}`);
  }
}

export function printProgress(summary: ReturnType<typeof summarize>){
  const printing =
    `[${(summary.uuid||"").padEnd(36, " ")}]`
    + ` ${summary.progress}%`.padEnd(5, " ")
    + ` ${summary.phase}`
    + ` ${summary.start_date}`
    + ` k:${summary.k}`
    + ` r:${summary.r}`
    + ` b:${summary.b?.join("")}`
    + ` r:${summary.r}`
    + ` t:${summary.t}`
    + ` d:${summary.d || "?"}`
  console.log(printing);
}

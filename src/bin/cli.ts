#!/usr/bin/env node
import type {Widgets} from "blessed";

function usage(){
  const exeCommand = "npx chkplot"
  return `Usage:
${exeCommand} list [-n <N>] [-c] [-d <Plot log directory>]
    Show available plot progress/result from plotter log files.
    -n: If you specify -n 3, then top 3 of most recent plotting progress/result will be shown.
    -c: Show result in compact format
    -d: Specifys plot log directory. Default is $CHIA_HOME/mainnet/plotter.
    
${exeCommand} wip [-n <N>] [-c] [-d <Plot log directory>]
    Show unfinished plotting progress from plotter log files.
    -n: If you specify -n 10, then top 10 of most recent plotting progress will be shown.
    -c: Show result in compact format
    -d: Specifys plot log directory. Default is $CHIA_HOME/mainnet/plotter.

${exeCommand} summary [-u <uuid>|-n <N>|-a] [-d <Plot log directory>]
    Show plot summary.
    -u: Specify plot uuid for summary. uuid can be listed by '${exeCommand} list'
    -n: If you specify -n 3, then top 3 of most recent plotting log summary will be shown.
    -a: Show all available plot log summary
    -d: Specifys plot log directory. Default is $CHIA_HOME/mainnet/plotter.

${exeCommand} watch [-d <Plot log directory>]
    Realtime monitor for plot progress.
    -d: Specifys plot log directory. Default is $CHIA_HOME/mainnet/plotter.
`;
}

main().catch(e => {
  console.error(e);
});

async function main(){
  const argv = process.argv.slice(2);
  
  if(argv.length < 1){
    console.log(usage());
    process.exit(1);
  }
  
  const command = argv[0];
  const params = processArg();
  
  if(command === "list"){
    return list(params);
  }
  else if(command === "wip"){
    return wip(params);
  }
  else if(command === "summary"){
    return summary(params);
  }
  else if (command === "watch"){
    return watch(params);
  }
  else{
    console.log(usage());
    process.exit(1);
  }
}

function processArg(){
  const argv = process.argv.slice(2);
  const params: Record<string, string|boolean> = {};
  
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(/^-/.test(a)){
      const name = a;
      let value: unknown;
      const a2 = argv[i+1];
      if(!a2 || /^-/.test(a2)){
        value = true;
      }
      else{
        value = a2;
        i++;
      }
      
      params[name] = value as string;
    }
  }
  
  return params;
}

async function list(params: Record<string, string|boolean>){
  let n = -1; // -1 means no limit.
  if(params["-n"]){
    n = +params["-n"];
    if(isNaN(n) || !isFinite(n)){
      console.error("-n option value must be numeric");
      return;
    }
  }
  else if(params["-n"]){
    console.error(`Unknown parameter: -n ${params["-n"]}`);
    return;
  }
  
  let compact = false;
  if(params["-c"]){
    compact = true;
  }
  
  let directory: string|undefined;
  if(typeof params["-d"] === "string"){
    directory = params["-d"];
  }
  else if(params["-d"]){
    console.error(`Invalid directory: ${params["-d"]}`);
    return;
  }
  
  const {
    listPlotterLogFiles,
    getPlotterLogSummary,
    printProgress,
  } = await import("../");
  
  const files = await listPlotterLogFiles(directory);
  files.sort((a, b) => {
    return b.stats.mtimeMs - a.stats.mtimeMs;
  });
  
  const summaries = getPlotterLogSummary(files, {n});
  for await (const s of summaries){
    printProgress(s, compact ? {shortUUID: true, noTempDir: true, noFinalDir: true} : undefined);
  }
  
  return;
}

async function wip(params: Record<string, string|boolean>){
  let n = -1; // -1 means no limit.
  if(params["-n"]){
    n = +params["-n"];
    if(isNaN(n) || !isFinite(n)){
      console.error("-n option value must be numeric");
      return;
    }
  }
  else if(params["-n"]){
    console.error(`Unknown parameter: ${params["-n"]}`);
    return;
  }
  
  let compact = false;
  if(params["-c"]){
    compact = true;
  }
  
  let directory: string|undefined;
  if(typeof params["-d"] === "string"){
    directory = params["-d"];
  }
  else if(params["-d"]){
    console.error(`Invalid directory: ${params["-d"]}`);
    return;
  }
  
  const {
    listPlotterLogFiles,
    getPlotterLogSummary,
    printProgress,
  } = await import("../");
  
  const files = await listPlotterLogFiles(directory);
  const summaries = getPlotterLogSummary(files, {unfinishedOnly: true, n});
  for await (const s of summaries){
    printProgress(s, compact ? {shortUUID: true, noTempDir: true, noFinalDir: true} : undefined);
  }
}

async function summary(params: Record<string, string|boolean>){
  let n = -1; // -1 means no limit.
  if(params["-n"]){
    n = +params["-n"];
    if(isNaN(n) || !isFinite(n)){
      console.error("-n option value must be numeric");
      return;
    }
  }
  else if(params["-n"]){
    console.error(`Unknown parameter: -n ${params["-n"]}`);
    return;
  }
  
  let u = "";
  if(typeof params["-u"] === "string"){
    u = params["-u"];
  }
  else if(params["-u"]){
    console.error(`-u requires uuid`);
    return;
  }
  
  let a: boolean|null = null;
  if(params["-a"] === true){
    a = true;
  }
  
  if(n > -1 && u){
    console.error("-u and -n cannot be used at once");
    console.log(usage());
    return;
  }
  
  if(n > -1 && a){
    console.error("-n and -a cannot be used at once");
    console.log(usage());
    return;
  }
  
  if(a && u){
    console.error("-a and -u cannot be used at once");
    console.log(usage());
    return;
  }
  
  if(!params["-a"] && !params["-u"] && !params["-n"]){
    console.log(usage());
    return;
  }
  
  let directory: string|undefined;
  if(typeof params["-d"] === "string"){
    directory = params["-d"];
  }
  else if(params["-d"]){
    console.error(`Invalid directory: ${params["-d"]}`);
    return;
  }
  
  const {
    listPlotterLogFiles,
    getPlotterLogSummary,
    printSummary,
  } = await import("../");
  
  const files = await listPlotterLogFiles(directory);
  
  if(u){
    for(const f of files){
      const regex = /plotter_log_(.+)\.txt$/;
      const match = regex.exec(f.path);
      let uuid = "";
      if(!match){
        continue;
      }
      uuid = match[1];
      if((new RegExp(`^${u}`)).test(uuid)){
        const summaries = getPlotterLogSummary([f], {n});
        for await (const s of summaries){
          printSummary(s);
        }
        return;
      }
    }
  }
  else{
    const summaries = getPlotterLogSummary(files, {n});
    for await (const s of summaries){
      printSummary(s);
      console.log("");
    }
  }
}

async function watch(params: Record<string, string|boolean>){
  const blessed = await import("blessed");
  const {
    listPlotterLogFiles,
    getPlotterLogSummary,
    createTimerLoop,
    formatDate,
  } = await import("../");
  
  let directory: string|undefined;
  if(typeof params["-d"] === "string"){
    directory = params["-d"];
  }
  else if(params["-d"]){
    console.error(`Invalid directory: ${params["-d"]}`);
    return;
  }
  
  const screen = blessed.screen({
    smartCSR: true,
  });
  
  // Quit on Escape, q, or Control-C.
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });
  // Render the screen.
  screen.render();
  
  type Element = {
    progress: Widgets.ProgressBarElement;
    text: Widgets.TextElement;
  };
  const uuidElementMap: Record<string, Element> = {};
  
  const loop = createTimerLoop();
  const loopOption = {sleepMs: 5000, stop: false};
  let s: IteratorResult<unknown, any>;
  
  let noPlotTasksYet: Widgets.TextElement|null = null;
  let nWip = 0;
  
  // render header
  const headerText = [
    "uuid".padEnd(8, " "),
    "start".padEnd(15, " "),
    "k".padEnd(2, " "),
    "r".padEnd(2, " "),
    "b".padEnd(7, " "),
    "phase".padEnd(10, " "),
    "progress",
    "(Press 'q' to exit)",
  ].join(" ");
  const header = blessed.text({
    parent: screen,
    top: 0,
    left: 0,
    height: 1,
    content: headerText,
  });
  
  while(s = await loop.next(loopOption)){
    if(s.done){
      break;
    }
  
    let files = await listPlotterLogFiles(directory);
    // Remove files whose last update time is larger than 24hours.
    files = files.filter(f => (Date.now() - f.stats.mtimeMs) < 86400000);
    
    const processedUuids: string[] = [];
    let hasNewPlotLog = false;
    for await(const summary of getPlotterLogSummary(files, {unfinishedOnly: true})){
      if(!summary.uuid){
        continue;
      }
  
      const outputs: string[] = [];
      const uuid = summary.uuid.split("-")[0];
      outputs.push(uuid.padEnd(8, " "));
      outputs.push(`${summary.start_date ? formatDate(summary.start_date) : ""}`);
      outputs.push(`${summary.k}`);
      outputs.push(`${summary.r?.toString().padEnd(2, " ")}`);
      outputs.push(`${summary.b?.join("").toString().padEnd(7, " ")}`);
      outputs.push(`${summary.phase.padEnd(10, " ")}`);
      const msg = outputs.join(" ");
      
      if(!uuidElementMap[summary.uuid]){
        const text = blessed.text({
          parent: screen,
          top: nWip+1,
          left: 0,
          height: 1,
          content: msg,
        });
        
        const progress = blessed.progressbar({
          parent: screen,
          top: nWip+1,
          left: 50,
          width: 20,
          height: 1,
          value: summary.progress,
          content: ` ${summary.progress}% `.padEnd(5, " "),
          style: {
            bar: {
              fg: "#000",
              bg: "green",
            }
          },
        });
        progress.setProgress(summary.progress);
        
        uuidElementMap[summary.uuid] = {
          text,
          progress,
        };
  
        nWip++;
        hasNewPlotLog = true;
      }
      else{
        uuidElementMap[summary.uuid].text.setContent(msg);
        uuidElementMap[summary.uuid].progress.setContent(` ${summary.progress}% `.padEnd(5, " "));
        uuidElementMap[summary.uuid].progress.setProgress(summary.progress);
        screen.render();
      }
      
      processedUuids.push(summary.uuid);
    }
    
    if(!processedUuids.length && !noPlotTasksYet){
      noPlotTasksYet = blessed.text({
        parent: screen,
        top: 2,
        left: 4,
        content: "## No plotting task found yet ##",
      });
      screen.render();
    }
    else if(processedUuids.length && noPlotTasksYet){
      noPlotTasksYet.destroy();
      noPlotTasksYet = null;
      screen.render();
    }
    
    const savedUuids = Object.keys(uuidElementMap);
    const removedUuids = savedUuids.filter(uuid => !processedUuids.includes(uuid));
    if(removedUuids.length > 0){
      removedUuids.forEach(uuid => {
        const el = uuidElementMap[uuid];
        el.text.destroy();
        el.progress.destroy();
        delete uuidElementMap[uuid];
      });
      processedUuids.forEach((uuid, i) => {
        const el = uuidElementMap[uuid];
        el.text.top = i+1;
        el.progress.top = i+1;
      });
      nWip = processedUuids.length;
      screen.render();
    }
    else if(hasNewPlotLog){
      processedUuids.forEach((uuid, i) => {
        const el = uuidElementMap[uuid];
        el.text.top = i+1;
        el.progress.top = i+1;
      });
      nWip = processedUuids.length;
      screen.render();
    }
  }
}
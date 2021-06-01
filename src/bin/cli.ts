#!/usr/bin/env node
import {
  listPlotterLogFiles,
  getPlotterLogSummary,
  printProgress, printSummary,
} from "../";

main().catch(e => {
  console.error(e);
});

async function main(){
  const exeCommand = "npx chkplot"
  const argv = process.argv.slice(2);
  const usage = `Usage:
${exeCommand} list [-n <N>]
    Show available plot log files.
    -n: If you specify -n 3, then top 3 of most recent plotting progress/result will be shown.
    
${exeCommand} wip [-n <N>]
    Show plotting progress from plotter log files.
    You can specify max plotter progress to show with -n option.
    If you specify -n 10, then top 10 of most recent plotting progress will be shown.

${exeCommand} summary [-u <uuid>|-n <N>|-a]
    Show plot summary.
    -u: Specify plot uuid for summary. uuid can be listed by '${exeCommand} list'
    -n: If you specify -n 3, then top 3 of most recent plotting log summary will be shown.
    -a: Show all available plot log summary
`;
  
  if(argv.length < 1){
    console.log(usage);
    process.exit(1);
  }
  
  const command = argv[0];
  const params = processArg();
  
  if(command === "list"){
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
  
    const files = await listPlotterLogFiles();
    files.sort((a, b) => {
      return b.stats.mtimeMs - a.stats.mtimeMs;
    });
  
    const summaries = getPlotterLogSummary(files, {n});
    for await (const s of summaries){
      printProgress(s);
    }
    
    return;
  }
  else if(command === "wip"){
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
    
    const files = await listPlotterLogFiles();
    const summaries = getPlotterLogSummary(files, {unfinishedOnly: true, n});
    for await (const s of summaries){
      printProgress(s);
    }
  }
  else if(command === "summary"){
    const subCommand = argv[1];
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
      console.log(usage);
      return;
    }
  
    if(n > -1 && a){
      console.error("-n and -a cannot be used at once");
      console.log(usage);
      return;
    }
  
    if(a && u){
      console.error("-a and -u cannot be used at once");
      console.log(usage);
      return;
    }
  
    if(!params["-a"] && !params["-u"] && !params["-n"]){
      console.log(usage);
      return;
    }
  
    const files = await listPlotterLogFiles();
    
    if(u){
      for(const f of files){
        const regex = /plotter_log_(.+)\.txt$/;
        const match = regex.exec(f.path);
        let uuid = "";
        if(!match){
          continue;
        }
        uuid = match[1];
        if(u === uuid){
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
  else{
    console.log(usage);
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
import * as path from "path";
import {promises as fs, Stats} from "fs";
import {homedir} from "os";
import {summarize} from "./analyze";

export async function listPlotterLogFiles(dirPath?: string){
  const CHIA_HOME = process.env.CHIA_HOME;
  let plotterDirPath = "";
  if(dirPath){
    plotterDirPath = path.resolve(dirPath);
  }
  else if(CHIA_HOME){
    plotterDirPath = path.resolve(CHIA_HOME, "plotter");
  }
  else{
    plotterDirPath = path.resolve(homedir(), ".chia", "mainnet", "plotter");
  }
  
  const files = await fs.readdir(plotterDirPath);
  const tasks: Promise<{ stats: Stats, path: string }>[] = [];
  for (const f of files){
    const p = path.resolve(plotterDirPath, f);
    tasks.push(fs.stat(p).then(s => ({stats: s, path: p})));
  }
  
  let fileStats = await Promise.all(tasks);
  fileStats = fileStats.filter(fs => {
    return fs.stats.isFile() && /plotter_log.*\.txt$/.test(path.basename(fs.path));
  });
  
  return fileStats;
}

export type TGetPlotterLogSummaryOption = {
  unfinishedOnly: boolean;
  n: number;
};
export async function* getPlotterLogSummary(
  fileStats: ReturnType<typeof listPlotterLogFiles> extends Promise<infer T> ? T : never,
  option?: Partial<TGetPlotterLogSummaryOption>,
){
  let files = [...fileStats];
  files.sort((a, b) => {
    return b.stats.birthtimeMs - a.stats.birthtimeMs;
  });
  
  const n = typeof option?.n === "number" ? option.n : -1;
  
  let i = 0;
  for(const f of files){
    let isYielded = false;
    const log = await fs.readFile(f.path, {encoding: "utf8"});
    const regex = /plotter_log_(.+)\.txt$/;
    const match = regex.exec(f.path);
    let uuid = "-";
    if(match){
      uuid = match[1];
    }
    const summary = summarize(log, uuid);
    if(option?.unfinishedOnly){
      if(summary.phase !== "complete"){
        yield summary;
        isYielded = true;
      }
    }
    else{
      yield summary;
      isYielded = true;
    }
    
    if(n > -1 && i >= n - 1){
      return;
    }
    
    if(isYielded){
      i++;
    }
  }
}

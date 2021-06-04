export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}

export type TLoopOption = {
  stop: boolean;
  sleepMs: number;
};
export async function* createTimerLoop(option?: Partial<TLoopOption>): AsyncGenerator<unknown, any, undefined|Partial<TLoopOption>>{
  try{
    while(1){
      const o = yield;
      option = o || option;
      if(option?.stop){
        return;
      }
    
      const ms = option?.sleepMs || 1000;
      await sleep(ms);
    }
  }
  catch(e){
    console.error(e);
    return;
  }
}
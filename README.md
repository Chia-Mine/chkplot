# chkplot
[![npm version](https://badge.fury.io/js/chkplot.svg)](https://badge.fury.io/js/chkplot) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Chia plot log parser/analyzer

## Install
```
npm install chkplot
# or
yarn add chkplot
```

## Command line
```
npx chkplot list [-n <N>]
    Show available plot log files.
    -n: If you specify -n 3, then top 3 of most recent plotting progress/result will be shown.

npx chkplot wip [-n <N>]
    Show plotting progress from plotter log files.
    You can specify max plotter progress to show with -n option.
    If you specify -n 10, then top 10 of most recent plotting progress will be shown.

npx chkplot summary [-u <uuid>|-n <N>|-a]
    Show plot summary.
    -u: Specify plot uuid for summary. uuid can be listed by 'npx chkplot list'
    -n: If you specify -n 3, then top 3 of most recent plotting log summary will be shown.
    -a: Show all available plot log summary
```
* If you globally install `chkplot` such as `npm install -g chkplot` or `yarn add global chkplot`,  
  you can directly run above command without `npx` command prefix.  
  
  **Example:**
  ```shell
  chkplot wip -n 10
  ```

### Demo
![](https://github.com/Chia-Mine/chkplot/blob/v0.0.1/example/chkplot-demo1.gif)

## Library
`chkplot` exposes several function to parse/analyze plotter log.

### parsePlotterLog

```typescript
const {parsePlotterLog} = require("chkplot");
const log = fs.readFileSync(<path_to_plotter_log>, {encoding: "utf-8"});
const parsedLog = parsePlotterLog(log);
```
The content of `parsedLog` looks like:
```json
{
  "params": {
    "start_time": "2021-05-19T01:29:19.301Z",
    "k": 32,
    "pool_public_key": "xxxxxxxxxxxxxx",
    "farmer_public_key": "xxxxxxxxxxxxxx",
    "memo": "xxxxxxxxxxxxxx",
    "temp1_dir": "D:\\chia_plot",
    "temp2_dir": "D:\\chia_plot",
    "id": "xxxxxxxxxxxxxx",
    "buffer_size": [
      4100,
      "MiB"
    ],
    "buckets": 128,
    "threads": 2,
    "stripe_size": 65536
  },
  "phase1": {
    "start_date": "2021-05-19T01:29:19.000Z",
    "table1": {
      "f1_complete": {
        "time": 127.007,
        "cpu": 102.34,
        "date": "2021-05-19T01:31:26.000Z"
      }
    },
    ...
  }
  "phase2": {
    "start_date": "2021-05-19T04:45:39.000Z",
    "table7": {
      "time": 101.065,
      "cpu": 19.12,
      "date": "2021-05-19T04:47:21.000Z"
    },
    ...
  },
  "phase3": {
    "tmp_path": "D:\\\\chia_plot\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
    "start_date": "2021-05-19T05:55:16.000Z",
    "table1and2": {
      "bucketInfo": [
        ...
      ],
      "firstComputationSummary": {
        "time": 677.709,
        "cpu": 85.55,
        "date": "2021-05-19T06:06:34.000Z"
      },
      "secondComputationSummary": {
        "time": 522.29,
        "cpu": 79.7,
        "date": "2021-05-19T06:15:17.000Z"
      },
      "totalCompressSummary": {
        "time": 1200.39,
        "cpu": 83.01,
        "date": "2021-05-19T06:15:17.000Z"
      }
    },
    ...
  },
  "phase4": {
    "tmp_path": "D:\\\\chia_plot\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
    "start_date": "2021-05-19T08:16:42.000Z",
    "bucketInfo": [...],
    "P1": "0xfff",
    "P2": "0xaaaaaaaaaa",
    "P3": "0xbbbbbbbbbb",
    "P4": "0xcccccccccc",
    "P5": "0xdddddddddd",
    "P6": "0xeeeeeeeeee",
    "P7": "0xffffffffff",
    "C1": "0x1111111111",
    "C2": "0x2222222222",
    "C3": "0x3333333333",
    "complete": {
      "time": 511.085,
      "cpu": 82.85,
      "date": "2021-05-19T08:25:13.000Z"
    }
  },
  "phaseSummary": {
    "approximate_working_space_used": [
      269.387,
      " GiB"
    ],
    "final_file_size": [
      101.379,
      " GiB"
    ],
    "complete": {
      "time": 24954.324,
      "cpu": 112.88,
      "date": "2021-05-19T08:25:13.000Z"
    },
    "finished_time": "2021-05-19T09:27:58.962Z"
  },
  "copyPhase": {
    "from": "D:\\\\chia_plot\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
    "to": "R:\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
    "complete": {
      "time": 3762.214,
      "cpu": 0.83,
      "date": "2021-05-19T09:27:55.000Z"
    },
    "removed_temp2_file": "D:\\\\chia_plot\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
    "renamed_final_file": {
      "from": "R:\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot.2.tmp",
      "to": "R:\\\\plot-k32-2021-05-19-10-29-xxxxxxxxxxxxxx.plot"
    }
  }
}
```

### summarize

```typescript
const {summarize} = require("chkplot");
const log = fs.readFileSync(<path_to_plotter_log>, {encoding: "utf-8"});
const summarizedLog = summarize(log);
```
The content of `summarizedLog` looks like:
```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxx",
  "start_date": "2021-5-25 2:17:19",
  "k": 32,
  "r": 3,
  "b": [ 4100, "MiB" ],
  "t": "D:\\chia_plot",
  "d": undefined,
  "phase1CompleteTime": { "hour": 3, "minute": 4, "second": 54.753 },
  "phase2CompleteTime": { "hour": 1, "minute": 16, "second": 9.744 },
  "phase3CompleteTime": { "hour": 2, "minute": 33, "second": 14.112 },
  "phase4CompleteTime": { "hour": 0, "minute": 11, "second": 51.734 },
  "plotCompleteTime": { "hour": 7, "minute": 6, "second": 10.344 },
  "copyTime": { "hour": 0, "minute": 12, "second": 39.958 },
  "overallCompleteTime": { "hour": 7, "minute": 18, "second": 50.302 },
  "progress": 100,
  "phase": "complete",
  "finish_date": "2021-5-25 9:36:14"
}
```

## Donation
For continuous development, please support me with donation
`xch1wqpcvquv98qmeh9hg6wqpzhzmgs73lgvd8a7v5240nxgyat4p0sq4gdzyy`

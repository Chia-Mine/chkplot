#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
function usage() {
    const exeCommand = "npx chkplot";
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const argv = process.argv.slice(2);
        if (argv.length < 1) {
            console.log(usage());
            process.exit(1);
        }
        const command = argv[0];
        const params = processArg();
        if (command === "list") {
            return list(params);
        }
        else if (command === "wip") {
            return wip(params);
        }
        else if (command === "summary") {
            return summary(params);
        }
        else if (command === "watch") {
            return watch(params);
        }
        else {
            console.log(usage());
            process.exit(1);
        }
    });
}
function processArg() {
    const argv = process.argv.slice(2);
    const params = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (/^-/.test(a)) {
            const name = a;
            let value;
            const a2 = argv[i + 1];
            if (!a2 || /^-/.test(a2)) {
                value = true;
            }
            else {
                value = a2;
                i++;
            }
            params[name] = value;
        }
    }
    return params;
}
function list(params) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let n = -1; // -1 means no limit.
        if (params["-n"]) {
            n = +params["-n"];
            if (isNaN(n) || !isFinite(n)) {
                console.error("-n option value must be numeric");
                return;
            }
        }
        else if (params["-n"]) {
            console.error(`Unknown parameter: -n ${params["-n"]}`);
            return;
        }
        let compact = false;
        if (params["-c"]) {
            compact = true;
        }
        let directory;
        if (typeof params["-d"] === "string") {
            directory = params["-d"];
        }
        else if (params["-d"]) {
            console.error(`Invalid directory: ${params["-d"]}`);
            return;
        }
        const { listPlotterLogFiles, getPlotterLogSummary, printProgress, } = yield Promise.resolve().then(() => require("../"));
        const files = yield listPlotterLogFiles(directory);
        files.sort((a, b) => {
            return b.stats.mtimeMs - a.stats.mtimeMs;
        });
        const summaries = getPlotterLogSummary(files, { n });
        try {
            for (var summaries_1 = __asyncValues(summaries), summaries_1_1; summaries_1_1 = yield summaries_1.next(), !summaries_1_1.done;) {
                const s = summaries_1_1.value;
                printProgress(s, compact ? { shortUUID: true, noTempDir: true, noFinalDir: true } : undefined);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (summaries_1_1 && !summaries_1_1.done && (_a = summaries_1.return)) yield _a.call(summaries_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return;
    });
}
function wip(params) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let n = -1; // -1 means no limit.
        if (params["-n"]) {
            n = +params["-n"];
            if (isNaN(n) || !isFinite(n)) {
                console.error("-n option value must be numeric");
                return;
            }
        }
        else if (params["-n"]) {
            console.error(`Unknown parameter: ${params["-n"]}`);
            return;
        }
        let compact = false;
        if (params["-c"]) {
            compact = true;
        }
        let directory;
        if (typeof params["-d"] === "string") {
            directory = params["-d"];
        }
        else if (params["-d"]) {
            console.error(`Invalid directory: ${params["-d"]}`);
            return;
        }
        const { listPlotterLogFiles, getPlotterLogSummary, printProgress, } = yield Promise.resolve().then(() => require("../"));
        const files = yield listPlotterLogFiles(directory);
        const summaries = getPlotterLogSummary(files, { unfinishedOnly: true, n });
        try {
            for (var summaries_2 = __asyncValues(summaries), summaries_2_1; summaries_2_1 = yield summaries_2.next(), !summaries_2_1.done;) {
                const s = summaries_2_1.value;
                printProgress(s, compact ? { shortUUID: true, noTempDir: true, noFinalDir: true } : undefined);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (summaries_2_1 && !summaries_2_1.done && (_a = summaries_2.return)) yield _a.call(summaries_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
}
function summary(params) {
    var e_3, _a, e_4, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let n = -1; // -1 means no limit.
        if (params["-n"]) {
            n = +params["-n"];
            if (isNaN(n) || !isFinite(n)) {
                console.error("-n option value must be numeric");
                return;
            }
        }
        else if (params["-n"]) {
            console.error(`Unknown parameter: -n ${params["-n"]}`);
            return;
        }
        let u = "";
        if (typeof params["-u"] === "string") {
            u = params["-u"];
        }
        else if (params["-u"]) {
            console.error(`-u requires uuid`);
            return;
        }
        let a = null;
        if (params["-a"] === true) {
            a = true;
        }
        if (n > -1 && u) {
            console.error("-u and -n cannot be used at once");
            console.log(usage());
            return;
        }
        if (n > -1 && a) {
            console.error("-n and -a cannot be used at once");
            console.log(usage());
            return;
        }
        if (a && u) {
            console.error("-a and -u cannot be used at once");
            console.log(usage());
            return;
        }
        if (!params["-a"] && !params["-u"] && !params["-n"]) {
            console.log(usage());
            return;
        }
        let directory;
        if (typeof params["-d"] === "string") {
            directory = params["-d"];
        }
        else if (params["-d"]) {
            console.error(`Invalid directory: ${params["-d"]}`);
            return;
        }
        const { listPlotterLogFiles, getPlotterLogSummary, printSummary, } = yield Promise.resolve().then(() => require("../"));
        const files = yield listPlotterLogFiles(directory);
        if (u) {
            for (const f of files) {
                const regex = /plotter_log_(.+)\.txt$/;
                const match = regex.exec(f.path);
                let uuid = "";
                if (!match) {
                    continue;
                }
                uuid = match[1];
                if ((new RegExp(`^${u}`)).test(uuid)) {
                    const summaries = getPlotterLogSummary([f], { n });
                    try {
                        for (var summaries_3 = (e_3 = void 0, __asyncValues(summaries)), summaries_3_1; summaries_3_1 = yield summaries_3.next(), !summaries_3_1.done;) {
                            const s = summaries_3_1.value;
                            printSummary(s);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (summaries_3_1 && !summaries_3_1.done && (_a = summaries_3.return)) yield _a.call(summaries_3);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    return;
                }
            }
        }
        else {
            const summaries = getPlotterLogSummary(files, { n });
            try {
                for (var summaries_4 = __asyncValues(summaries), summaries_4_1; summaries_4_1 = yield summaries_4.next(), !summaries_4_1.done;) {
                    const s = summaries_4_1.value;
                    printSummary(s);
                    console.log("");
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (summaries_4_1 && !summaries_4_1.done && (_b = summaries_4.return)) yield _b.call(summaries_4);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    });
}
function watch(params) {
    var e_5, _a;
    var _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const blessed = yield Promise.resolve().then(() => require("blessed"));
        const { listPlotterLogFiles, getPlotterLogSummary, createTimerLoop, formatDate, } = yield Promise.resolve().then(() => require("../"));
        let directory;
        if (typeof params["-d"] === "string") {
            directory = params["-d"];
        }
        else if (params["-d"]) {
            console.error(`Invalid directory: ${params["-d"]}`);
            return;
        }
        const screen = blessed.screen({
            smartCSR: true,
        });
        // Quit on Escape, q, or Control-C.
        screen.key(['escape', 'q', 'C-c'], function (ch, key) {
            return process.exit(0);
        });
        // Render the screen.
        screen.render();
        const uuidElementMap = {};
        const loop = createTimerLoop();
        const loopOption = { sleepMs: 5000, stop: false };
        let s;
        let noPlotTasksYet = null;
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
        while (s = yield loop.next(loopOption)) {
            if (s.done) {
                break;
            }
            let files = yield listPlotterLogFiles(directory);
            // Remove files whose last update time is larger than 24hours.
            files = files.filter(f => (Date.now() - f.stats.mtimeMs) < 86400000);
            const processedUuids = [];
            let hasNewPlotLog = false;
            try {
                for (var _d = (e_5 = void 0, __asyncValues(getPlotterLogSummary(files, { unfinishedOnly: true }))), _e; _e = yield _d.next(), !_e.done;) {
                    const summary = _e.value;
                    if (!summary.uuid) {
                        continue;
                    }
                    const outputs = [];
                    const uuid = summary.uuid.split("-")[0];
                    outputs.push(uuid.padEnd(8, " "));
                    outputs.push(`${summary.start_date ? formatDate(summary.start_date) : ""}`);
                    outputs.push(`${summary.k}`);
                    outputs.push(`${(_b = summary.r) === null || _b === void 0 ? void 0 : _b.toString().padEnd(2, " ")}`);
                    outputs.push(`${(_c = summary.b) === null || _c === void 0 ? void 0 : _c.join("").toString().padEnd(7, " ")}`);
                    outputs.push(`${summary.phase.padEnd(10, " ")}`);
                    const msg = outputs.join(" ");
                    if (!uuidElementMap[summary.uuid]) {
                        const text = blessed.text({
                            parent: screen,
                            top: nWip + 1,
                            left: 0,
                            height: 1,
                            content: msg,
                        });
                        const progress = blessed.progressbar({
                            parent: screen,
                            top: nWip + 1,
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
                    else {
                        uuidElementMap[summary.uuid].text.setContent(msg);
                        uuidElementMap[summary.uuid].progress.setContent(` ${summary.progress}% `.padEnd(5, " "));
                        uuidElementMap[summary.uuid].progress.setProgress(summary.progress);
                        screen.render();
                    }
                    processedUuids.push(summary.uuid);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) yield _a.call(_d);
                }
                finally { if (e_5) throw e_5.error; }
            }
            if (!processedUuids.length && !noPlotTasksYet) {
                noPlotTasksYet = blessed.text({
                    parent: screen,
                    top: 2,
                    left: 4,
                    content: "## No plotting task found yet ##",
                });
                screen.render();
            }
            else if (processedUuids.length && noPlotTasksYet) {
                noPlotTasksYet.destroy();
                noPlotTasksYet = null;
                screen.render();
            }
            const savedUuids = Object.keys(uuidElementMap);
            const removedUuids = savedUuids.filter(uuid => !processedUuids.includes(uuid));
            if (removedUuids.length > 0) {
                removedUuids.forEach(uuid => {
                    const el = uuidElementMap[uuid];
                    el.text.destroy();
                    el.progress.destroy();
                    delete uuidElementMap[uuid];
                });
                processedUuids.forEach((uuid, i) => {
                    const el = uuidElementMap[uuid];
                    el.text.top = i + 1;
                    el.progress.top = i + 1;
                });
                nWip = processedUuids.length;
                screen.render();
            }
            else if (hasNewPlotLog) {
                processedUuids.forEach((uuid, i) => {
                    const el = uuidElementMap[uuid];
                    el.text.top = i + 1;
                    el.progress.top = i + 1;
                });
                nWip = processedUuids.length;
                screen.render();
            }
        }
    });
}

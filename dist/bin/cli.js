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
const __1 = require("../");
main().catch(e => {
    console.error(e);
});
function main() {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const exeCommand = "npx chkplot";
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
        if (argv.length < 1) {
            console.log(usage);
            process.exit(1);
        }
        const command = argv[0];
        const params = processArg();
        if (command === "list") {
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
            const files = yield __1.listPlotterLogFiles();
            files.sort((a, b) => {
                return b.stats.mtimeMs - a.stats.mtimeMs;
            });
            const summaries = __1.getPlotterLogSummary(files, { n });
            try {
                for (var summaries_1 = __asyncValues(summaries), summaries_1_1; summaries_1_1 = yield summaries_1.next(), !summaries_1_1.done;) {
                    const s = summaries_1_1.value;
                    __1.printProgress(s);
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
        }
        else if (command === "wip") {
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
            const files = yield __1.listPlotterLogFiles();
            const summaries = __1.getPlotterLogSummary(files, { unfinishedOnly: true, n });
            try {
                for (var summaries_2 = __asyncValues(summaries), summaries_2_1; summaries_2_1 = yield summaries_2.next(), !summaries_2_1.done;) {
                    const s = summaries_2_1.value;
                    __1.printProgress(s);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (summaries_2_1 && !summaries_2_1.done && (_b = summaries_2.return)) yield _b.call(summaries_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else if (command === "summary") {
            const subCommand = argv[1];
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
                console.log(usage);
                return;
            }
            if (n > -1 && a) {
                console.error("-n and -a cannot be used at once");
                console.log(usage);
                return;
            }
            if (a && u) {
                console.error("-a and -u cannot be used at once");
                console.log(usage);
                return;
            }
            if (!params["-a"] && !params["-u"] && !params["-n"]) {
                console.log(usage);
                return;
            }
            const files = yield __1.listPlotterLogFiles();
            if (u) {
                for (const f of files) {
                    const regex = /plotter_log_(.+)\.txt$/;
                    const match = regex.exec(f.path);
                    let uuid = "";
                    if (!match) {
                        continue;
                    }
                    uuid = match[1];
                    if (u === uuid) {
                        const summaries = __1.getPlotterLogSummary([f], { n });
                        try {
                            for (var summaries_3 = (e_3 = void 0, __asyncValues(summaries)), summaries_3_1; summaries_3_1 = yield summaries_3.next(), !summaries_3_1.done;) {
                                const s = summaries_3_1.value;
                                __1.printSummary(s);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (summaries_3_1 && !summaries_3_1.done && (_c = summaries_3.return)) yield _c.call(summaries_3);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return;
                    }
                }
            }
            else {
                const summaries = __1.getPlotterLogSummary(files, { n });
                try {
                    for (var summaries_4 = __asyncValues(summaries), summaries_4_1; summaries_4_1 = yield summaries_4.next(), !summaries_4_1.done;) {
                        const s = summaries_4_1.value;
                        __1.printSummary(s);
                        console.log("");
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (summaries_4_1 && !summaries_4_1.done && (_d = summaries_4.return)) yield _d.call(summaries_4);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        else {
            console.log(usage);
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

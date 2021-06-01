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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlotterLogSummary = exports.listPlotterLogFiles = void 0;
const path = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
const analyze_1 = require("./analyze");
function listPlotterLogFiles(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const CHIA_HOME = process.env.CHIA_HOME;
        let plotterDirPath = "";
        if (dirPath) {
            plotterDirPath = path.resolve(dirPath);
        }
        else if (CHIA_HOME) {
            plotterDirPath = path.resolve(CHIA_HOME, "plotter");
        }
        else {
            plotterDirPath = path.resolve(os_1.homedir(), ".chia", "mainnet", "plotter");
        }
        const files = yield fs_1.promises.readdir(plotterDirPath);
        const tasks = [];
        for (const f of files) {
            const p = path.resolve(plotterDirPath, f);
            tasks.push(fs_1.promises.stat(p).then(s => ({ stats: s, path: p })));
        }
        let fileStats = yield Promise.all(tasks);
        fileStats = fileStats.filter(fs => {
            return fs.stats.isFile() && /plotter_log.*\.txt$/.test(path.basename(fs.path));
        });
        return fileStats;
    });
}
exports.listPlotterLogFiles = listPlotterLogFiles;
function getPlotterLogSummary(fileStats, option) {
    return __asyncGenerator(this, arguments, function* getPlotterLogSummary_1() {
        let files = [...fileStats];
        files.sort((a, b) => {
            return b.stats.mtimeMs - a.stats.mtimeMs;
        });
        const n = typeof (option === null || option === void 0 ? void 0 : option.n) === "number" ? option.n : -1;
        let i = 0;
        for (const f of files) {
            let isYielded = false;
            const log = yield __await(fs_1.promises.readFile(f.path, { encoding: "utf8" }));
            const regex = /plotter_log_(.+)\.txt$/;
            const match = regex.exec(f.path);
            let uuid = "-";
            if (match) {
                uuid = match[1];
            }
            const summary = analyze_1.summarize(log, uuid);
            if (option === null || option === void 0 ? void 0 : option.unfinishedOnly) {
                if (summary.phase !== "complete") {
                    yield yield __await(summary);
                    isYielded = true;
                }
            }
            else {
                yield yield __await(summary);
                isYielded = true;
            }
            if (n > -1 && i >= n - 1) {
                return yield __await(void 0);
            }
            if (isYielded) {
                i++;
            }
        }
    });
}
exports.getPlotterLogSummary = getPlotterLogSummary;

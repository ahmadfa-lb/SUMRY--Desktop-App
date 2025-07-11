"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const node_url = require("node:url");
const path$1 = require("node:path");
const require$$0 = require("fs");
const require$$1 = require("path");
const require$$2 = require("os");
const require$$3 = require("crypto");
const require$$0$2 = require("events");
const require$$0$1 = require("node:crypto");
const require$$1$1 = require("child_process");
const require$$3$1 = require("stream");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$1 = { exports: {} };
const name = "dotenv";
const version$1 = "17.0.1";
const description = "Loads environment variables from .env file";
const main = "lib/main.js";
const types = "lib/main.d.ts";
const exports$1 = {
  ".": {
    types: "./lib/main.d.ts",
    require: "./lib/main.js",
    "default": "./lib/main.js"
  },
  "./config": "./config.js",
  "./config.js": "./config.js",
  "./lib/env-options": "./lib/env-options.js",
  "./lib/env-options.js": "./lib/env-options.js",
  "./lib/cli-options": "./lib/cli-options.js",
  "./lib/cli-options.js": "./lib/cli-options.js",
  "./package.json": "./package.json"
};
const scripts = {
  "dts-check": "tsc --project tests/types/tsconfig.json",
  lint: "standard",
  pretest: "npm run lint && npm run dts-check",
  test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
  "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
  prerelease: "npm test",
  release: "standard-version"
};
const repository = {
  type: "git",
  url: "git://github.com/motdotla/dotenv.git"
};
const homepage = "https://github.com/motdotla/dotenv#readme";
const funding = "https://dotenvx.com";
const keywords = [
  "dotenv",
  "env",
  ".env",
  "environment",
  "variables",
  "config",
  "settings"
];
const readmeFilename = "README.md";
const license = "BSD-2-Clause";
const devDependencies = {
  "@types/node": "^18.11.3",
  decache: "^4.6.2",
  sinon: "^14.0.1",
  standard: "^17.0.0",
  "standard-version": "^9.5.0",
  tap: "^19.2.0",
  typescript: "^4.8.4"
};
const engines = {
  node: ">=12"
};
const browser = {
  fs: false
};
const require$$4 = {
  name,
  version: version$1,
  description,
  main,
  types,
  exports: exports$1,
  scripts,
  repository,
  homepage,
  funding,
  keywords,
  readmeFilename,
  license,
  devDependencies,
  engines,
  browser
};
const fs$1 = require$$0;
const path = require$$1;
const os = require$$2;
const crypto = require$$3;
const packageJson = require$$4;
const version = packageJson.version;
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function parse(src) {
  const obj = {};
  let lines = src.toString();
  lines = lines.replace(/\r\n?/mg, "\n");
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function _parseVault(options) {
  options = options || {};
  const vaultPath = _vaultPath(options);
  options.path = vaultPath;
  const result = DotenvModule.configDotenv(options);
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = "MISSING_DATA";
    throw err;
  }
  const keys = _dotenvKey(options).split(",");
  const length = keys.length;
  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      const key = keys[i].trim();
      const attrs = _instructions(result, key);
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error) {
      if (i + 1 >= length) {
        throw error;
      }
    }
  }
  return DotenvModule.parse(decrypted);
}
function _warn(message) {
  console.error(`[dotenv@${version}][WARN] ${message}`);
}
function _debug(message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}
function _log(message) {
  console.log(`[dotenv@${version}] ${message}`);
}
function _dotenvKey(options) {
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY;
  }
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY;
  }
  return "";
}
function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    throw error;
  }
  const key = uri.password;
  if (!key) {
    const err = new Error("INVALID_DOTENV_KEY: Missing key part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environment = uri.searchParams.get("environment");
  if (!environment) {
    const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
    throw err;
  }
  return { ciphertext, key };
}
function _vaultPath(options) {
  let possibleVaultPath = null;
  if (options && options.path && options.path.length > 0) {
    if (Array.isArray(options.path)) {
      for (const filepath of options.path) {
        if (fs$1.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
    }
  } else {
    possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
  }
  if (fs$1.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}
function _resolveHome(envPath) {
  return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options) {
  const debug = Boolean(options && options.debug);
  const quiet = Boolean(options && options.quiet);
  if (debug || !quiet) {
    _log("Loading env from encrypted .env.vault");
  }
  const parsed = DotenvModule._parseVault(options);
  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }
  DotenvModule.populate(processEnv, parsed, options);
  return { parsed };
}
function configDotenv(options) {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  let encoding = "utf8";
  const debug = Boolean(options && options.debug);
  const quiet = Boolean(options && options.quiet);
  if (options && options.encoding) {
    encoding = options.encoding;
  } else {
    if (debug) {
      _debug("No encoding is specified. UTF-8 is used by default");
    }
  }
  let optionPaths = [dotenvPath];
  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [_resolveHome(options.path)];
    } else {
      optionPaths = [];
      for (const filepath of options.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }
  let lastError;
  const parsedAll = {};
  for (const path2 of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs$1.readFileSync(path2, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options);
    } catch (e) {
      if (debug) {
        _debug(`Failed to load ${path2} ${e.message}`);
      }
      lastError = e;
    }
  }
  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }
  const populated = DotenvModule.populate(processEnv, parsedAll, options);
  if (debug || !quiet) {
    const keysCount = Object.keys(populated).length;
    const shortPaths = [];
    for (const filePath of optionPaths) {
      try {
        const relative = path.relative(process.cwd(), filePath);
        shortPaths.push(relative);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${filePath} ${e.message}`);
        }
        lastError = e;
      }
    }
    _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} – [tip] encrypt with dotenvx: https://dotenvx.com`);
  }
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  } else {
    return { parsed: parsedAll };
  }
}
function config(options) {
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options);
  }
  const vaultPath = _vaultPath(options);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
    return DotenvModule.configDotenv(options);
  }
  return DotenvModule._configVault(options);
}
function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), "hex");
  let ciphertext = Buffer.from(encrypted, "base64");
  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);
  try {
    const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === "Invalid key length";
    const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
    if (isRange || invalidKeyLength) {
      const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    } else if (decryptionFailed) {
      const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      err.code = "DECRYPTION_FAILED";
      throw err;
    } else {
      throw error;
    }
  }
}
function populate(processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug);
  const override = Boolean(options && options.override);
  const populated = {};
  if (typeof parsed !== "object") {
    const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    err.code = "OBJECT_REQUIRED";
    throw err;
  }
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
      populated[key] = parsed[key];
    }
  }
  return populated;
}
const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};
main$1.exports.configDotenv = DotenvModule.configDotenv;
main$1.exports._configVault = DotenvModule._configVault;
main$1.exports._parseVault = DotenvModule._parseVault;
main$1.exports.config = DotenvModule.config;
main$1.exports.decrypt = DotenvModule.decrypt;
main$1.exports.parse = DotenvModule.parse;
main$1.exports.populate = DotenvModule.populate;
main$1.exports = DotenvModule;
var mainExports = main$1.exports;
const dotenv = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
var nodeCron = {};
var inlineScheduledTask = {};
var runner = {};
var createId = {};
var __importDefault$5 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(createId, "__esModule", { value: true });
createId.createID = createID;
const node_crypto_1 = __importDefault$5(require$$0$1);
function createID(prefix = "", length = 16) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = node_crypto_1.default.randomBytes(length);
  const id = Array.from(values, (v) => charset[v % charset.length]).join("");
  return prefix ? `${prefix}-${id}` : id;
}
var logger$1 = {};
Object.defineProperty(logger$1, "__esModule", { value: true });
const levelColors = {
  INFO: "\x1B[36m",
  WARN: "\x1B[33m",
  ERROR: "\x1B[31m",
  DEBUG: "\x1B[35m"
};
const GREEN = "\x1B[32m";
const RESET = "\x1B[0m";
function log(level, message, extra) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const color = levelColors[level] ?? "";
  const prefix = `[${timestamp}] [PID: ${process.pid}] ${GREEN}[NODE-CRON]${GREEN} ${color}[${level}]${RESET}`;
  const output = `${prefix} ${message}`;
  switch (level) {
    case "ERROR":
      console.error(output, extra ?? "");
      break;
    case "DEBUG":
      console.debug(output, extra ?? "");
      break;
    case "WARN":
      console.warn(output);
      break;
    case "INFO":
    default:
      console.info(output);
      break;
  }
}
const logger = {
  info(message) {
    log("INFO", message);
  },
  warn(message) {
    log("WARN", message);
  },
  error(message, err) {
    if (message instanceof Error) {
      log("ERROR", message.message, message);
    } else {
      log("ERROR", message, err);
    }
  },
  debug(message, err) {
    if (message instanceof Error) {
      log("DEBUG", message.message, message);
    } else {
      log("DEBUG", message, err);
    }
  }
};
logger$1.default = logger;
var trackedPromise = {};
Object.defineProperty(trackedPromise, "__esModule", { value: true });
trackedPromise.TrackedPromise = void 0;
class TrackedPromise {
  constructor(executor) {
    __publicField(this, "promise");
    __publicField(this, "error");
    __publicField(this, "state");
    __publicField(this, "value");
    this.state = "pending";
    this.promise = new Promise((resolve, reject) => {
      executor((value) => {
        this.state = "fulfilled";
        this.value = value;
        resolve(value);
      }, (error) => {
        this.state = "rejected";
        this.error = error;
        reject(error);
      });
    });
  }
  getPromise() {
    return this.promise;
  }
  getState() {
    return this.state;
  }
  isPending() {
    return this.state === "pending";
  }
  isFulfilled() {
    return this.state === "fulfilled";
  }
  isRejected() {
    return this.state === "rejected";
  }
  getValue() {
    return this.value;
  }
  getError() {
    return this.error;
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.promise.catch(onrejected);
  }
  finally(onfinally) {
    return this.promise.finally(onfinally);
  }
}
trackedPromise.TrackedPromise = TrackedPromise;
var __importDefault$4 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(runner, "__esModule", { value: true });
runner.Runner = void 0;
const create_id_1$2 = createId;
const logger_1$2 = __importDefault$4(logger$1);
const tracked_promise_1 = trackedPromise;
function emptyOnFn() {
}
function emptyHookFn() {
  return true;
}
function defaultOnError(date, error) {
  logger_1$2.default.error("Task failed with error!", error);
}
class Runner {
  constructor(timeMatcher2, onMatch, options) {
    __publicField(this, "timeMatcher");
    __publicField(this, "onMatch");
    __publicField(this, "noOverlap");
    __publicField(this, "maxExecutions");
    __publicField(this, "maxRandomDelay");
    __publicField(this, "runCount");
    __publicField(this, "running");
    __publicField(this, "heartBeatTimeout");
    __publicField(this, "onMissedExecution");
    __publicField(this, "onOverlap");
    __publicField(this, "onError");
    __publicField(this, "beforeRun");
    __publicField(this, "onFinished");
    __publicField(this, "onMaxExecutions");
    this.timeMatcher = timeMatcher2;
    this.onMatch = onMatch;
    this.noOverlap = options == void 0 || options.noOverlap === void 0 ? false : options.noOverlap;
    this.maxExecutions = options == null ? void 0 : options.maxExecutions;
    this.maxRandomDelay = (options == null ? void 0 : options.maxRandomDelay) || 0;
    this.onMissedExecution = (options == null ? void 0 : options.onMissedExecution) || emptyOnFn;
    this.onOverlap = (options == null ? void 0 : options.onOverlap) || emptyOnFn;
    this.onError = (options == null ? void 0 : options.onError) || defaultOnError;
    this.onFinished = (options == null ? void 0 : options.onFinished) || emptyHookFn;
    this.beforeRun = (options == null ? void 0 : options.beforeRun) || emptyHookFn;
    this.onMaxExecutions = (options == null ? void 0 : options.onMaxExecutions) || emptyOnFn;
    this.runCount = 0;
    this.running = false;
  }
  start() {
    this.running = true;
    let lastExecution;
    let expectedNextExecution;
    const scheduleNextHeartBeat = (currentDate) => {
      if (this.running) {
        clearTimeout(this.heartBeatTimeout);
        this.heartBeatTimeout = setTimeout(heartBeat, getDelay(this.timeMatcher, currentDate));
      }
    };
    const runTask = (date) => {
      return new Promise(async (resolve) => {
        const execution = {
          id: (0, create_id_1$2.createID)("exec"),
          reason: "scheduled"
        };
        const shouldExecute = await this.beforeRun(date, execution);
        const randomDelay = Math.floor(Math.random() * this.maxRandomDelay);
        if (shouldExecute) {
          setTimeout(async () => {
            try {
              this.runCount++;
              execution.startedAt = /* @__PURE__ */ new Date();
              const result = await this.onMatch(date, execution);
              execution.finishedAt = /* @__PURE__ */ new Date();
              execution.result = result;
              this.onFinished(date, execution);
              if (this.maxExecutions && this.runCount >= this.maxExecutions) {
                this.onMaxExecutions(date);
                this.stop();
              }
            } catch (error) {
              execution.finishedAt = /* @__PURE__ */ new Date();
              execution.error = error;
              this.onError(date, error, execution);
            }
            resolve(true);
          }, randomDelay);
        }
      });
    };
    const checkAndRun = (date) => {
      return new tracked_promise_1.TrackedPromise(async (resolve, reject) => {
        try {
          if (this.timeMatcher.match(date)) {
            await runTask(date);
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });
    };
    const heartBeat = async () => {
      const currentDate = nowWithoutMs();
      if (expectedNextExecution && expectedNextExecution.getTime() < currentDate.getTime()) {
        while (expectedNextExecution.getTime() < currentDate.getTime()) {
          logger_1$2.default.warn(`missed execution at ${expectedNextExecution}! Possible blocking IO or high CPU user at the same process used by node-cron.`);
          expectedNextExecution = this.timeMatcher.getNextMatch(expectedNextExecution);
          runAsync(this.onMissedExecution, expectedNextExecution, defaultOnError);
        }
      }
      if (lastExecution && lastExecution.getState() === "pending") {
        runAsync(this.onOverlap, currentDate, defaultOnError);
        if (this.noOverlap) {
          logger_1$2.default.warn("task still running, new execution blocked by overlap prevention!");
          expectedNextExecution = this.timeMatcher.getNextMatch(currentDate);
          scheduleNextHeartBeat(currentDate);
          return;
        }
      }
      lastExecution = checkAndRun(currentDate);
      expectedNextExecution = this.timeMatcher.getNextMatch(currentDate);
      scheduleNextHeartBeat(currentDate);
    };
    this.heartBeatTimeout = setTimeout(() => {
      heartBeat();
    }, getDelay(this.timeMatcher, nowWithoutMs()));
  }
  nextRun() {
    return this.timeMatcher.getNextMatch(/* @__PURE__ */ new Date());
  }
  stop() {
    this.running = false;
    if (this.heartBeatTimeout) {
      clearTimeout(this.heartBeatTimeout);
      this.heartBeatTimeout = void 0;
    }
  }
  isStarted() {
    return !!this.heartBeatTimeout && this.running;
  }
  isStopped() {
    return !this.isStarted();
  }
  async execute() {
    const date = /* @__PURE__ */ new Date();
    const execution = {
      id: (0, create_id_1$2.createID)("exec"),
      reason: "invoked"
    };
    try {
      const shouldExecute = await this.beforeRun(date, execution);
      if (shouldExecute) {
        this.runCount++;
        execution.startedAt = /* @__PURE__ */ new Date();
        const result = await this.onMatch(date, execution);
        execution.finishedAt = /* @__PURE__ */ new Date();
        execution.result = result;
        this.onFinished(date, execution);
      }
    } catch (error) {
      execution.finishedAt = /* @__PURE__ */ new Date();
      execution.error = error;
      this.onError(date, error, execution);
    }
  }
}
runner.Runner = Runner;
async function runAsync(fn, date, onError) {
  try {
    await fn(date);
  } catch (error) {
    onError(date, error);
  }
}
function getDelay(timeMatcher2, currentDate) {
  const maxDelay = 864e5;
  const nextRun = timeMatcher2.getNextMatch(currentDate);
  const now = /* @__PURE__ */ new Date();
  const delay = nextRun.getTime() - now.getTime();
  if (delay > maxDelay) {
    return maxDelay;
  }
  return Math.max(0, delay);
}
function nowWithoutMs() {
  const date = /* @__PURE__ */ new Date();
  date.setMilliseconds(0);
  return date;
}
var timeMatcher = {};
var convertion = {};
var monthNamesConversion = {};
Object.defineProperty(monthNamesConversion, "__esModule", { value: true });
monthNamesConversion.default = /* @__PURE__ */ (() => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ];
  const shortMonths = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec"
  ];
  function convertMonthName(expression, items) {
    for (let i = 0; i < items.length; i++) {
      expression = expression.replace(new RegExp(items[i], "gi"), i + 1);
    }
    return expression;
  }
  function interprete(monthExpression) {
    monthExpression = convertMonthName(monthExpression, months);
    monthExpression = convertMonthName(monthExpression, shortMonths);
    return monthExpression;
  }
  return interprete;
})();
var weekDayNamesConversion = {};
Object.defineProperty(weekDayNamesConversion, "__esModule", { value: true });
weekDayNamesConversion.default = /* @__PURE__ */ (() => {
  const weekDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  const shortWeekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  function convertWeekDayName(expression, items) {
    for (let i = 0; i < items.length; i++) {
      expression = expression.replace(new RegExp(items[i], "gi"), i);
    }
    return expression;
  }
  function convertWeekDays(expression) {
    expression = expression.replace("7", "0");
    expression = convertWeekDayName(expression, weekDays);
    return convertWeekDayName(expression, shortWeekDays);
  }
  return convertWeekDays;
})();
var asteriskToRangeConversion = {};
Object.defineProperty(asteriskToRangeConversion, "__esModule", { value: true });
asteriskToRangeConversion.default = /* @__PURE__ */ (() => {
  function convertAsterisk(expression, replecement) {
    if (expression.indexOf("*") !== -1) {
      return expression.replace("*", replecement);
    }
    return expression;
  }
  function convertAsterisksToRanges(expressions) {
    expressions[0] = convertAsterisk(expressions[0], "0-59");
    expressions[1] = convertAsterisk(expressions[1], "0-59");
    expressions[2] = convertAsterisk(expressions[2], "0-23");
    expressions[3] = convertAsterisk(expressions[3], "1-31");
    expressions[4] = convertAsterisk(expressions[4], "1-12");
    expressions[5] = convertAsterisk(expressions[5], "0-6");
    return expressions;
  }
  return convertAsterisksToRanges;
})();
var rangeConversion = {};
Object.defineProperty(rangeConversion, "__esModule", { value: true });
rangeConversion.default = /* @__PURE__ */ (() => {
  function replaceWithRange(expression, text, init, end, stepTxt) {
    const step = parseInt(stepTxt);
    const numbers = [];
    let last = parseInt(end);
    let first = parseInt(init);
    if (first > last) {
      last = parseInt(init);
      first = parseInt(end);
    }
    for (let i = first; i <= last; i += step) {
      numbers.push(i);
    }
    return expression.replace(new RegExp(text, "i"), numbers.join());
  }
  function convertRange(expression) {
    const rangeRegEx = /(\d+)-(\d+)(\/(\d+)|)/;
    let match = rangeRegEx.exec(expression);
    while (match !== null && match.length > 0) {
      expression = replaceWithRange(expression, match[0], match[1], match[2], match[4] || "1");
      match = rangeRegEx.exec(expression);
    }
    return expression;
  }
  function convertAllRanges(expressions) {
    for (let i = 0; i < expressions.length; i++) {
      expressions[i] = convertRange(expressions[i]);
    }
    return expressions;
  }
  return convertAllRanges;
})();
var __importDefault$3 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(convertion, "__esModule", { value: true });
const month_names_conversion_1 = __importDefault$3(monthNamesConversion);
const week_day_names_conversion_1 = __importDefault$3(weekDayNamesConversion);
const asterisk_to_range_conversion_1 = __importDefault$3(asteriskToRangeConversion);
const range_conversion_1 = __importDefault$3(rangeConversion);
convertion.default = /* @__PURE__ */ (() => {
  function appendSeccondExpression(expressions) {
    if (expressions.length === 5) {
      return ["0"].concat(expressions);
    }
    return expressions;
  }
  function removeSpaces(str) {
    return str.replace(/\s{2,}/g, " ").trim();
  }
  function normalizeIntegers(expressions) {
    for (let i = 0; i < expressions.length; i++) {
      const numbers = expressions[i].split(",");
      for (let j = 0; j < numbers.length; j++) {
        numbers[j] = parseInt(numbers[j]);
      }
      expressions[i] = numbers;
    }
    return expressions;
  }
  function interprete(expression) {
    let expressions = removeSpaces(`${expression}`).split(" ");
    expressions = appendSeccondExpression(expressions);
    expressions[4] = (0, month_names_conversion_1.default)(expressions[4]);
    expressions[5] = (0, week_day_names_conversion_1.default)(expressions[5]);
    expressions = (0, asterisk_to_range_conversion_1.default)(expressions);
    expressions = (0, range_conversion_1.default)(expressions);
    expressions = normalizeIntegers(expressions);
    return expressions;
  }
  return interprete;
})();
var localizedTime = {};
Object.defineProperty(localizedTime, "__esModule", { value: true });
localizedTime.LocalizedTime = void 0;
class LocalizedTime {
  constructor(date, timezone) {
    __publicField(this, "timestamp");
    __publicField(this, "parts");
    __publicField(this, "timezone");
    this.timestamp = date.getTime();
    this.timezone = timezone;
    this.parts = buildDateParts(date, timezone);
  }
  toDate() {
    return new Date(this.timestamp);
  }
  toISO() {
    const gmt = this.parts.gmt.replace(/^GMT/, "");
    const offset = gmt ? gmt : "Z";
    const pad = (n) => String(n).padStart(2, "0");
    return `${this.parts.year}-${pad(this.parts.month)}-${pad(this.parts.day)}T${pad(this.parts.hour)}:${pad(this.parts.minute)}:${pad(this.parts.second)}.${String(this.parts.milisecond).padStart(3, "0")}` + offset;
  }
  getParts() {
    return this.parts;
  }
  set(field, value) {
    this.parts[field] = value;
    const newDate = new Date(this.toISO());
    this.timestamp = newDate.getTime();
    this.parts = buildDateParts(newDate, this.timezone);
  }
}
localizedTime.LocalizedTime = LocalizedTime;
function buildDateParts(date, timezone) {
  const dftOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false
  };
  if (timezone) {
    dftOptions.timeZone = timezone;
  }
  const dateFormat = new Intl.DateTimeFormat("en-US", dftOptions);
  const parts = dateFormat.formatToParts(date).filter((part) => {
    return part.type !== "literal";
  }).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    day: parseInt(parts.day),
    month: parseInt(parts.month),
    year: parseInt(parts.year),
    hour: parts.hour === "24" ? 0 : parseInt(parts.hour),
    minute: parseInt(parts.minute),
    second: parseInt(parts.second),
    milisecond: date.getMilliseconds(),
    weekday: parts.weekday,
    gmt: getTimezoneGMT(date, timezone)
  };
}
function getTimezoneGMT(date, timezone) {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  let offsetInMinutes = (utcDate.getTime() - tzDate.getTime()) / 6e4;
  const sign = offsetInMinutes <= 0 ? "+" : "-";
  offsetInMinutes = Math.abs(offsetInMinutes);
  if (offsetInMinutes === 0)
    return "Z";
  const hours = Math.floor(offsetInMinutes / 60).toString().padStart(2, "0");
  const minutes = Math.floor(offsetInMinutes % 60).toString().padStart(2, "0");
  return `GMT${sign}${hours}:${minutes}`;
}
var matcherWalker = {};
var hasRequiredMatcherWalker;
function requireMatcherWalker() {
  if (hasRequiredMatcherWalker) return matcherWalker;
  hasRequiredMatcherWalker = 1;
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(matcherWalker, "__esModule", { value: true });
  matcherWalker.MatcherWalker = void 0;
  const convertion_1 = __importDefault2(convertion);
  const localized_time_12 = localizedTime;
  const time_matcher_12 = requireTimeMatcher();
  const week_day_names_conversion_12 = __importDefault2(weekDayNamesConversion);
  class MatcherWalker {
    constructor(cronExpression, baseDate, timezone) {
      __publicField(this, "cronExpression");
      __publicField(this, "baseDate");
      __publicField(this, "pattern");
      __publicField(this, "expressions");
      __publicField(this, "timeMatcher");
      __publicField(this, "timezone");
      this.cronExpression = cronExpression;
      this.baseDate = baseDate;
      this.timeMatcher = new time_matcher_12.TimeMatcher(cronExpression, timezone);
      this.timezone = timezone;
      this.expressions = (0, convertion_1.default)(cronExpression);
    }
    isMatching() {
      return this.timeMatcher.match(this.baseDate);
    }
    matchNext() {
      const findNextDateIgnoringWeekday = () => {
        const baseDate = new Date(this.baseDate.getTime());
        baseDate.setMilliseconds(0);
        const localTime = new localized_time_12.LocalizedTime(baseDate, this.timezone);
        const dateParts = localTime.getParts();
        const date2 = new localized_time_12.LocalizedTime(localTime.toDate(), this.timezone);
        const seconds = this.expressions[0];
        const nextSecond = availableValue(seconds, dateParts.second);
        if (nextSecond) {
          date2.set("second", nextSecond);
          if (this.timeMatcher.match(date2.toDate())) {
            return date2;
          }
        }
        date2.set("second", seconds[0]);
        const minutes = this.expressions[1];
        const nextMinute = availableValue(minutes, dateParts.minute);
        if (nextMinute) {
          date2.set("minute", nextMinute);
          if (this.timeMatcher.match(date2.toDate())) {
            return date2;
          }
        }
        date2.set("minute", minutes[0]);
        const hours = this.expressions[2];
        const nextHour = availableValue(hours, dateParts.hour);
        if (nextHour) {
          date2.set("hour", nextHour);
          if (this.timeMatcher.match(date2.toDate())) {
            return date2;
          }
        }
        date2.set("hour", hours[0]);
        const days = this.expressions[3];
        const nextDay = availableValue(days, dateParts.day);
        if (nextDay) {
          date2.set("day", nextDay);
          if (this.timeMatcher.match(date2.toDate())) {
            return date2;
          }
        }
        date2.set("day", days[0]);
        const months = this.expressions[4];
        const nextMonth = availableValue(months, dateParts.month);
        if (nextMonth) {
          date2.set("month", nextMonth);
          if (this.timeMatcher.match(date2.toDate())) {
            return date2;
          }
        }
        date2.set("year", date2.getParts().year + 1);
        date2.set("month", months[0]);
        return date2;
      };
      const date = findNextDateIgnoringWeekday();
      const weekdays = this.expressions[5];
      let currentWeekday = parseInt((0, week_day_names_conversion_12.default)(date.getParts().weekday));
      while (!(weekdays.indexOf(currentWeekday) > -1)) {
        date.set("year", date.getParts().year + 1);
        currentWeekday = parseInt((0, week_day_names_conversion_12.default)(date.getParts().weekday));
      }
      return date;
    }
  }
  matcherWalker.MatcherWalker = MatcherWalker;
  function availableValue(values, currentValue) {
    const availableValues = values.sort((a, b) => a - b).filter((s) => s > currentValue);
    if (availableValues.length > 0)
      return availableValues[0];
    return false;
  }
  return matcherWalker;
}
var hasRequiredTimeMatcher;
function requireTimeMatcher() {
  if (hasRequiredTimeMatcher) return timeMatcher;
  hasRequiredTimeMatcher = 1;
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(timeMatcher, "__esModule", { value: true });
  timeMatcher.TimeMatcher = void 0;
  const index_12 = __importDefault2(convertion);
  const week_day_names_conversion_12 = __importDefault2(weekDayNamesConversion);
  const localized_time_12 = localizedTime;
  const matcher_walker_1 = requireMatcherWalker();
  function matchValue(allowedValues, value) {
    return allowedValues.indexOf(value) !== -1;
  }
  class TimeMatcher {
    constructor(pattern, timezone) {
      __publicField(this, "timezone");
      __publicField(this, "pattern");
      __publicField(this, "expressions");
      this.timezone = timezone;
      this.pattern = pattern;
      this.expressions = (0, index_12.default)(pattern);
    }
    match(date) {
      const localizedTime2 = new localized_time_12.LocalizedTime(date, this.timezone);
      const parts = localizedTime2.getParts();
      const runOnSecond = matchValue(this.expressions[0], parts.second);
      const runOnMinute = matchValue(this.expressions[1], parts.minute);
      const runOnHour = matchValue(this.expressions[2], parts.hour);
      const runOnDay = matchValue(this.expressions[3], parts.day);
      const runOnMonth = matchValue(this.expressions[4], parts.month);
      const runOnWeekDay = matchValue(this.expressions[5], parseInt((0, week_day_names_conversion_12.default)(parts.weekday)));
      return runOnSecond && runOnMinute && runOnHour && runOnDay && runOnMonth && runOnWeekDay;
    }
    getNextMatch(date) {
      const walker = new matcher_walker_1.MatcherWalker(this.pattern, date, this.timezone);
      const next = walker.matchNext();
      return next.toDate();
    }
  }
  timeMatcher.TimeMatcher = TimeMatcher;
  return timeMatcher;
}
var stateMachine = {};
Object.defineProperty(stateMachine, "__esModule", { value: true });
stateMachine.StateMachine = void 0;
const allowedTransitions = {
  "stopped": ["stopped", "idle", "destroyed"],
  "idle": ["idle", "running", "stopped", "destroyed"],
  "running": ["running", "idle", "stopped", "destroyed"],
  "destroyed": ["destroyed"]
};
class StateMachine {
  constructor(initial = "stopped") {
    __publicField(this, "state");
    this.state = initial;
  }
  changeState(state) {
    if (allowedTransitions[this.state].includes(state)) {
      this.state = state;
    } else {
      throw new Error(`invalid transition from ${this.state} to ${state}`);
    }
  }
}
stateMachine.StateMachine = StateMachine;
var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(inlineScheduledTask, "__esModule", { value: true });
inlineScheduledTask.InlineScheduledTask = void 0;
const events_1 = __importDefault$2(require$$0$2);
const runner_1 = runner;
const time_matcher_1$1 = requireTimeMatcher();
const create_id_1$1 = createId;
const state_machine_1$1 = stateMachine;
const logger_1$1 = __importDefault$2(logger$1);
const localized_time_1$1 = localizedTime;
let TaskEmitter$1 = class TaskEmitter extends events_1.default {
};
class InlineScheduledTask {
  constructor(cronExpression, taskFn, options) {
    __publicField(this, "emitter");
    __publicField(this, "cronExpression");
    __publicField(this, "timeMatcher");
    __publicField(this, "runner");
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "stateMachine");
    __publicField(this, "timezone");
    this.emitter = new TaskEmitter$1();
    this.cronExpression = cronExpression;
    this.id = (0, create_id_1$1.createID)("task", 12);
    this.name = (options == null ? void 0 : options.name) || this.id;
    this.timezone = options == null ? void 0 : options.timezone;
    this.timeMatcher = new time_matcher_1$1.TimeMatcher(cronExpression, options == null ? void 0 : options.timezone);
    this.stateMachine = new state_machine_1$1.StateMachine();
    const runnerOptions = {
      timezone: options == null ? void 0 : options.timezone,
      noOverlap: options == null ? void 0 : options.noOverlap,
      maxExecutions: options == null ? void 0 : options.maxExecutions,
      maxRandomDelay: options == null ? void 0 : options.maxRandomDelay,
      beforeRun: (date, execution) => {
        if (execution.reason === "scheduled") {
          this.changeState("running");
        }
        this.emitter.emit("execution:started", this.createContext(date, execution));
        return true;
      },
      onFinished: (date, execution) => {
        if (execution.reason === "scheduled") {
          this.changeState("idle");
        }
        this.emitter.emit("execution:finished", this.createContext(date, execution));
        return true;
      },
      onError: (date, error, execution) => {
        logger_1$1.default.error(error);
        this.emitter.emit("execution:failed", this.createContext(date, execution));
        this.changeState("idle");
      },
      onOverlap: (date) => {
        this.emitter.emit("execution:overlap", this.createContext(date));
      },
      onMissedExecution: (date) => {
        this.emitter.emit("execution:missed", this.createContext(date));
      },
      onMaxExecutions: (date) => {
        this.emitter.emit("execution:maxReached", this.createContext(date));
        this.destroy();
      }
    };
    this.runner = new runner_1.Runner(this.timeMatcher, (date, execution) => {
      return taskFn(this.createContext(date, execution));
    }, runnerOptions);
  }
  getNextRun() {
    if (this.stateMachine.state !== "stopped") {
      return this.runner.nextRun();
    }
    return null;
  }
  changeState(state) {
    if (this.runner.isStarted()) {
      this.stateMachine.changeState(state);
    }
  }
  start() {
    if (this.runner.isStopped()) {
      this.runner.start();
      this.stateMachine.changeState("idle");
      this.emitter.emit("task:started", this.createContext(/* @__PURE__ */ new Date()));
    }
  }
  stop() {
    if (this.runner.isStarted()) {
      this.runner.stop();
      this.stateMachine.changeState("stopped");
      this.emitter.emit("task:stopped", this.createContext(/* @__PURE__ */ new Date()));
    }
  }
  getStatus() {
    return this.stateMachine.state;
  }
  destroy() {
    if (this.stateMachine.state === "destroyed")
      return;
    this.stop();
    this.stateMachine.changeState("destroyed");
    this.emitter.emit("task:destroyed", this.createContext(/* @__PURE__ */ new Date()));
  }
  execute() {
    return new Promise((resolve, reject) => {
      const onFail = (context) => {
        var _a;
        this.off("execution:finished", onFail);
        reject((_a = context.execution) == null ? void 0 : _a.error);
      };
      const onFinished = (context) => {
        var _a;
        this.off("execution:failed", onFail);
        resolve((_a = context.execution) == null ? void 0 : _a.result);
      };
      this.once("execution:finished", onFinished);
      this.once("execution:failed", onFail);
      this.runner.execute();
    });
  }
  on(event, fun) {
    this.emitter.on(event, fun);
  }
  off(event, fun) {
    this.emitter.off(event, fun);
  }
  once(event, fun) {
    this.emitter.once(event, fun);
  }
  createContext(executionDate, execution) {
    const localTime = new localized_time_1$1.LocalizedTime(executionDate, this.timezone);
    const ctx = {
      date: localTime.toDate(),
      dateLocalIso: localTime.toISO(),
      triggeredAt: /* @__PURE__ */ new Date(),
      task: this,
      execution
    };
    return ctx;
  }
}
inlineScheduledTask.InlineScheduledTask = InlineScheduledTask;
var taskRegistry = {};
Object.defineProperty(taskRegistry, "__esModule", { value: true });
taskRegistry.TaskRegistry = void 0;
const tasks = /* @__PURE__ */ new Map();
class TaskRegistry {
  add(task) {
    if (this.has(task.id)) {
      throw Error(`task ${task.id} already registred!`);
    }
    tasks.set(task.id, task);
    task.on("task:destroyed", () => {
      this.remove(task);
    });
  }
  get(taskId) {
    return tasks.get(taskId);
  }
  remove(task) {
    if (this.has(task.id)) {
      task == null ? void 0 : task.destroy();
      tasks.delete(task.id);
    }
  }
  all() {
    return tasks;
  }
  has(taskId) {
    return tasks.has(taskId);
  }
  killAll() {
    tasks.forEach((id) => this.remove(id));
  }
}
taskRegistry.TaskRegistry = TaskRegistry;
var patternValidation = {};
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(patternValidation, "__esModule", { value: true });
const index_1 = __importDefault$1(convertion);
const validationRegex = /^(?:\d+|\*|\*\/\d+)$/;
function isValidExpression(expression, min, max) {
  const options = expression;
  for (const option of options) {
    const optionAsInt = parseInt(option, 10);
    if (!Number.isNaN(optionAsInt) && (optionAsInt < min || optionAsInt > max) || !validationRegex.test(option))
      return false;
  }
  return true;
}
function isInvalidSecond(expression) {
  return !isValidExpression(expression, 0, 59);
}
function isInvalidMinute(expression) {
  return !isValidExpression(expression, 0, 59);
}
function isInvalidHour(expression) {
  return !isValidExpression(expression, 0, 23);
}
function isInvalidDayOfMonth(expression) {
  return !isValidExpression(expression, 1, 31);
}
function isInvalidMonth(expression) {
  return !isValidExpression(expression, 1, 12);
}
function isInvalidWeekDay(expression) {
  return !isValidExpression(expression, 0, 7);
}
function validateFields(patterns, executablePatterns) {
  if (isInvalidSecond(executablePatterns[0]))
    throw new Error(`${patterns[0]} is a invalid expression for second`);
  if (isInvalidMinute(executablePatterns[1]))
    throw new Error(`${patterns[1]} is a invalid expression for minute`);
  if (isInvalidHour(executablePatterns[2]))
    throw new Error(`${patterns[2]} is a invalid expression for hour`);
  if (isInvalidDayOfMonth(executablePatterns[3]))
    throw new Error(`${patterns[3]} is a invalid expression for day of month`);
  if (isInvalidMonth(executablePatterns[4]))
    throw new Error(`${patterns[4]} is a invalid expression for month`);
  if (isInvalidWeekDay(executablePatterns[5]))
    throw new Error(`${patterns[5]} is a invalid expression for week day`);
}
function validate(pattern) {
  if (typeof pattern !== "string")
    throw new TypeError("pattern must be a string!");
  const patterns = pattern.split(" ");
  const executablePatterns = (0, index_1.default)(pattern);
  if (patterns.length === 5)
    patterns.unshift("0");
  validateFields(patterns, executablePatterns);
}
patternValidation.default = validate;
var backgroundScheduledTask = {};
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(backgroundScheduledTask, "__esModule", { value: true });
const path_1 = require$$1;
const child_process_1 = require$$1$1;
const create_id_1 = createId;
const stream_1 = require$$3$1;
const state_machine_1 = stateMachine;
const localized_time_1 = localizedTime;
const logger_1 = __importDefault(logger$1);
const time_matcher_1 = requireTimeMatcher();
const daemonPath = (0, path_1.resolve)(__dirname, "daemon.js");
class TaskEmitter2 extends stream_1.EventEmitter {
}
class BackgroundScheduledTask {
  constructor(cronExpression, taskPath, options) {
    __publicField(this, "emitter");
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "cronExpression");
    __publicField(this, "taskPath");
    __publicField(this, "options");
    __publicField(this, "forkProcess");
    __publicField(this, "stateMachine");
    this.cronExpression = cronExpression;
    this.taskPath = taskPath;
    this.options = options;
    this.id = (0, create_id_1.createID)("task");
    this.name = (options == null ? void 0 : options.name) || this.id;
    this.emitter = new TaskEmitter2();
    this.stateMachine = new state_machine_1.StateMachine("stopped");
    this.on("task:stopped", () => {
      var _a;
      (_a = this.forkProcess) == null ? void 0 : _a.kill();
      this.forkProcess = void 0;
      this.stateMachine.changeState("stopped");
    });
    this.on("task:destroyed", () => {
      var _a;
      (_a = this.forkProcess) == null ? void 0 : _a.kill();
      this.forkProcess = void 0;
      this.stateMachine.changeState("destroyed");
    });
  }
  getNextRun() {
    var _a;
    if (this.stateMachine.state !== "stopped") {
      const timeMatcher2 = new time_matcher_1.TimeMatcher(this.cronExpression, (_a = this.options) == null ? void 0 : _a.timezone);
      return timeMatcher2.getNextMatch(/* @__PURE__ */ new Date());
    }
    return null;
  }
  start() {
    return new Promise((resolve, reject) => {
      if (this.forkProcess) {
        return resolve(void 0);
      }
      const timeout = setTimeout(() => {
        reject(new Error("Start operation timed out"));
      }, 5e3);
      try {
        this.forkProcess = (0, child_process_1.fork)(daemonPath);
        this.forkProcess.on("error", (err) => {
          clearTimeout(timeout);
          reject(new Error(`Error on daemon: ${err.message}`));
        });
        this.forkProcess.on("exit", (code, signal) => {
          if (code !== 0 && signal !== "SIGTERM") {
            const erro = new Error(`node-cron daemon exited with code ${code || signal}`);
            logger_1.default.error(erro);
            clearTimeout(timeout);
            reject(erro);
          }
        });
        this.forkProcess.on("message", (message) => {
          var _a, _b, _c, _d, _e, _f;
          if (message.jsonError) {
            if ((_a = message.context) == null ? void 0 : _a.execution) {
              message.context.execution.error = deserializeError(message.jsonError);
              delete message.jsonError;
            }
          }
          if ((_c = (_b = message.context) == null ? void 0 : _b.task) == null ? void 0 : _c.state) {
            this.stateMachine.changeState((_e = (_d = message.context) == null ? void 0 : _d.task) == null ? void 0 : _e.state);
          }
          if (message.context) {
            const execution = (_f = message.context) == null ? void 0 : _f.execution;
            execution == null ? true : delete execution.hasError;
            const context = this.createContext(new Date(message.context.date), execution);
            this.emitter.emit(message.event, context);
          }
        });
        this.once("task:started", () => {
          this.stateMachine.changeState("idle");
          clearTimeout(timeout);
          resolve(void 0);
        });
        this.forkProcess.send({
          command: "task:start",
          path: (0, path_1.resolve)(this.taskPath),
          cron: this.cronExpression,
          options: this.options
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.forkProcess) {
        return resolve(void 0);
      }
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error("Stop operation timed out"));
      }, 5e3);
      const cleanupAndResolve = () => {
        clearTimeout(timeoutId);
        this.off("task:stopped", onStopped);
        this.forkProcess = void 0;
        resolve(void 0);
      };
      const onStopped = () => {
        cleanupAndResolve();
      };
      this.once("task:stopped", onStopped);
      this.forkProcess.send({
        command: "task:stop"
      });
    });
  }
  getStatus() {
    return this.stateMachine.state;
  }
  destroy() {
    return new Promise((resolve, reject) => {
      if (!this.forkProcess) {
        return resolve(void 0);
      }
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error("Destroy operation timed out"));
      }, 5e3);
      const onDestroy = () => {
        clearTimeout(timeoutId);
        this.off("task:destroyed", onDestroy);
        resolve(void 0);
      };
      this.once("task:destroyed", onDestroy);
      this.forkProcess.send({
        command: "task:destroy"
      });
    });
  }
  execute() {
    return new Promise((resolve, reject) => {
      if (!this.forkProcess) {
        return reject(new Error("Cannot execute background task because it hasn't been started yet. Please initialize the task using the start() method before attempting to execute it."));
      }
      const timeoutId = setTimeout(() => {
        cleanupListeners();
        reject(new Error("Execution timeout exceeded"));
      }, 5e3);
      const cleanupListeners = () => {
        clearTimeout(timeoutId);
        this.off("execution:finished", onFinished);
        this.off("execution:failed", onFail);
      };
      const onFinished = (context) => {
        var _a;
        cleanupListeners();
        resolve((_a = context.execution) == null ? void 0 : _a.result);
      };
      const onFail = (context) => {
        var _a;
        cleanupListeners();
        reject(((_a = context.execution) == null ? void 0 : _a.error) || new Error("Execution failed without specific error"));
      };
      this.once("execution:finished", onFinished);
      this.once("execution:failed", onFail);
      this.forkProcess.send({
        command: "task:execute"
      });
    });
  }
  on(event, fun) {
    this.emitter.on(event, fun);
  }
  off(event, fun) {
    this.emitter.off(event, fun);
  }
  once(event, fun) {
    this.emitter.once(event, fun);
  }
  createContext(executionDate, execution) {
    var _a;
    const localTime = new localized_time_1.LocalizedTime(executionDate, (_a = this.options) == null ? void 0 : _a.timezone);
    const ctx = {
      date: localTime.toDate(),
      dateLocalIso: localTime.toISO(),
      triggeredAt: /* @__PURE__ */ new Date(),
      task: this,
      execution
    };
    return ctx;
  }
}
function deserializeError(str) {
  const data = JSON.parse(str);
  const Err = globalThis[data.name] || Error;
  const err = new Err(data.message);
  if (data.stack) {
    err.stack = data.stack;
  }
  Object.keys(data).forEach((key) => {
    if (!["name", "message", "stack"].includes(key)) {
      err[key] = data[key];
    }
  });
  return err;
}
backgroundScheduledTask.default = BackgroundScheduledTask;
(function(exports2) {
  var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.nodeCron = exports2.getTask = exports2.getTasks = void 0;
  exports2.schedule = schedule;
  exports2.createTask = createTask;
  exports2.validate = validate2;
  const inline_scheduled_task_1 = inlineScheduledTask;
  const task_registry_1 = taskRegistry;
  const pattern_validation_1 = __importDefault2(patternValidation);
  const background_scheduled_task_1 = __importDefault2(backgroundScheduledTask);
  const path_12 = __importDefault2(require$$1);
  const registry = new task_registry_1.TaskRegistry();
  function schedule(expression, func, options) {
    const task = createTask(expression, func, options);
    task.start();
    return task;
  }
  function createTask(expression, func, options) {
    let task;
    if (func instanceof Function) {
      task = new inline_scheduled_task_1.InlineScheduledTask(expression, func, options);
    } else {
      const taskPath = solvePath(func);
      task = new background_scheduled_task_1.default(expression, taskPath, options);
    }
    registry.add(task);
    return task;
  }
  function solvePath(filePath) {
    var _a;
    if (path_12.default.isAbsolute(filePath))
      return filePath;
    const stackLines = (_a = new Error().stack) == null ? void 0 : _a.split("\n");
    if (stackLines) {
      stackLines == null ? void 0 : stackLines.shift();
      const callerLine = stackLines == null ? void 0 : stackLines.find((line) => {
        return line.indexOf(__filename) === -1;
      });
      const match = callerLine == null ? void 0 : callerLine.match(/(file:\/\/|)(\/.+):\d+:\d+/);
      if (match) {
        const dir = path_12.default.dirname(match[2]);
        return path_12.default.resolve(dir, filePath);
      }
    }
    throw new Error(`Could not locate task file ${filePath}`);
  }
  function validate2(expression) {
    try {
      (0, pattern_validation_1.default)(expression);
      return true;
    } catch (e) {
      return false;
    }
  }
  exports2.getTasks = registry.all;
  exports2.getTask = registry.get;
  exports2.nodeCron = {
    schedule,
    createTask,
    validate: validate2,
    getTasks: exports2.getTasks,
    getTask: exports2.getTask
  };
  exports2.default = exports2.nodeCron;
})(nodeCron);
const cron = /* @__PURE__ */ getDefaultExportFromCjs(nodeCron);
const { google } = require("googleapis");
const fs = require("fs").promises;
const http = require("http");
const url = require("url");
let oauthServer = null;
require("https");
require("querystring");
dotenv.config();
const databaseService = require("./database.cjs");
const __dirname$1 = path$1.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.cjs", document.baseURI).href));
const GOOGLE_CLIENT_ID = "1033737566088-noa8bfdjlj4kfed2c0d5obvgjo0jbb4a.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
let oauth2Client = null;
function createOAuth2Client(port = 3e3) {
  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `http://localhost:${port}/oauth/callback`
  );
  client.transporter;
  client.getToken = async function(codeOrOptions) {
    const options = typeof codeOrOptions === "string" ? { code: codeOrOptions } : codeOrOptions;
    const tokenData = {
      code: options.code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `http://localhost:${port}/oauth/callback`,
      grant_type: "authorization_code"
    };
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(tokenData).toString()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error} - ${errorData.error_description}`);
    }
    const tokens = await response.json();
    this.setCredentials(tokens);
    return { tokens };
  };
  return client;
}
process.env.DIST = path$1.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path$1.join(process.env.DIST, "../public");
let win;
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.cjs"),
      nodeIntegration: true,
      contextIsolation: true
    },
    titleBarStyle: "default",
    show: false
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(process.env.DIST, "index.html"));
  }
  win.once("ready-to-show", () => {
    win.show();
  });
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
let autoBackupJob = null;
function setupAutoBackup() {
  try {
    const settings = databaseService.getAutoBackupSettings();
    if (settings.enabled) {
      const [hour, minute] = settings.time.split(":").map(Number);
      autoBackupJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
        console.log("Running automatic Google Drive backup...");
        try {
          const auth = await loadSavedTokens();
          if (auth) {
            const result = await databaseService.backupToGoogleDrive(auth);
            if (win && !win.isDestroyed()) {
              win.webContents.send("auto-backup-completed", {
                success: result.success,
                message: result.success ? `Auto backup completed: ${result.filename}` : `Auto backup failed: ${result.error}`,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          } else {
            console.log("No Google Drive authentication found for auto backup");
            if (win && !win.isDestroyed()) {
              win.webContents.send("auto-backup-completed", {
                success: false,
                message: "Auto backup failed: Google Drive not authenticated",
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          }
        } catch (error) {
          console.error("Auto backup error:", error);
          if (win && !win.isDestroyed()) {
            win.webContents.send("auto-backup-completed", {
              success: false,
              message: `Auto backup failed: ${error.message}`,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
      }, {
        scheduled: false,
        timezone: "Asia/Beirut"
      });
      autoBackupJob.start();
      console.log(`Auto backup restored from settings: ${settings.time} daily`);
    }
  } catch (error) {
    console.error("Error setting up auto backup from saved settings:", error);
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  const template = [
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            electron.app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
  registerIpcHandlers();
  setupAutoBackup();
  databaseService.createDefaultAdminIfNeeded();
  console.log("Auto backup scheduler started - will run daily at 1:00 PM");
});
function createOAuthServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    let serverPort = null;
    server.on("request", (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      if (parsedUrl.pathname === "/oauth/callback") {
        const { code, error } = parsedUrl.query;
        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<html><body><h1>Authentication Failed</h1><p>Error: ${error}</p><p>You can close this window.</p></body></html>`);
        } else if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <head>
                <title>Google Drive Authorization</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                  .code-container { background: #f5f5f5; padding: 20px; margin: 20px; border-radius: 8px; }
                  .auth-code { font-family: monospace; font-size: 16px; word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                  .copy-btn { background: #4285f4; color: white; border: none; padding: 10px 20px; margin: 10px; border-radius: 4px; cursor: pointer; }
                  .copy-btn:hover { background: #3367d6; }
                </style>
              </head>
              <body>
                <h1>Authorization Successful!</h1>
                <div class="code-container">
                  <h3>Copy this authorization code:</h3>
                  <div class="auth-code" id="authCode">${code}</div>
                  <button class="copy-btn" onclick="copyCode()">Copy Code</button>
                </div>
                <p>Paste this code into the application and click "Submit".</p>
                <p>You can close this window after copying the code.</p>
                <script>
                  function copyCode() {
                    const codeElement = document.getElementById('authCode');
                    navigator.clipboard.writeText(codeElement.textContent).then(() => {
                      alert('Code copied to clipboard!');
                    });
                  }
                <\/script>
              </body>
            </html>
          `);
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h1>Invalid Request</h1><p>You can close this window.</p></body></html>");
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<html><body><h1>Not Found</h1></body></html>");
      }
    });
    const tryPort = (port) => {
      server.listen(port, "localhost", () => {
        serverPort = port;
        console.log(`OAuth callback server started on http://localhost:${port}`);
        resolve({ server, port });
      });
    };
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (serverPort === null) {
          console.log("Port 3000 is busy, trying port 3001...");
          tryPort(3001);
        } else {
          console.error("Both ports 3000 and 3001 are busy");
          reject(new Error("Unable to start OAuth server: both ports 3000 and 3001 are in use"));
        }
      } else {
        reject(err);
      }
    });
    tryPort(3e3);
  });
}
function registerIpcHandlers() {
  electron.ipcMain.handle("get-app-version", () => {
    return electron.app.getVersion();
  });
  electron.ipcMain.on("show-context-menu", (event) => {
    const template = [
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectAll" }
    ];
    const menu = electron.Menu.buildFromTemplate(template);
    menu.popup({ window: electron.BrowserWindow.fromWebContents(event.sender) });
  });
  electron.ipcMain.handle("open-external", async (event, url2) => {
    try {
      await electron.shell.openExternal(url2);
      return { success: true };
    } catch (error) {
      console.error("Error opening external URL:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("show-message-box", async (event, options) => {
    const { dialog } = await import("electron");
    const result = await dialog.showMessageBox(win, options);
    return result;
  });
  electron.ipcMain.handle("login", async (_, username, password) => {
    return databaseService.getUserByCredentials(username, password);
  });
  electron.ipcMain.handle("create-default-admin", async () => {
    return databaseService.createDefaultAdminIfNeeded();
  });
  electron.ipcMain.handle("create-user", async (_, username, password) => {
    try {
      const userId = databaseService.addUser(username, password);
      return { success: true, userId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("get-all-users", async () => {
    return databaseService.getAllUsers();
  });
  electron.ipcMain.handle("delete-user", async (_, userId) => {
    try {
      return databaseService.deleteUser(userId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("get-all-repairs", async () => {
    return databaseService.getAllRepairs();
  });
  electron.ipcMain.handle("get-repair-by-id", async (_, id) => {
    return databaseService.getRepairById(id);
  });
  electron.ipcMain.handle("get-repairs-by-serial-number", async (_, serialNumber) => {
    return databaseService.getRepairsBySerialNumber(serialNumber);
  });
  electron.ipcMain.handle("add-repair", async (_, repair) => {
    return databaseService.addRepair(repair);
  });
  electron.ipcMain.handle("update-repair", async (_, id, updates) => {
    return databaseService.updateRepair(id, updates);
  });
  electron.ipcMain.handle("delete-repair", async (_, id) => {
    return databaseService.deleteRepair(id);
  });
  electron.ipcMain.handle("get-all-customers", async () => {
    return databaseService.getAllCustomers();
  });
  electron.ipcMain.handle("get-customer-repairs", async (_, customerName, contact) => {
    return databaseService.getCustomerRepairs(customerName, contact);
  });
  electron.ipcMain.handle("update-customer-info", async (_, oldCustomerName, oldContact, newCustomerName, newContact) => {
    return databaseService.updateCustomerInfo(oldCustomerName, oldContact, newCustomerName, newContact);
  });
  electron.ipcMain.handle("delete-customer", async (_, customerName, contact) => {
    return databaseService.deleteCustomer(customerName, contact);
  });
  electron.ipcMain.handle("search-customers", async (_, searchTerm) => {
    return databaseService.searchCustomers(searchTerm);
  });
  electron.ipcMain.handle("can-delete-customer", async (_, customerName, contact) => {
    return databaseService.canDeleteCustomer(customerName, contact);
  });
  electron.ipcMain.handle("get-all-suggestions", async (_, type) => {
    return databaseService.getAllSuggestions(type);
  });
  electron.ipcMain.handle("add-suggestion", async (_, type, value) => {
    return databaseService.addSuggestion(type, value);
  });
  electron.ipcMain.handle("remove-suggestion", async (_, type, value) => {
    return databaseService.removeSuggestion(type, value);
  });
  electron.ipcMain.handle("clear-all-suggestions", async (_, type) => {
    return databaseService.clearAllSuggestions(type);
  });
  electron.ipcMain.handle("export-data-json", async () => {
    return databaseService.exportDataAsJSON();
  });
  electron.ipcMain.handle("export-data-csv", async () => {
    return databaseService.exportDataAsCSV();
  });
  electron.ipcMain.handle("import-data-json", async (_, jsonData) => {
    return databaseService.importDataFromJSON(jsonData);
  });
  electron.ipcMain.handle("save-file", async (event, data, filename, filters) => {
    const { dialog } = await import("electron");
    try {
      const result = await dialog.showSaveDialog(win, {
        defaultPath: filename,
        filters: filters || [
          { name: "JSON Files", extensions: ["json"] },
          { name: "CSV Files", extensions: ["csv"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (!result.canceled && result.filePath) {
        const fs2 = await import("fs/promises");
        await fs2.writeFile(result.filePath, data, "utf8");
        return { success: true, filePath: result.filePath };
      }
      return { success: false, canceled: true };
    } catch (error) {
      console.error("Error saving file:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("load-file", async () => {
    const { dialog } = await import("electron");
    try {
      const result = await dialog.showOpenDialog(win, {
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        properties: ["openFile"]
      });
      if (!result.canceled && result.filePaths.length > 0) {
        const fs2 = await import("fs/promises");
        const data = await fs2.readFile(result.filePaths[0], "utf8");
        return { success: true, data, filePath: result.filePaths[0] };
      }
      return { success: false, canceled: true };
    } catch (error) {
      console.error("Error loading file:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("google-drive-auth-url", async () => {
    try {
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
      }
      const { server, port } = await createOAuthServer();
      oauthServer = server;
      const oauth2Client2 = createOAuth2Client(port);
      const authUrl = oauth2Client2.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
        // Force consent screen to get refresh token
      });
      console.log("Generated auth URL:", authUrl);
      return authUrl;
    } catch (error) {
      console.error("Error generating auth URL:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("google-drive-auth-callback", async (event, code) => {
    try {
      console.log("Received authorization code:", code);
      const port = oauthServer && oauthServer.address() ? oauthServer.address().port : 3e3;
      const oauth2Client2 = createOAuth2Client(port);
      const { tokens } = await oauth2Client2.getToken(code);
      console.log("Received tokens:", tokens);
      const userDataPath = electron.app.getPath("userData");
      const tokensPath = path$1.join(userDataPath, "google-tokens.json");
      await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
      console.log("Tokens saved to:", tokensPath);
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
        console.log("OAuth server closed");
      }
      return { success: true, tokens };
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      if (oauthServer) {
        oauthServer.close();
        oauthServer = null;
      }
      return { success: false, error: error.message };
    }
  });
  async function loadSavedTokens2() {
    try {
      const userDataPath = electron.app.getPath("userData");
      const tokensPath = path$1.join(userDataPath, "google-tokens.json");
      const tokensData = await fs.readFile(tokensPath, "utf8");
      if (!tokensData.trim()) {
        return null;
      }
      const tokens = JSON.parse(tokensData);
      oauth2Client = createOAuth2Client();
      oauth2Client.setCredentials(tokens);
      return oauth2Client;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("No saved tokens found (first run)");
        return null;
      }
      console.error("Error loading saved tokens:", error);
      return null;
    }
  }
  electron.ipcMain.handle("backup-to-google-drive", async () => {
    try {
      const auth = await loadSavedTokens2();
      if (!auth) {
        return { success: false, error: "Google Drive authentication required" };
      }
      const result = await databaseService.backupToGoogleDrive(auth);
      return result;
    } catch (error) {
      console.error("Error in backup-to-google-drive handler:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("enable-auto-backup", async (event, enabled, time) => {
    try {
      const settings = {
        enabled,
        time: time || "13:00"
      };
      databaseService.setAutoBackupSettings(settings);
      if (enabled) {
        const [hour, minute] = time.split(":").map(Number);
        if (autoBackupJob) {
          autoBackupJob.stop();
          autoBackupJob.destroy();
        }
        autoBackupJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
          console.log("Running automatic Google Drive backup...");
          try {
            const auth = await loadSavedTokens2();
            if (auth) {
              const result = await databaseService.backupToGoogleDrive(auth);
              if (win && !win.isDestroyed()) {
                win.webContents.send("auto-backup-completed", {
                  success: result.success,
                  message: result.success ? `Auto backup completed: ${result.filename}` : `Auto backup failed: ${result.error}`,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                });
              }
            } else {
              console.log("No Google Drive authentication found for auto backup");
              if (win && !win.isDestroyed()) {
                win.webContents.send("auto-backup-completed", {
                  success: false,
                  message: "Auto backup failed: Google Drive not authenticated",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                });
              }
            }
          } catch (error) {
            console.error("Auto backup error:", error);
            if (win && !win.isDestroyed()) {
              win.webContents.send("auto-backup-completed", {
                success: false,
                message: `Auto backup failed: ${error.message}`,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          }
        }, {
          scheduled: false,
          timezone: "Asia/Beirut"
        });
        autoBackupJob.start();
        console.log(`Auto backup scheduled for ${time} daily`);
      } else {
        if (autoBackupJob) {
          autoBackupJob.stop();
          autoBackupJob.destroy();
          autoBackupJob = null;
        }
        console.log("Auto backup disabled");
      }
      return { success: true, settings };
    } catch (error) {
      console.error("Error setting up auto backup:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("get-auto-backup-status", async () => {
    var _a;
    try {
      const settings = databaseService.getAutoBackupSettings();
      const hasActiveJob = autoBackupJob !== null;
      return {
        success: true,
        enabled: settings.enabled,
        time: settings.time,
        nextRun: autoBackupJob && autoBackupJob.nextDates ? (_a = autoBackupJob.nextDates(1)[0]) == null ? void 0 : _a.toISOString() : null,
        jobActive: hasActiveJob
      };
    } catch (error) {
      console.error("Error getting auto backup status:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("restore-from-google-drive", async (event, fileId) => {
    try {
      const auth = await loadSavedTokens2();
      if (!auth) {
        return { success: false, error: "Google Drive authentication required" };
      }
      const result = await databaseService.restoreFromGoogleDrive(auth, fileId);
      return result;
    } catch (error) {
      console.error("Error in restore-from-google-drive handler:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("list-google-drive-backups", async () => {
    try {
      const auth = await loadSavedTokens2();
      if (!auth) {
        return { success: false, error: "Google Drive authentication required" };
      }
      const result = await databaseService.listGoogleDriveBackups(auth);
      return result;
    } catch (error) {
      console.error("Error in list-google-drive-backups handler:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("check-google-drive-auth", async () => {
    try {
      const auth = await loadSavedTokens2();
      return { success: true, authenticated: !!auth };
    } catch (error) {
      return { success: true, authenticated: false };
    }
  });
  electron.ipcMain.handle("re-authenticate-google-drive", async () => {
    try {
      const userDataPath = electron.app.getPath("userData");
      const tokensPath = path$1.join(userDataPath, "google-tokens.json");
      try {
        await fs.unlink(tokensPath);
        console.log("Existing Google Drive tokens deleted");
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Error deleting tokens file:", error);
        }
      }
      oauth2Client = null;
      return { success: true, message: "Re-authentication initiated. Please authenticate again." };
    } catch (error) {
      console.error("Error during re-authentication:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("get-all-items", async () => {
    return databaseService.getAllItems();
  });
  electron.ipcMain.handle("get-item-by-id", async (_, id) => {
    return databaseService.getItemById(id);
  });
  electron.ipcMain.handle("get-item-by-serial-number", async (_, serialNumber) => {
    return databaseService.getItemBySerialNumber(serialNumber);
  });
  electron.ipcMain.handle("add-item", async (_, item) => {
    return databaseService.addItem(item);
  });
  electron.ipcMain.handle("update-item", async (_, id, updates) => {
    return databaseService.updateItem(id, updates);
  });
  electron.ipcMain.handle("delete-item", async (_, id) => {
    return databaseService.deleteItem(id);
  });
  electron.ipcMain.handle("mark-item-as-sold", async (_, id, salePrice) => {
    return databaseService.markItemAsSold(id, salePrice);
  });
  electron.ipcMain.handle("mark-item-as-available", async (_, id) => {
    return databaseService.markItemAsAvailable(id);
  });
  electron.ipcMain.handle("search-items", async (_, searchTerm) => {
    return databaseService.searchItems(searchTerm);
  });
  electron.ipcMain.handle("get-items-by-category", async (_, category) => {
    return databaseService.getItemsByCategory(category);
  });
  electron.ipcMain.handle("get-items-by-status", async (_, sold) => {
    return databaseService.getItemsByStatus(sold);
  });
  electron.ipcMain.handle("get-all-whatsapp-templates", async () => {
    return databaseService.getAllWhatsAppTemplates();
  });
  electron.ipcMain.handle("get-whatsapp-template-by-status", async (_, status) => {
    return databaseService.getWhatsAppTemplateByStatus(status);
  });
  electron.ipcMain.handle("update-whatsapp-template", async (_, status, template) => {
    return databaseService.updateWhatsAppTemplate(status, template);
  });
  electron.ipcMain.handle("update-all-whatsapp-templates", async (_, templates) => {
    return databaseService.updateAllWhatsAppTemplates(templates);
  });
  electron.ipcMain.handle("reset-whatsapp-templates-to-default", async () => {
    return databaseService.resetWhatsAppTemplatesToDefault();
  });
  electron.ipcMain.handle("get-shop-overview-stats", async () => {
    try {
      return await databaseService.getShopOverviewStats();
    } catch (error) {
      console.error("Error getting shop overview stats:", error);
      throw error;
    }
  });
}

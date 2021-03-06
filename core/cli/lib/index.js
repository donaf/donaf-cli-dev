/*
 * @LastEditors: qf
 * @Date: 2021-01-12 14:49:25
 * @Description:
 */
"use strict";

module.exports = core;

const fs = require("fs");
const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const commander = require("commander");

const log = require("@donaf-cli-dev/log");
const init = require("@donaf-cli-dev/init");

const program = new commander.Command();

const userHome = require("user-home");
const pathExists = require("path-exists").sync;

const pkg = require("../package.json");

let args, config;

const constant = require("./const");

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    // checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
    registserCommand();
  } catch (e) {
    log.error(e.message);
  }
}

function registserCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", true)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(init);

  // 开启debugger模式;
  program.on("option:debug", () => {
    if (program.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose("test");
  });

  // 指定targetPath
  program.on("option:targetPath", () => {
    process.env.CLI_TARGET_PATH = program.targetPath
  });

  // 未知命令的监听
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red("未知的命令: " + obj[0]));
    if (availableCommands.length > 0) {
      console.log(colors.red("可用命令：" + availableCommands.join(",")));
    }
  });

  program.parse(process.argv);

  // if (process.argv && process.argv.length < 3) {
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

async function checkGlobalUpdate() {
  // 获取当前版本号、模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 调用npm API，获取所有版本号
  const { getNpmSemverVersion } = require("@donaf-cli-dev/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${npmName}, 当前版本 ${currentVersion}, 最新版本： ${lastVersion}
           更新命令： npm install -g ${npmName}
    `)
    );
  }
  // 提取所有版本号，比对哪些版本号
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath,
    });
  }

  createDefaultConifg();
  // log.verbose("环境变量", config);
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

function createDefaultConifg() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}
function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkNodeVersion() {
  // 拿到当前版本号，最低版本号
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`donaf-cli 需要安装 v${lowestVersion}以上版本的 Node.js`)
    );
  }
}

function checkPkgVersion() {
  log.notice("cli", pkg.version);
}

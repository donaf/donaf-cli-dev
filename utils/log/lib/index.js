/*
 * @LastEditors: qf
 * @Date: 2021-01-13 17:08:01
 * @Description:
 */
"use strict";

// module.exports = index;

// const log = require("npmlog");

// function index() {
//   log.info("cli", "test");
// }

const log = require("npmlog");

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"; // 判断debug模式

log.heading = "donaf"; // 修改前缀
log.addLevel("success", 2000, { fg: "green", bold: true }); // 添加自定义命令
module.exports = log;

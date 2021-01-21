/*
 * @LastEditors: qf
 * @Date: 2021-01-21 12:03:31
 * @Description:
 */
"use strict";

module.exports = init;

function init(projectName, cmdObj) {
  console.log(
    "init -----",
    projectName,
    cmdObj.force,
    process.env.CLI_TARGET_PATH
  );
}

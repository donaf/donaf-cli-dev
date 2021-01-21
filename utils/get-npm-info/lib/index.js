/*
 * @LastEditors: qf
 * @Date: 2021-01-14 14:50:51
 * @Description:
 */
"use strict";

const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
  return !isOriginal
    ? "https://registry.npmjs.com/"
    : "https://registry.npm.taobao.org/";
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getSemverVersions(baseVersion, versions) {
  versions = versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
  return versions;
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length >0) {
      return newVersions[0]
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
};

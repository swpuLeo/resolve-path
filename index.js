/*!
 * resolve-path
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2018 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var createError = require('http-errors')
var join = require('path').join
var normalize = require('path').normalize
var pathIsAbsolute = require('path-is-absolute')
var resolve = require('path').resolve
var sep = require('path').sep

/**
 * Module exports.
 * @public
 */

module.exports = resolvePath

/**
 * Module variables.
 * @private
 */

// 这个正则表达式是核心
// 用于匹配上级目录，比如：../，/../
// 不同平台的斜杠不一样
var UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/

/**
 * Resolve relative path against a root path
 *
 * @param {string} rootPath
 * @param {string} relativePath
 * @return {string}
 * @public
 */

function resolvePath (rootPath, relativePath) {
  var path = relativePath
  var root = rootPath

  // root is optional, similar to root.resolve
  // rootPath 是可选的，不传的话，会默认为进程当前的工作目录
  if (arguments.length === 1) {
    path = rootPath
    // process.cwd() 返回 Node.js 进程当前工作的目录
    root = process.cwd()
  }

  // root 和 path 都是必须参数，并且都为字符串
  if (root == null) {
    throw new TypeError('argument rootPath is required')
  }

  if (typeof root !== 'string') {
    throw new TypeError('argument rootPath must be a string')
  }

  if (path == null) {
    throw new TypeError('argument relativePath is required')
  }

  if (typeof path !== 'string') {
    throw new TypeError('argument relativePath must be a string')
  }

  // containing NULL bytes is malicious
  if (path.indexOf('\0') !== -1) {
    throw createError(400, 'Malicious Path')
  }

  // path should never be absolute
  // path 不能是绝对路径，这里使用了 path-is-absolute 模块
  // posix() 在 POSIX 系统中，win32 在 windows 系统中
  if (pathIsAbsolute.posix(path) || pathIsAbsolute.win32(path)) {
    throw createError(400, 'Malicious Path')
  }

  // path outside root
  if (UP_PATH_REGEXP.test(normalize('.' + sep + path))) {
    throw createError(403)
  }

  // join the relative path
  return normalize(join(resolve(root), path))
}

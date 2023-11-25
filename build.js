const esbuild = require('esbuild')


const banner = `// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       You
// @match        https://www.06ak.com/book/*
// @match        https://www.langrenxiaoshuo.com/html/*/
// @match        https://www.hotupub.net/book/*/
// @match        https://www.diyibanzhu.buzz/*/*/
// @match        https://www.xhszw.com/book/*/
// @match        https://xhszw.com/book/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// ==/UserScript==
`

esbuild.buildSync({
    entryPoints: ['./src/main.ts'],
    outfile: './target/main.js',
    bundle: true,
    charset: "utf8",
    target: "esnext",
    banner: { js: banner },
})
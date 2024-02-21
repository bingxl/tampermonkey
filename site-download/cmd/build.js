const esbuild = require('esbuild')
const fs = require('fs');
const path = require('path');
const os = require("os");


// sites download 项目目录 /sites-download
const projectRoot = path.join(__dirname, "../")

// esbuild 打包js
async function build() {

    /**
     * 油猴子脚本头部注释部分
     * @param {*} sites 
     * @returns 
     */
    function getBanner(sites) {

        // 脚本版本
        function version() {
            const date = new Date();
            const pad = (v) => `${v}`.padStart(2, '0');
            let [hour, month, dayOfMonth, year] = [
                date.getHours(),
                date.getMonth(),
                date.getDate(),
                date.getFullYear(),
            ];
            return `${year}${pad(month + 1)}${pad(dayOfMonth)}${pad(hour)}`
        }

        const results = sites.map(v => `// @match        ${v.href}`).join('\n');
        return `// ==UserScript==
// @name         小说下载
// @namespace    http://tampermonkey.net/
// @version      ${version()}
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       bingxl
// @homepage     https://github.com/bingxl/tampermonkey
${results}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/site-download/target/main.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/site-downnload/target/main.js
// ==/UserScript==
`
    }

    // 先编译sites, 获取其中的 siteName 和 url
    esbuild.buildSync({
        entryPoints: [path.join(projectRoot, './sites/index.ts')],
        charset: "utf8",
        target: "esnext",
        format: "cjs",
        bundle: true,
        outfile: path.join(projectRoot, "./target/sites.js"),
        loader: {
            ".html": 'text'
        },
    });

    const { sites } = require(path.join(projectRoot, './target/sites.js'));
    const siteNames = [];
    sites.forEach(site => {
        site.host.forEach(v => {
            const url = new URL(v);
            siteNames.push({
                siteName: site.siteName,
                href: url.href,
                origin: url.origin,
            })
        })
    });

    /** 脚本能下载网站 doc 生成 */
    const siteListContent = '## 油猴子下载网站列表\n' + siteNames.map(v => `+ [${v.siteName}](${v.origin})\n`).join('');
    fs.writeFile(path.join(__dirname, '../../doc/siteList.md'), siteListContent, err => {
        if (err) {
            console.error(err);
        }
    })


    /** 构建油猴子脚本 */
    esbuild.buildSync({
        entryPoints: [path.join(projectRoot, './main.ts')],
        outfile: path.join(projectRoot, './target/main.js'),
        bundle: true,
        charset: "utf8",
        target: "esnext",
        format: "iife",
        banner: { js: getBanner(siteNames) },
        loader: {
            ".html": 'text'
        },
    });

    fs.unlink(path.join(projectRoot, "./target/sites.js"), err => { })
}


build();

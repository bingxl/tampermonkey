import fs from "node:fs"
import path from "node:path"
import { sites } from "../sites"

const __dirname = import.meta.dirname

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
        return `// build 生成的文件, 请勿直接编辑此文件
// ==UserScript==
// @name         小说下载
// @namespace    http://tampermonkey.net/
// @version      ${version()}
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       bingxl
// @homepage     https://github.com/bingxl/tampermonkey
${results}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// ==/UserScript==
`
    }

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

    await Bun.build({
        entrypoints: [path.join(projectRoot, './main.ts')],
        format: "iife",
        banner: getBanner(siteNames),
        target: 'browser',
        outdir: path.join(projectRoot, '../monkeyscripts/'),
        naming: 'site-download_auto_gen.js',
    });


}


build();

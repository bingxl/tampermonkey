const esbuild = require('esbuild')
const fs = require('fs');
const path = require('path');




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
            const [hour, month, dayOfMonth, year] = [
                date.getHours(),
                date.getMonth(),
                date.getDate(),
                date.getFullYear(),
            ];
            return `${year}${month + 1}${dayOfMonth}${hour}`
        }

        const results = sites.map(v => `// @match        ${v.href}`).join('\n');
        return `// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      ${version()}
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       bingxl
// @homepage     https://github.com/bingxl/tampermonkey
${results}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/main.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/main.js
// ==/UserScript==
`
    }

    // 先编译sites, 获取其中的 siteName 和 url
    esbuild.buildSync({
        entryPoints: ['./src/sites/index.ts'],
        charset: "utf8",
        target: "esnext",
        format: "cjs",
        bundle: true,
        outfile: "./target/sites.js"
    });

    const { sites } = require('./target/sites.js');
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
    fs.writeFile('./doc/siteList.md', siteListContent, err => {
        if (err) {
            console.error(err);
        }
    })


    /** 构建油猴子脚本 */
    esbuild.buildSync({
        entryPoints: ['./src/main.ts'],
        outfile: './target/main.js',
        bundle: true,
        charset: "utf8",
        target: "esnext",
        banner: { js: getBanner(siteNames) },
    })
}



// 处理书源
function handleBookSource() {

    // 存储所有JSON文件的目录
    const directoryPath = './src/booksource';

    // 用于存储所有JSON数据的数组
    let jsonDataArray = [];

    // 读取目录下的所有文件
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('读取书源json所在路径出错', err);
            return;
        }

        let docs = `## 书源列表`;

        // 迭代处理每个文件
        files.forEach(file => {
            // 检查文件是否为JSON文件
            if (path.extname(file) === '.json') {
                // 读取JSON文件内容
                const filePath = path.join(directoryPath, file);
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // doc 数据
                const { bookSourceName, bookSourceUrl } = jsonData;

                docs += `\n+ [${bookSourceName}](${bookSourceUrl})`
                // 将数据追加到数组中
                jsonDataArray = jsonDataArray.concat(jsonData);
            }
        });

        // 写入文件
        fs.writeFile('./target/BookSource.json',
            JSON.stringify(jsonDataArray, null, 4),
            'utf-8',
            (err) => {
                if (err) {
                    console.error('写入书源文件时出错:', err);
                    return;
                }
                console.log('书源文件处理完成');
            }
        );

        fs.writeFile('./doc/sourceList.md', docs, err => { if (err) { console.error(err) } });

    });

}

function getArg(name) {
    // 获取传递给脚本的参数
    const args = process.argv.slice(2);

    // 输出所有参数
    console.log('Command line arguments:', args);

    // 你可以进一步处理参数，例如：
    // 如果参数包含"--task"，则输出后面的值
    const nameIndex = args.indexOf(name);
    if (nameIndex !== -1 && nameIndex < args.length - 1) {
        const nameValue = args[nameIndex + 1];
        return nameValue
    } else {
        console.log('Name parameter not provided.');
    }
}

function init() {
    const task = getArg('--task');
    if (task === "booksource") {
        handleBookSource();
        return;
    }

    build();
}

init()

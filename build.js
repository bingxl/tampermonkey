const esbuild = require('esbuild')
const fs = require('fs');
const path = require('path');


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
// @match        https://m.wfxs.tw/booklist/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @downloadURL  https://github.com/bingxl/tampermonkey/raw/main/target/main.js
// ==/UserScript==
`

// esbuild 打包js
function build() {
    esbuild.buildSync({
        entryPoints: ['./src/main.ts'],
        outfile: './target/main.js',
        bundle: true,
        charset: "utf8",
        target: "esnext",
        banner: { js: banner },
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

        // 迭代处理每个文件
        files.forEach(file => {
            // 检查文件是否为JSON文件
            if (path.extname(file) === '.json') {
                // 读取JSON文件内容
                const filePath = path.join(directoryPath, file);
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

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
            });

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

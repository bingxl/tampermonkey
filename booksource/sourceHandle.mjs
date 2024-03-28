
import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname

/**
 * 从给定地址获取书源 (本地相对路径/绝对路径/ 网络地址)
 * @param {string} url 书源地址,  json文件地址 或者网址
 * @param {string} [key=""] 书源所在位置, 默认全部, 属性名称使用 . 分隔
 * @param {RequestInit} [options=undefined] 网络请求时的参数
 */
async function getSources(url, key = "", options = undefined) {
    let jsonObj = {};
    let result = [];
    if (url?.startsWith('http')) {
        jsonObj = await fetch(url, options).then(res => res.json());
    } else if (!fs.existsSync(url)) {
        throw new Error(`文件不存在: ${url}`);
    } else {
        const buf = fs.readFileSync(url);
        jsonObj = JSON.parse(buf);
    }

    if (key === "") {
        result = jsonObj;
    } else {
        result = key.split('.').reduce((pre, cur) => {
            if (pre && cur in pre) {
                return pre[cur];
            }
            throw Error(`${pre} 没有 ${cur} 属性`);
        }, jsonObj)
    }
    return result;
}

/**
 * 筛选书源, 筛选后将符号条件的书源写入 outputFilename 文件中
 * @param {Object} param0 
 * @returns 
 */
async function filters({
    sourceUrl = path.join(__dirname, "./legadoBookSource.json"),
    key = "",
    options = undefined,
    outputFilename = path.join(__dirname, "./target/filtered-legado.json"),
    include = /(名著|正版|出版|国外经典)/,
    exclude = /(辣文|高辣|韩漫)/
} = {}) {

    const sources = await getSources(sourceUrl, key, options).catch(err => {
        console.error(err);
        return undefined;
    });
    if (!sources) {
        console.log("未获取到书源")
        return;
    }
    console.log(typeof sources);

    const filteredResources = sources.filter(source => {
        const { bookSourceName, bookSourceGroup, exploreUrl } = source;
        if (bookSourceGroup.includes("推荐")) { return true }

        const result = bookSourceGroup + bookSourceName + exploreUrl
        return include.test(result) && !exclude.test(result);
    });
    console.log(`处理源个数: ${sources.length} 处理后源个数: ${filteredResources.length}`)
    writeSource(filteredResources, outputFilename);
}

/**
 * 将 sources 内容同步写入文件
 * @param {Object} sources 
 * @param {string} filename 文件名
 */
function writeSource(sources, filename) {
    fs.writeFileSync(filename, JSON.stringify(sources, null, 2));
}



const legadoSourceFile = path.join(__dirname, "./legadoBookSource.json");

// 需要从 legado 导入书源时取消下面注释, 并将ip 换为legado提供的ip
// *********************************************
// *********************************************
// *********** 特别注意 导入会覆盖原有的 ./source/legadoBookSource.json 文件 *********************
// *********************************************
// *********************************************
// *********************************************
// await getSources("http://192.168.100.81:1122/getBookSources", "data").then(res => {
//     console.log(typeof res)
//     writeSource(res, legadoSourceFile);
// })

filters();
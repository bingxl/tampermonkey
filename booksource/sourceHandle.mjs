
import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname
const fromInternet = path.join(__dirname, "src", "fromInternet.json");
const bingxlMake = path.join(__dirname, "src", "bingxlMake.json");

const targetAll = path.join(__dirname, "target", "all.json");
const targetFiltered = path.join(__dirname, "target", "filtered.json");

/**
 * 合并两个JSON文件，基于bookSourceUrl去重，保留bingxlMake中的结果
 */
async function mergeSourceFiles() {
    try {
        // 使用异步方式读取文件
        const [fromInternetData, bingxlMakeData] = await Promise.all([
            fs.promises.readFile(fromInternet, 'utf8'),
            fs.promises.readFile(bingxlMake, 'utf8')
        ]);

        // 解析JSON数据
        const fromInternetJson = JSON.parse(fromInternetData);
        const bingxlMakeJson = JSON.parse(bingxlMakeData);

        // 创建Map用于存储合并结果（使用bookSourceUrl作为键）
        const mergedMap = new Map();

        // 首先添加fromInternet的所有条目
        fromInternetJson.forEach(item => {
            if (item.bookSourceUrl) {
                mergedMap.set(item.bookSourceUrl, item);
            }
        });

        // 然后用bingxlMake的条目覆盖相同bookSourceUrl的条目
        bingxlMakeJson.forEach(item => {
            if (item.bookSourceUrl) {
                mergedMap.set(item.bookSourceUrl, item);
            }
        });

        // 将Map转换回数组并返回
        let sources = Array.from(mergedMap.values())
        await writeSource(sources, targetAll);
        console.log(`合并完成, 共 ${sources.length} 条书源`);

    } catch (error) {
        console.error('合并书源文件时出错:', error);
        throw error; // 重新抛出错误以便调用者处理
    }
}


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
    sourceUrl = targetAll,
    key = "",
    options = undefined,
    outputFilename = targetFiltered,
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
        if (bookSourceGroup?.includes("推荐")) { return true }

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



// const legadoSourceFile = fromInternet;;

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
await mergeSourceFiles();
await filters();
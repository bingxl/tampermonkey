
// ==UserScript==
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

/**
 * @file 入口文件
 */
import { sites } from "./sites";


// 获取当前页面的 host 和 pathname
const { host, pathname } = location;

// 注册类
sites.some(v => {
    // 匹配注册类(只匹配一次)并执行
    const hosts = v.host.map((h: string) => (new URL(h)).host)
    if (hosts.includes(host) && pathname.match(v.pathMatch)) {

        new v();
        return true
    }
})
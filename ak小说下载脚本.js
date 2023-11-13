// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  ak小说 下载, 使用油猴子添加本脚本文件后打开小说目录页, 点击下载后等待下载
// @author       You
// @match        https://www.06ak.com/book/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// ==/UserScript==


(async function () {
    'use strict';

    // Your code here...
    console.log("ak 小说脚本运行中 ", location.href)



    async function getContent(url) {
        let content = await fetch(url).then(res => res.text())
        let parser = new DOMParser()
        let p = parser.parseFromString(content, "text/html")
        let contents = [...p.querySelectorAll("#article>p")].map(a => a.textContent)
        return contents
    }

    function downloadTextAsFile(text, filename) {
        // 创建一个 Blob 实例
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });

        // 创建一个 a 标签并设置属性
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;

        // 将 a 标签添加到文档中并模拟点击事件来开始下载
        document.body.appendChild(a);
        a.click();

        // 下载完成后移除 a 标签
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 0);
    }

    async function download() {
        console.log("执行下载函数")
        const article = $('body > div.container > section > div.novel_info_main > div > h1')[0].textContent

        const titles = [...$('#ul_all_chapters>li>a')]
        let contents = []
        for (let i = 0; i < titles.length; i++) {
            let a = titles[i]
            contents.push('')
            contents.push(a.textContent, '')
            let page2 = a.href.replace('\.html', '_2.html')
            let content1 = await getContent(a.href)
            let content2 = await getContent(page2)
            contents.push(...content1, ...content2)
            console.log(`正在处理 ${a, textContent}`)
        }
        contents[0] = article

        downloadTextAsFile(contents.join('\n'), article)
    }

    if (location.pathname.match(/\/book\/\d+$/)) {
        console.log('匹配到目录页面')
        let d = $('body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn')[0]
        d.href = "#"
        d.textContent = "下载"
        d.addEventListener('click', download)
    }

})();

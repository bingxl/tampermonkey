// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       You
// @match        https://www.06ak.com/book/*
// @match        https://www.langrenxiaoshuo.com/html/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// ==/UserScript==


(async function () {
    'use strict';

    const selectors = {
        'www.langrenxiaoshuo.com': {
            'titles': 'body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a',
            'title': 'div.row.row-detail > div > h2 > font',
            'download':'body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read',
        },
        'www.06ak.com': {
            'titles': '#ul_all_chapters>li>a',
            'title': 'body > div.container > section > div.novel_info_main > div > h1',
            'download':'body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn',
        }
    }
    const isAk = location.host === 'www.06ak.com';

    const selector = selectors[location.host]
    if (!selector){return}

    // Your code here...
    console.log("ak 小说脚本运行中 ", location.href)



    async function getContent(url) {
        let content = ''
        if (isAk){
            content = await fetch(url).then(res => res.text())
        }else {
            // 狼人小说返回的文档使用了 GB2312编码, 需要解码
            content = await fetch(url).then(res => res.arrayBuffer())
                .then(res => {
                return new TextDecoder('gbk').decode(res)
            })
        }
        let parser = new DOMParser()
        let p = parser.parseFromString(content, "text/html")
        if (!isAk){
            return p.querySelector('#content > div').textContent;
        }
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
        const article = $(selector.title)[0].textContent

        const titles = [...document.querySelectorAll(selector.titles)]
        let contents = []
        for (let i = 0; i < titles.length; i++) {
            let a = titles[i]
            console.log(`正在处理 ${a.textContent}`)

            contents.push('')
            contents.push(a.textContent, '')

            if (!isAk){
                let content = await getContent(a.href)
                contents.push(content)
                continue
            }

            let page2 = a.href.replace('\.html', '_2.html')
            let content1 = await getContent(a.href)

            let content2 = await getContent(page2)
            contents.push(...content1, ...content2)

        }
        contents[0] = article

        downloadTextAsFile(contents.join('\n'), article)
        globalThis.contents = contents
    }

    let path = location.pathname
    if (path.match(/\/book\/\d+$/) || path.match(/\/html\/\w+\/$/)) {
        console.log('匹配到目录页面')
        let d = $(selector.download)[0]
        d.href = "#"
        d.textContent = "下载"
        d.addEventListener('click', download)
    }

})();

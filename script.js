// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       You
// @match        https://www.06ak.com/book/*
// @match        https://www.langrenxiaoshuo.com/html/*/
// @match        https://www.hotupub.net/book/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// ==/UserScript==


(async function () {
    'use strict';

    // blob 下载
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

    class Base {
        // 目录列表 selector
        titles = '';
        // 小说名 selector
        title = '';
        // 点击后下载的元素 selector
        download = '';
        // 网站host
        host = '';
        // 匹配书籍目录页面
        matchReg = '';



        // @override 
        // 返回文档编码方式需要处理
        async getArticle(url) {
            const res = await fetch(url);
            return await res.text();
        }
        // @override
        // 从DOM树中获取章节内容
        getArticleContent(parser) {

        }
        // @override 
        // 有些章节分几页,需要单独处理
        async pages(url) {
            let content = await this.getContent(url);
            return [content]
        }

        async getContent(url) {
            let content = await this.getArticle(url)

            // 将字符串解析为 DOM 树
            let parser = new DOMParser()
            let p = parser.parseFromString(content, "text/html")

            return this.getArticleContent(p)
        }


        async run(e) {
            e.preventDefault()
            console.log("执行下载函数")
            console.log("小说名 Selector: ", this.title)
            const article = $(this.title)[0].textContent

            const titles = [...document.querySelectorAll(this.titles)]
            let contents = []
            for (let i = 0; i < titles.length; i++) {
                let a = titles[i]
                console.log(`正在处理 ${a.textContent}`)
                contents.push('', a.textContent, '')
                let content = await this.pages(a.href)
                contents.push(content)
            }
            contents[0] = article

            downloadTextAsFile(contents.join('\n'), article)
            globalThis.contents = contents
            return false
        }

        init() {
            console.log(this)
            let d = $(this.download)[0]
            d.href = "#"
            d.textContent = "下载"
            d.addEventListener('click', (e) => this.run(e))
            globalThis.download = () => this.run();
        }

    }

    // 狼人小说 www.langrenxiaoshuo.com
    class Lang extends Base {
        titles = 'body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a';
        title = 'div.row.row-detail > div > h2 > font';
        download = 'body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read';

        static host = 'www.langrenxiaoshuo.com';
        static pathMatch = /\/html\/\w+\/$/;

        async getArticle(url) {
            return await fetch(url).then(res => res.arrayBuffer())
                .then(res => {
                    return new TextDecoder('gbk').decode(res)
                })
        }

        getArticleContent(parser) {
            return parser.querySelector('#content > div').textContent;
        }

    }

    // 06Ak小说 www.06ak.com
    class Ak extends Base {
        titles = '#ul_all_chapters>li>a';
        title = 'body > div.container > section > div.novel_info_main > div > h1';
        download = 'body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn';

        static host = 'www.06ak.com';
        static pathMatch = /\/book\/\d+$/;

        // @override
        // 从DOM树中获取章节内容
        getArticleContent(parser) {
            return [...parser.querySelectorAll("#article>p")].map(a => a.textContent)
        }
        // @override 
        // 有些章节分几页,需要单独处理
        async pages(url) {
            let content1 = await this.getContent(url);
            let page2 = url.replace('\.html', '_2.html')
            let content2 = await this.getContent(page2)
            return [...content1, ...content2]
        }
    }

    // 河图小说
    class Hotu extends Base {
        titles = 'div.bookdetails-catalog-box > ul > li > a';
        title = 'div.bookdetails-left-mainbox > div:nth-child(1) > div > div > h1';
        download = 'p.bookdetalis-bookinfo-bookbtnbox.suofang > a';

        static host = 'www.hotupub.net';
        static pathMatch = /\/book\/\d+\/$/;

        getArticleContent(parser) {
            return parser.querySelector('div.bookread-content-box').textContent;
        }
    }

    const host = location.host;
    const path = location.pathname;

    [Lang, Ak, Hotu].some(v => {
        if (v.host === host && path.match(v.pathMatch)) {

            (new v()).init();
            return true
        }
    })

})();

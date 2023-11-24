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


(async function () {
    'use strict';

    function log(...infos) {
        console.log(...infos)
    }

    /**
     * 程序空转一定时间, 不精确
     * @param {number} d 空转时间, 单位 ms
     */
    function sleep(d) {
        let now = Date.now();
        while (Date.now() - now <= d);
    }

    /**
     * 将字符串下载为文件
     * @param {string} text 文件内容
     * @param {string} filename 文件名
     */
    function downloadTextAsFile(text, filename) {
        // 创建一个 Blob 实例
        var blob = new Blob([text], { type: "text/plain;charset=utf-8", endings: "native" });

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
        /** 小说章节的选择器 */
        titles = '';
        /** 小说名选择器 */
        title = '';
        /** 下载按钮选择器 */
        download = '';
        /** @type {string[]} 网站 host */
        host = [];
        /** 书籍目录页面 匹配正则 location.pathname.match() */
        matchReg = '';
        /** 获取内容间隔 单位:ms 短时间有太多次请求时有些网站会采取限制策略, 故设置间隔时间*/
        sleepTime = 0;
        /** 同时获取数据的最大值 (并发量控制) */
        taskMax = 20;



        /**
         * 获取小说内容,返回文档编码方式需要处理
         * @override
         * @param {string} url 获取地址
         * @returns {string} 小说页面 HTML 字符串
         */
        async getArticle(url) {
            const res = await fetch(url);
            return await res.text();
        }

        /**
         * 从DOM树中获取章节内容
         * @override
         * @param {DOMParser} parser
         * @return {string} 小说章节内容
         */
        getArticleContent(parser) {

        }
        /**
         * 处理一章分多页的问题
         * 有些章节分几页, 需要单独处理
         * @param {string} url 章节url
         * @override
         * @returns {string} 小说章节内容
         */
        async pages(url) {
            let content = await this.getContent(url);
            return Array.isArray(content) ? content.join('\n') : content
        }

        /**
         * 从DOM 树中提取小说内容
         * @param {string} url 
         * @returns {string} 章节内容
         */
        async getContent(url) {
            let content = await this.getArticle(url)

            // 将字符串解析为 DOM 树
            let parser = new DOMParser()
            let p = parser.parseFromString(content, "text/html")

            return this.getArticleContent(p)
        }

        /**
         * 小说章节格式
         * @typedef {Object} Chapter
         * @property {string} href 章节内容获取连接
         * @property {string} textContent 章节标题
         */

        /**
         * 返回章节列表
         * @returns {Chapter[]}
         */
        async getTitles() {
            const titles = [...document.querySelectorAll(this.titles)]
            return titles.map(v => { return { href: v.href, textContent: v.textContent } })
        }


        async run(e) {
            e.preventDefault()
            log("执行下载函数")
            log("小说名 Selector: ", this.title)
            // 小说名
            const article = document.querySelector(this.title).textContent

            const titles = await this.getTitles().catch(console.error)

            // 存放每章的内容
            let contents = []
            let tasks = new Set()
            let currentTaskNum = 0
            for (let i = 0; i < titles.length; i++) {
                let a = titles[i]
                if (tasks.size >= this.taskMax) {
                    // 任务并发控制, 达到最大值时等待
                    await Promise.any(tasks.values())
                }

                let task = new Promise((resolve, reject) => {
                    this.pages(a.href).then(res => {
                        // 将章节内容存入contents
                        contents[i] = `\n${a.textContent}\n${res}`
                        log(`${++currentTaskNum}/${titles.length} ${a.textContent}`)
                        resolve()
                    }).catch(err => {
                        console.error(err);
                        reject(err)
                    }).finally(() => {
                        // 当前任务已完成, 从任务列表移除
                        tasks.delete(task)
                    })
                })

                tasks.add(task)

                // 如果设置了等待时间则等待
                if (this.sleepTime) {
                    sleep(this.sleepTime)
                }
            }

            // 等待所有任务执行完成
            await Promise.all(tasks.values())

            downloadTextAsFile(article + "\n" + contents.join('\n'), article)

            return false
        }

        init() {
            log(this)
            let d = document.querySelector(this.download)
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

        static host = ['www.langrenxiaoshuo.com'];
        static pathMatch = /\/html\/\w+\/$/;

        async getArticle(url) {
            return await fetch(url).then(res => res.arrayBuffer())
                .then(res => {
                    // 解码
                    return new TextDecoder('gbk').decode(res)
                })
        }

        getArticleContent(parser) {
            return parser.querySelector('#content > div').textContent + "\n";
        }



    }

    // 06Ak小说 www.06ak.com
    class Ak extends Base {
        titles = '#ul_all_chapters>li>a';
        title = 'body > div.container > section > div.novel_info_main > div > h1';
        download = 'body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn';

        static host = ['www.06ak.com'];
        static pathMatch = /\/book\/\d+$/;

        // @override
        // 从DOM树中获取章节内容
        getArticleContent(parser) {
            return [...parser.querySelectorAll("#article>p")].map(a => a.textContent + "\n").join('')
        }
        // @override
        // 有些章节分几页,需要单独处理
        async pages(url) {
            let content1 = await this.getContent(url);
            let page2 = url.replace('\.html', '_2.html')
            let content2 = await this.getContent(page2)
            return content1 + "\n" + content2;
        }
    }

    // 河图小说
    class Hotu extends Base {
        titles = 'div.bookdetails-catalog-box > ul > li > a';
        title = 'div.bookdetails-left-mainbox > div:nth-child(1) > div > div > h1';
        download = 'p.bookdetalis-bookinfo-bookbtnbox.suofang > a';

        static host = ['www.hotupub.net'];
        static pathMatch = /\/book\/\d+\/$/;

        getArticleContent(parser) {
            const c = parser.querySelector('div.bookread-content-box').innerHTML.replaceAll('<br>', '\n');
            return c
        }
    }

    // 第一版主 www.diyibanzhu.buzz
    class Diyibanzhu extends Base {
        titles = 'div.ml_content > div.zb > div.ml_list > ul > li > a';
        title = 'div.introduce > h1';
        download = 'div.introduce > div > p:nth-child(4) > a';

        static host = ['www.diyibanzhu.buzz'];
        static pathMatch = /\/\d+\/\d+\/$/;

        /** @override */
        async getArticle(url) {
            return await fetch(url).then(res => res.arrayBuffer())
                .then(res => {
                    return new TextDecoder('gbk').decode(res)
                })
        }
        /** @override */
        getArticleContent(parser) {
            const c = parser.querySelector('#articlecontent').innerHTML.replaceAll('&nbsp;', '').replaceAll('<br>', '\n');
            return c + "\n"
        }

    }

    // https://www.xhszw.com/book/8308/
    class Xhszw extends Base {
        titles = '#list-chapterAll > dd > a';
        title = 'div.bookinfo > h1';
        download = 'div.bookinfo > div > a:nth-child(1)';
        sleepTime = 1000;

        static host = ['www.xhszw.com', 'xhszw.com'];
        static pathMatch = /\/book\/\d+\/$/;

        /**
         * @override
         */
        async getContent(url) {
            const [, articleid, chapterid] = /.+\/(\d+)\/(\d+).html/.exec(url);
            const api = 'https://www.xhszw.com/api/reader_js.php'
            let content = await fetch(api, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `articleid=${articleid}&chapterid=${chapterid}&pid=1`
            }).then(res => res.text())

            return content.replaceAll(/<\/?p>/g, '\n')

        }

        /**
         * @override
         */
        async getTitles() {
            log('in getTitles function')
            let parseTitle = (content) => {
                let parser = new DOMParser()
                let p = parser.parseFromString(content, "text/html")
                return Array.from(p.querySelectorAll(this.titles)).map(v => { return { href: v.href, textContent: v.textContent } })
            }
            let titles = []
            let pages = Array.from(document.querySelectorAll('#indexselect > option'))
            log('title is: ', titles)
            for (let page of pages) {
                let domstr = await fetch(page.value).then(res => res.text())
                titles.push(...parseTitle(domstr))
            }
            return titles

        }
    }
    // 获取当前页面的 host 和 pathname
    const { host, pathname } = location.host;
    // 注册类
    const sites = [Lang, Ak, Hotu, Diyibanzhu, Xhszw];

    sites.some(v => {
        // 匹配注册类(只匹配一次)并执行
        if (v.host.includes(host) && pathname.match(v.pathMatch)) {

            (new v()).init();
            return true
        }
    })

})();

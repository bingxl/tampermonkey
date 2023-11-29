import { downloadTextAsFile, log, sleep } from '../tool/misc'

export class Base {
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
    async getArticle(url: string) {
        const res = await fetch(url);
        return await res.text();
    }

    /**
     * 从DOM树中获取章节内容
     * @override
     * @param {DOMParser} parser
     * @return {string} 小说章节内容
     */
    getArticleContent(parser: Document) {
        return ""
    }
    /**
     * 处理一章分多页的问题
     * 有些章节分几页, 需要单独处理
     * @param {string} url 章节url
     * @override
     * @returns {string} 小说章节内容
     */
    async pages(url: string) {
        let content = await this.getContent(url);
        return Array.isArray(content) ? content.join('\n') : content
    }

    /**
     * 从DOM 树中提取小说内容
     * @param {string} url 
     * @returns {string} 章节内容
     */
    async getContent(url: string) {
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
        const titles = Array.from(document.querySelectorAll<HTMLAnchorElement>(this.titles))
        return titles.map(v => { return { href: v.href, textContent: v.textContent } })
    }


    async run(e: MouseEvent) {
        e?.preventDefault();
        log("执行下载函数");
        log("小说名 Selector: ", this.title);
        // 小说名
        const article = document.querySelector<HTMLElement>(this.title)?.textContent ?? "";

        const titles = (await this.getTitles().catch(console.error)) ?? [];

        // 存放每章的内容
        let contents: string[] = []
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
                    contents[i] = `\n${a.textContent}\n${res}`;
                    log(`${++currentTaskNum}/${titles.length} ${a.textContent}`);
                    resolve("");
                }).catch(err => {
                    console.error(err);
                    reject(err);
                }).finally(() => {
                    // 当前任务已完成, 从任务列表移除
                    tasks.delete(task);
                });
            });

            tasks.add(task);

            // 如果设置了等待时间则等待
            if (this.sleepTime) {
                sleep(this.sleepTime);
            }
        }

        // 等待所有任务执行完成
        await Promise.all(tasks.values());

        downloadTextAsFile(article + "\n" + contents.join('\n'), article);

        return false
    }

    init() {
        log(this)
        let d = document.querySelector<HTMLAnchorElement>(this.download)
        if (d) {
            d.textContent = "下载"
            d.addEventListener('click', (e) => this.run(e))
        }
    }

}
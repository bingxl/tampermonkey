
import { downloadTextAsFile, gbk2Utf8, sleep } from '../tool/misc';
import { IDB } from '../tool/idbSample';

// @ts-ignore
import domStr from '../show.html'

export class Base {
    /** 小说章节的选择器 */
    titles = '';
    /** 小说名选择器 */
    title = '';
    /** 下载按钮选择器 */
    download = '';
    /**章节内容选择器 */
    contentSelector = "";
    /**获取章节内容时的字符集 */
    charset = 'utf8';

    /** @type {string[]} 网站 host */
    host = [];
    /** 书籍目录页面 匹配正则 location.pathname.match() */
    matchReg = '';
    /** 获取内容间隔 单位:ms 短时间有太多次请求时有些网站会采取限制策略, 故设置间隔时间*/
    sleepTime = 0;
    /** 同时获取数据的最大值 (并发量控制) */
    taskMax = 20;


    log: (...infos: any[]) => void;

    /**存储到localForage中的 key 值, 下载时查找所有keyPath 对应的值 */
    keyPath: string[] = [];
    store!: IDB;

    // 挂载到文档中的DOM结构 和 时间监听处理
    constructor() {

        // 解析 DOM 
        const parser = new DOMParser();
        const root = parser.parseFromString(domStr, 'text/html');

        // 将 DOM 挂载到当前页面中
        document.body.append(root.querySelector('#bingxl-root') ?? '');

        document.querySelector<HTMLButtonElement>('#bingxl-root .download')?.addEventListener('click', e => this.run(e))


        const logContainer = document.querySelector<HTMLElement>('#bingxl-root .log');
        // 清除日志
        document.querySelector('#bingxl-root .clear')?.addEventListener('click', e => {
            if (logContainer) {
                logContainer.innerHTML = '';
            }
        })

        this.log = (...infos: any[]) => {
            if (logContainer) {
                const p = document.createElement('p');
                infos.forEach(v => {
                    const span = document.createElement('span');
                    span.innerText = v;
                    p.appendChild(span);
                })


                logContainer.appendChild(p)
            }
        }
    }

    /**
     * 将章节内容存储到 缓存区 (indexedDB/ webSQL/ localStorage/ sessionStorage) 
     * @param {number} index 当前存储数据在 keyPath 中的排序
     * @param {string} keyPath key
     */
    async storeContent(index: number, key: string, content: string) {
        this.keyPath[index] = key;
        await this.store.setItem(key, content).catch(e => {
            console.error(e)
        })
    }

    /**
     * 获取小说内容,返回文档编码方式需要处理
     * @override
     * @param {string} url 获取地址
     * @returns {string} 小说页面 HTML 字符串
     */
    async getArticle(url: string) {
        const res = await fetch(url);
        let result = "";
        if (this.charset.includes('gb')) {
            const buffer = await res.arrayBuffer();
            result = gbk2Utf8(buffer)
        } else {
            result = await res.text();
        }
        return result;
    }

    /**
     * 从DOM树中获取章节内容
     * @override
     * @param {DOMParser} parser
     * @return {string} 小说章节内容
     */
    getArticleContent(parser: Document) {
        const c = parser.querySelector<HTMLElement>(this.contentSelector)?.innerText ?? "";
        return c

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
        this.log("执行下载函数");
        // 小说名
        const article = document.querySelector<HTMLElement>(this.title)?.textContent ?? "";
        this.store = new IDB();
        await this.clear();

        // 小说名存最前面
        let articleKey = '' + Date.now()
        this.storeContent(0, articleKey, article);

        const titles = (await this.getTitles().catch(console.error)) ?? [];

        let tasks = new Set();
        let currentTaskNum = 0;
        for (let i = 0; i < titles.length; i++) {
            let a = titles[i];

            // 存储当前顺序的 keyPath
            let key = `${article}${Date.now()}-${i}`;

            if (tasks.size >= this.taskMax) {
                // 任务并发控制, 达到最大值时等待
                await Promise.any(tasks.values());
            }

            let task = new Promise((resolve, reject) => {
                this.pages(a.href).then(async res => {
                    // 将章节内容缓存

                    const content = `\n${a.textContent}\n${res}`;

                    // 第0 个存放小说名称了
                    await this.storeContent(i + 1, key, content)

                    this.log(`${++currentTaskNum}/${titles.length} ${a.textContent}`);
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
        await this.startDownload(article);

        // 清除本次存储的数据, 并关闭 indexedDB连接
        await this.clear();
        this.store?.close();

        return false
    }
    /**
     * 清除缓存到 store 中的内容
     */
    async clear() {
        for (const key of this.keyPath) {
            await this.store.removeItem(key);
        }
    }

    /**小说内容已缓存完成, 开始导出 */
    async startDownload(article: string) {
        const blobOptions: BlobPropertyBag = { type: "text/plain;charset=utf-8", endings: "native" };
        /**拷贝 keyPath  */
        const keyPath = [...this.keyPath];
        let batchSize = 30;
        let hasNext = true;
        let blobs = [];
        /** 分批次转为 blob  */
        while (hasNext) {
            // 获取当前 batch 的数据 splice(index, size), 将从index开始的size个数据删除并返回删除的内容
            // 此处 splice(0, batchSize) 恰好提取前面 batchSize个数据
            const batchKeys = keyPath.splice(0, batchSize);
            let strings: string[] = [];
            for (const key of batchKeys) {
                let result = (await this.store.getItem(key) as string);
                strings.push(result ?? "")
            }

            blobs.push(new Blob([...strings], blobOptions));

            if (keyPath.length <= 0) {
                hasNext = false;
            }
        }

        let contentBlob = new Blob(blobs, blobOptions)
        downloadTextAsFile(contentBlob, article);
    }

}
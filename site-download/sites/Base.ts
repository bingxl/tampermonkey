
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
    host: string[] = [];
    /** 书籍目录页面 匹配正则 location.pathname.match() */
    matchReg = '';
    /** 获取内容间隔 单位:ms 短时间有太多次请求时有些网站会采取限制策略, 故设置间隔时间*/
    sleepTime = 2;
    /** 同时获取数据的最大值 (并发量控制) */
    taskMax = 2;

    /** 小说内容中需要过滤的 selector */
    filters: string[] = [];


    log: (...infos: any[]) => void;

    /**存储到localForage中的 key 值, 下载时查找所有keyPath 对应的值 */
    keyPath: string[] = [];
    store!: IDB;
    progressEvent: Function;

    // 挂载到文档中的DOM结构 和 时间监听处理
    constructor() {
        const ui = new Ui(this.run);
        this.log = ui.log;
        this.progressEvent = ui.progress;
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

    // 内容过滤器
    filter(p: Document) {
        for (let selector of this.filters) {
            p.querySelector<HTMLElement>(selector)?.remove()
        }

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
        this.filter(p);

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

    // 使用箭头函数绑定this
    run = async (e: MouseEvent) => {
        e?.preventDefault();
        this.log("执行下载函数");
        // 小说名
        const article = document.querySelector<HTMLElement>(this.title)?.textContent ?? "";

        // 每篇小说存一个 DB, 下载完就直接 destroy
        this.store = new IDB({ dbName: article || "小说名" });
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
                await Promise.any(tasks.values()).catch(console.error);
            }

            let task = new Promise((resolve, reject) => {
                this.pages(a.href).then(async res => {
                    // 将章节内容缓存

                    const content = `\n${a.textContent}\n${res}`;

                    // 第0 个存放小说名称了
                    await this.storeContent(i + 1, key, content)

                    this.log(`${++currentTaskNum}/${titles.length} ${a.textContent}`);
                    this.progressEvent(currentTaskNum / titles.length);

                    resolve("");
                }).catch(err => {
                    console.error(err);
                    reject(err);
                }).finally(() => {
                    // 当前任务已完成 或失败, 从任务列表移除
                    tasks.delete(task);
                });
            });

            tasks.add(task);

            // 如果设置了等待时间则等待
            if (this.sleepTime) {
                sleep(this.sleepTime);
            }
        }

        // 等待所有任务都有执行过(失败或完成)
        await Promise.allSettled(tasks.values()).catch(console.error);
        await startDownload(article, [...this.keyPath], this.store);

        // 清除本次存储的数据, 并关闭 indexedDB连接
        await this.clear();
        // 摧毁数据库, destroy 中会尝试关闭连接
        this.store.destroy();
        return false
    }
    /**
     * 清除缓存到 store 中的内容
     */
    async clear() {
        for (const key of this.keyPath) {
            if (!key) continue;
            await this.store.removeItem(key).catch(console.error)
        }
    }

}

/**小说内容已缓存完成, 开始导出 */
async function startDownload(article: string, keyPath: string[], store: IDB) {
    const blobOptions: BlobPropertyBag = { type: "text/plain;charset=utf-8", endings: "native" };
    /**拷贝 keyPath  */
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
            let result = (await store.getItem(key).catch(() => "") as string);
            if (result) {
                strings.push(result)
            }

        }

        blobs.push(new Blob([...strings], blobOptions));

        if (keyPath.length <= 0) {
            hasNext = false;
        }
    }

    let contentBlob = new Blob(blobs, blobOptions)
    downloadTextAsFile(contentBlob, article);
}


class Ui {
    /**日志容器 */
    logContainer!: HTMLElement | null;
    /**挂载的跟 元素 */
    root!: HTMLElement | null;
    /**进度容器 */
    progressContainer!: HTMLProgressElement | null;
    logs: string[] = [];

    constructor(run: Function) {
        const parser = new DOMParser();
        const root = parser.parseFromString(domStr, 'text/html');

        // 将 DOM 挂载到当前页面中
        document.body.append(root.querySelector('#bingxl-root') ?? '');
        this.initListen(run);
    }

    initListen(run: Function) {
        this.root = document.querySelector<HTMLElement>('#bingxl-root');

        this.root?.querySelector<HTMLButtonElement>('.bingxl_download')?.addEventListener('click', e => run(e))

        this.logContainer = this.root?.querySelector<HTMLElement>('.bingxl_log') ?? null;

        this.progressContainer = this.root?.querySelector<HTMLProgressElement>(".bingxl_progress") ?? null;

        // 清除日志
        this.root?.querySelector('.bingxl_clear')?.addEventListener('click', e => {
            if (this.logContainer) {
                this.logContainer.innerHTML = '';
            }
        });

        this.root?.querySelector<HTMLElement>(".bingxl_toggle")?.addEventListener("click", () => {
            const text = this.root?.querySelector(".bingxl_toggle")?.textContent;
            if (text === "收起") {
                this.root!.querySelector(".bingxl_toggle")!.textContent = "展开";
                this.root!.querySelector(".container")!.classList.add("hidden");
            } else {
                this.root!.querySelector(".bingxl_toggle")!.textContent = "收起";
                this.root!.querySelector(".container")!.classList.remove("hidden");
            }
        })


    }

    // 进度条事件处理
    progress = (value: number) => {
        if (this.progressContainer) {
            this.progressContainer.value = value;
        }
    }


    log = (...infos: any[]) => {
        this.logs.unshift(...infos);

        if (this.logContainer) {
            this.logContainer.innerText = this.logs.slice(0, 10).join("\n");
        }
    }
}
import { Base } from './Base'

export class DiyibanzhuMe extends Base {
    static pathmatch = /\/wap.php*/
    static siteName: string = "第一版主ME"
    static host = ['https://m.diyibanzhu.me/wap.php']

    // 目录页中的分页选择器
    tocPageSelector = 'select[name="pagelist"] option'
    titles = '.container div:nth-of-type(7) .list a'

    title = '.container .right h1'
    contentSelector: string = '.page-content #nr1'
    filters = [".chapterPages", "font"]
    contentNextPage: string = '.chapterPages span + a' // 本章内容的下一页

    matchReg: string = "/wap.php"

    /** 获取内容间隔 单位:ms 短时间有太多次请求时有些网站会采取限制策略, 故设置间隔时间*/
    sleepTime = 500;
    /** 同时获取数据的最大值 (并发量控制) */
    taskMax = 2;

    /**
     * 返回所有章节的链接
     * @param url 目录链接
     * @returns {Chapter[]}
     */
    async getTitles(url = "") {

        type titleT = {
            href: string
            textContent: string
        }
        const titleSelector = this.titles

        const titlesFromDocument = (dm: Document) => {
            console.log("in titlesFromDocument", "selector: ", titleSelector)
            const titles = Array.from(dm?.querySelectorAll<HTMLAnchorElement>(titleSelector))
            return titles.map(v => { return { href: v.href, textContent: v.textContent ?? "" } })
        }

        // 有url 参数，只需要处理url 页中的章节
        if (url) {
            let domStr = await fetch(url).then(res => res.text())
            let dm = new DOMParser().parseFromString(domStr, "text/html")
            return titlesFromDocument(dm)
        }

        // 没 url 参数，先获取目录分页情况，没有分页则处理浏览器当前所在页面的目录
        let pages = document.querySelectorAll<HTMLOptionElement>(this.tocPageSelector)
        if (!pages || pages.length === 0) {
            return titlesFromDocument(document)
        }

        let links = Array.from(pages)?.map(v => v.value)
        let titles: titleT[] = []
        for (let link of links) {
            let result = (await this.getTitles(link)) ?? []
            titles = titles.concat(result)
        }

        return titles
    }

    /**
   * 从DOM 树中提取小说内容
   * @param {string} url 
   * @returns {string} 章节内容
   */
    async getContent(url: string): Promise<string> {
        if (!url) {
            return ""
        }

        let content = await this.getArticle(url)

        // 将字符串解析为 DOM 树
        let parser = new DOMParser()
        let p = parser.parseFromString(content, "text/html")
        let nextPage = p.querySelector<HTMLAnchorElement>(this.contentNextPage)?.href ?? ""
        this.filter(p);
        let curContent = await this.getArticleContent(p)


        if (nextPage) {
            let nextContent = await this.getContent(nextPage)
            curContent += "\n" + nextContent
        }


        return curContent
    }
}
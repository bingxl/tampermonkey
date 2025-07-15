import { Base } from './Base'

export class DiyibanzhuMe extends Base {
    static pathmatch = /\/wap.php*/
    static siteName: string = "第一版主ME"
    static host = ['https://m.diyibanzhu.me/wap.php']

    // 目录页中的下一页选择器
    tocPageSelector = ''
    titles = '.container div:nth-of-type(7) .list a'

    title = '.container .right h1'
    contentSelector: string = '.page-content #nr1'
    filters = [".chapterPages", "font"]
    contentNextPage: string = '.chapterPages span + a' // 本章内容的下一页

    matchReg: string = "/wap.php"

    /**
     * 返回章节列表
     * @returns {Chapter[]}
     * @TODO  章节分多页时的处理方法
     */
    async getTitles() {
        const titles = Array.from(document.querySelectorAll<HTMLAnchorElement>(this.titles))
        return titles.map(v => { return { href: v.href, textContent: v.textContent } })
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
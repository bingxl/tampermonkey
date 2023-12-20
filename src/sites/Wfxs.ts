import { Base } from "./Base";
import { ChapterInter, log } from "../tool/misc";

// 微风小说
// https://m.wfxs.tw/
export class Wfxs extends Base {
    titles = '#html_box > li > a';
    title = 'body > div.h_header.d_header > h2';
    download = '#shoucang';
    sleepTime = 300;

    static host = ['https://m.wfxs.tw/booklist/*'];
    static pathMatch = /\/booklist\/\d+\.html/;
    static siteName = '微风小说';

    /**
     * @override
     */
    getArticleContent(parser: Document): string {
        const contents = Array.from(parser.querySelectorAll<HTMLElement>('#read_conent_box>p') ?? []).map(v => v.textContent)
        return contents.join('\n')
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

        const content1 = [this.getArticleContent(p)]

        // 每章分页都可能不同, 需要解析到具体章节后看
        const next = p?.querySelector<HTMLAnchorElement>('body > article > div.page > div > ul > li:nth-child(3) > a')
        if (next?.textContent === '下一頁') {
            content1.push(await this.getContent(next.href))
        }

        return content1.join('\n');
    }


    /**
     * @override
     */
    async getTitles() {
        log('in getTitles function')
        let parseTitle = (content: string) => {
            let parser = new DOMParser();
            let p = parser.parseFromString(content, "text/html");
            const titles = Array.from(p.querySelectorAll<HTMLAnchorElement>(this.titles)) as ChapterInter[];
            return titles.map(v => { return { href: v.href, textContent: v.textContent } });
        }
        let titles: Array<ChapterInter> = []
        let pages: HTMLAnchorElement[] = Array.from(document.querySelectorAll('#chapter_min_list_box > div > div > div.entry > ul > li > a'))
        log('title is: ', titles)
        const len = pages.length;
        let cur = 0;
        for (let page of pages) {
            let domStr = await fetch(page.href).then(res => res.text())
            titles.push(...parseTitle(domStr))
            log(`处理目录${cur++}/${len}`)
        }
        return titles

    }
}
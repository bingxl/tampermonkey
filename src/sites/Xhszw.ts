import { Base } from "./Base";
import { ChapterInter, log } from "../tool/misc";

// https://www.xhszw.com/book/8308/
export class Xhszw extends Base {
    titles = '#list-chapterAll > dd > a';
    title = 'div.bookinfo > h1';
    download = 'div.bookinfo > div > a:nth-child(1)';
    sleepTime = 100;

    static host = ['www.xhszw.com', 'xhszw.com'];
    static pathMatch = /\/book\/\d+\/$/;

    /**
     * @override
     */
    async getContent(url: string) {
        const [, articleid, chapterid] = /.+\/(\d+)\/(\d+).html/.exec(url) ?? [];
        const api = '/api/reader_js.php'
        return await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `articleid=${articleid}&chapterid=${chapterid}&pid=1`
        }).then(res => res.text())
            .then(res => {
                return res.replaceAll(/<\/?p>/g, '\n')
            })


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
        let pages: HTMLOptionElement[] = Array.from(document.querySelectorAll('#indexselect > option'))
        log('title is: ', titles)
        for (let page of pages) {
            let domStr = await fetch(page.value).then(res => res.text())
            titles.push(...parseTitle(domStr))
        }
        return titles

    }
}
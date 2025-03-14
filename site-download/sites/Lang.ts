
import { Base } from './Base'


// 狼人小说 www.langrenxiaoshuo.com
export class Lang extends Base {
    titles = 'body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a';
    title = 'div.row.row-detail > div > h2 > font';
    download = 'body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read';

    static host = ['https://www.langrenxiaoshuo.com/html/*/'];
    static pathMatch = /\/html\/\w+\/$/;
    static siteName = '狼人小说';
    filters = ['.content font', '.content .chapterPages'];

    async pages(url: string) {
        let html = await this.getArticle(url)

        // 将字符串解析为 DOM 树
        let parser = new DOMParser()
        let p = parser.parseFromString(html, "text/html");
        let subPageUrls = Array.from(p.querySelectorAll<HTMLAnchorElement>(".chapterPages a")).map(a => a.href);
        this.filter(p);
        let content = [await this.getArticleContent(p)];

        for (let url of subPageUrls) {
            content.push(await this.getContent(url))
            console.log("已处理" + url);
        }

        return Array.isArray(content) ? content.join('\n') : content

    }

    async getArticle(url: string) {
        return await fetch(url).then(res => res.arrayBuffer())
            .then(res => {
                // 解码
                return new TextDecoder('gbk').decode(res)
            })
    }

    getArticleContent(parser: Document) {
        return parser.querySelector('#content > div')?.textContent ?? "" + "\n";
    }

}
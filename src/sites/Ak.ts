import { Base } from "./Base";

// 06Ak小说 www.06ak.com
export class Ak extends Base {

    titles = '#ul_all_chapters>li>a';
    title = 'body > div.container > section > div.novel_info_main > div > h1';
    download = 'body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn';

    static host = ['www.06ak.com'];
    static pathMatch = /\/book\/\d+$/;
    static siteName = '06Ak小说';
    // @override
    // 从DOM树中获取章节内容
    getArticleContent(parser: Document) {
        return Array.from(parser.querySelectorAll("#article>p")).map(a => a.textContent + "\n").join('')
    }
    // @override
    // 有些章节分几页,需要单独处理
    async pages(url: string) {
        let content1 = await this.getContent(url);
        let page2 = url.replace('\.html', '_2.html')
        let content2 = await this.getContent(page2)
        return content1 + "\n" + content2;
    }
}
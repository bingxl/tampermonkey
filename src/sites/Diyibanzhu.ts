import { Base } from "./Base";

// 第一版主 www.diyibanzhu.buzz
export class Diyibanzhu extends Base {
    titles = 'div.ml_content > div.zb > div.ml_list > ul > li > a';
    title = 'div.introduce > h1';
    download = 'div.introduce > div > p:nth-child(4) > a';

    static host = ['https://www.diyibanzhu.buzz/*/*/'];
    static pathMatch = /\/\d+\/\d+\/$/;
    static siteName = '第一版主';

    /** @override */
    async getArticle(url: string) {
        return await fetch(url).then(res => res.arrayBuffer())
            .then(res => {
                return new TextDecoder('gbk').decode(res)
            })
    }
    /** @override */
    getArticleContent(parser: Document) {
        const c = parser.querySelector('#articlecontent')?.innerHTML.replaceAll('&nbsp;', '').replaceAll('<br>', '\n') ?? "";
        return c + "\n"
    }

}
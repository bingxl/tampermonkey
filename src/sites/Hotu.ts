
import { Base } from "./Base";
// 河图小说
export class Hotu extends Base {
    titles = 'div.bookdetails-catalog-box > ul > li > a';
    title = 'div.bookdetails-left-mainbox > div:nth-child(1) > div > div > h1';
    download = 'p.bookdetalis-bookinfo-bookbtnbox.suofang > a';

    static host = ['www.hotupub.net'];
    static pathMatch = /\/book\/\d+\/$/;
    static siteName = '河图小说';

    getArticleContent(parser: Document) {
        const c = parser.querySelector('div.bookread-content-box')?.innerHTML.replaceAll('<br>', '\n') ?? "";
        return c
    }
}

import { Base } from "./Base";

export class Tianya extends Base {
    titles = '.book dl a';
    title = '.book > h1';
    download = '#main > div.book > h2 > a';
    contentSelector = "#main > p:nth-child(4)"
    charset = 'gbk';

    static host = ['https://www.tianyabooks.com/*/*/'];
    static pathMatch = /\/\w+\/.+\//;
    static siteName = '天涯书库';
}
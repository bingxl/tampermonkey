import { Tianya } from "./Tianya";


export class TianyaWx extends Tianya {
    contentSelector = "td p"

    static host = ['https://wx.tianyabooks.com/book/*/'];
    static pathMatch = /\/book\/\w+\//;
    static siteName = '天涯书库-武侠小说';
}
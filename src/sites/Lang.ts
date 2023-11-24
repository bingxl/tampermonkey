
import { Base } from '../Base'


// 狼人小说 www.langrenxiaoshuo.com
export class Lang extends Base {
    titles = 'body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a';
    title = 'div.row.row-detail > div > h2 > font';
    download = 'body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read';

    static host = ['www.langrenxiaoshuo.com'];
    static pathMatch = /\/html\/\w+\/$/;

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
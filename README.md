# tampermonkey
一些自用的网页脚本

## 支持的小说网站:
+ https://www.06ak.com
+ https://www.langrenxiaoshuo.com
+ https://www.hotupub.net
+ https://www.diyibanzhu.buzz/*/*/
+ https://www.xhszw.com/book/*/
+ https://m.wfxs.tw/booklist/*


以上网站都只能下载免费部分

## 使用方法
浏览器中安装油猴子或 tampermonkey 扩展.
打开tampermonkey面板 -> 实用工具 -> 从 URL 安装,  输入 `https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/main.js` 安装


## 文本转简体
将`txt`文件放到 `./txt` 目录下, 运行 `node ts.js`

## developer
新增/修改具体网站的内容 到 `./src/sites/` 下编辑

构建: `npm run build` 或 `node build.js`

## 阅读3.0 书源
[阅读3.0 legado](https://github.com/gedoor/legado)

在软件中使用网络导入, 导入 url `https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/BookSource.json`

已完成小说列表
+ [AK小说](https://www.06ak.com)
+ [阿姑小说](http://m.aguxs.com)
+ [八毛小说](http://m.bamxs.com)
+ [精品笔趣阁](https://bqgjpw.com)
+ [第一版主](https://www.diyibanzhu.buzz)
+ [大众文学](https://m.dzwx520.com)
+ [笔趣阁 fangzie](https://m.fangzie.com)
+ [河图文化](https://www.hotupub.net)
+ [狼人小说](https://www.langrenxiaoshuo.com)
+ [微风小说](https://m.wfxs.tw)
+ [xhszw](https://www.xhszw.com)
+ [新御书屋](https://m.xinyushuwu1.com)
+ [依兰小说](https://www.yilanxs.com)


已完成漫画列表
+ [rouman5](http://rouman5.com)
+ [包子漫画](https://www.baozimh.com)

## 书源编辑方法
编辑书源时先到 `src/booksource/`下找到对应json文件进行编辑或新增json文件; `target/BookSource.json`文件都是程序生成的,请吴在此编辑.

生成书源命令 `pnpm run booksource`
# tampermonkey

一些自用的网页脚本和阅读(legado)书源
- 添加网站快捷键的 tampermonkey 脚本 monkeyscripts/shutcuts.js
- 一些小说下载的 tampermonkey 脚本 monkeyscripts/site-download_auto_gen.js
- legado 书源 booksource/legadoBookSource.json 和 booksource/target/

## 使用方法

浏览器中安装油猴子或 tampermonkey 扩展.
打开 tampermonkey 面板 -> 实用工具 -> 从 URL 安装, 输入

```
小说下载脚本:
https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js

快捷键脚本:
https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/shutcut.js
```

后点击安装

安装完后确认油猴子脚本中启用了脚本

进入支持的网站中小说目录页, 页面右上角出现下载字样时点击下载, 等待完成.

## 支持的小说网站:

- https://www.06ak.com
- https://www.langrenxiaoshuo.com
- https://www.hotupub.net
- https://www.diyibanzhu.buzz/*/*/
- https://www.xhszw.com/book/*/
- https://m.wfxs.tw/booklist/*

[点此查看更多具体网站](/doc/siteList.md)

以上网站都只能下载免费部分

## 阅读 3.0 书源

[阅读 3.0 legado](https://github.com/gedoor/legado)

在软件中使用网络导入, 导入 url

原始未处理的书源, 比较多, 接近 2000 多个 [点击直接导入](legado://booksource/importonline?src=https://raw.githubusercontent.com/bingxl/tampermonkey/main/booksource/legadoBookSource.json)

```
https://raw.githubusercontent.com/bingxl/tampermonkey/main/booksource/legadoBookSource.json
```

过滤过的源 包含 (名著|正版|出版|国外经典)且排除(辣文|高辣|韩漫) [点击直接导入](legado://booksource/importonline?src=https://raw.githubusercontent.com/bingxl/tampermonkey/main/booksource/filtered-legado.json)

```
https://raw.githubusercontent.com/bingxl/tampermonkey/main/booksource/target/filtered-legado.json
```

已完成小说列表

- [AK 小说](https://www.06ak.com)
- [阿姑小说](http://m.aguxs.com)
- [八毛小说](http://m.bamxs.com)
- [精品笔趣阁](https://bqgjpw.com)
- [第一版主](https://www.diyibanzhu.buzz)
- [大众文学](https://m.dzwx520.com)
- [笔趣阁 fangzie](https://m.fangzie.com)
- [河图文化](https://www.hotupub.net)
- [狼人小说](https://www.langrenxiaoshuo.com)
- [微风小说](https://m.wfxs.tw)
- [xhszw](https://www.xhszw.com)
- [新御书屋](https://m.xinyushuwu1.com)

[点此查看更多具体书源](/doc/sourceList.md)

## 新增/编辑下载网站方式

新增/修改具体网站的内容 到 `./site-download/sites/` 下编辑

构建: `npm run build` 或 `node build.js`

## 书源编辑方法

生成书源命令 `pnpm run booksource`

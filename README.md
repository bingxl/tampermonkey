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
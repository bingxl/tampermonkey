// ==UserScript==
// @name         06ak
// @namespace    http://tampermonkey.net/
// @version      2023112123
// @description  AK小说, 狼人小说下载, 安装脚本后打开小说目录页面,点击下载
// @author       bingxl
// @homepage     https://github.com/bingxl/tampermonkey
// @match        https://www.langrenxiaoshuo.com/html/*/
// @match        https://www.06ak.com/book/*
// @match        https://www.diyibanzhu.buzz/*/*/
// @match        https://www.hotupub.net/book/*/
// @match        https://www.xhszw.com/book/*/
// @match        https://xhszw.com/book/*/
// @match        https://m.wfxs.tw/booklist/*
// @match        https://www.tianyabooks.com/*/*/
// @match        https://wx.tianyabooks.com/book/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/main.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/target/main.js
// ==/UserScript==

"use strict";
(() => {
  // src/tool/misc.ts
  function downloadTextAsFile(text, filename) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8", endings: "native" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }, 0);
  }
  function log(...infos) {
    console.log(...infos);
  }
  function sleep(d) {
    let now = Date.now();
    while (Date.now() - now <= d)
      ;
  }
  function gbk2Utf8(buffer) {
    const decode = new TextDecoder("gbk");
    return decode.decode(buffer);
  }

  // src/sites/Base.ts
  var Base = class {
    constructor() {
      /** 小说章节的选择器 */
      this.titles = "";
      /** 小说名选择器 */
      this.title = "";
      /** 下载按钮选择器 */
      this.download = "";
      /**章节内容选择器 */
      this.contentSelector = "";
      /**获取章节内容时的字符集 */
      this.charset = "utf8";
      /** @type {string[]} 网站 host */
      this.host = [];
      /** 书籍目录页面 匹配正则 location.pathname.match() */
      this.matchReg = "";
      /** 获取内容间隔 单位:ms 短时间有太多次请求时有些网站会采取限制策略, 故设置间隔时间*/
      this.sleepTime = 0;
      /** 同时获取数据的最大值 (并发量控制) */
      this.taskMax = 20;
    }
    /**
     * 获取小说内容,返回文档编码方式需要处理
     * @override
     * @param {string} url 获取地址
     * @returns {string} 小说页面 HTML 字符串
     */
    async getArticle(url) {
      const res = await fetch(url);
      let result = "";
      if (this.charset.includes("gb")) {
        const buffer = await res.arrayBuffer();
        result = gbk2Utf8(buffer);
      } else {
        result = await res.text();
      }
      return result;
    }
    /**
     * 从DOM树中获取章节内容
     * @override
     * @param {DOMParser} parser
     * @return {string} 小说章节内容
     */
    getArticleContent(parser) {
      const c = parser.querySelector(this.contentSelector)?.innerText ?? "";
      return c;
    }
    /**
     * 处理一章分多页的问题
     * 有些章节分几页, 需要单独处理
     * @param {string} url 章节url
     * @override
     * @returns {string} 小说章节内容
     */
    async pages(url) {
      let content = await this.getContent(url);
      return Array.isArray(content) ? content.join("\n") : content;
    }
    /**
     * 从DOM 树中提取小说内容
     * @param {string} url 
     * @returns {string} 章节内容
     */
    async getContent(url) {
      let content = await this.getArticle(url);
      let parser = new DOMParser();
      let p = parser.parseFromString(content, "text/html");
      return this.getArticleContent(p);
    }
    /**
     * 小说章节格式
     * @typedef {Object} Chapter
     * @property {string} href 章节内容获取连接
     * @property {string} textContent 章节标题
     */
    /**
     * 返回章节列表
     * @returns {Chapter[]}
     */
    async getTitles() {
      const titles = Array.from(document.querySelectorAll(this.titles));
      return titles.map((v) => {
        return { href: v.href, textContent: v.textContent };
      });
    }
    async run(e) {
      e?.preventDefault();
      log("执行下载函数");
      log("小说名 Selector: ", this.title);
      const article = document.querySelector(this.title)?.textContent ?? "";
      const titles = await this.getTitles().catch(console.error) ?? [];
      let contents = [];
      let tasks = /* @__PURE__ */ new Set();
      let currentTaskNum = 0;
      for (let i = 0; i < titles.length; i++) {
        let a = titles[i];
        if (tasks.size >= this.taskMax) {
          await Promise.any(tasks.values());
        }
        let task = new Promise((resolve, reject) => {
          this.pages(a.href).then((res) => {
            contents[i] = `
${a.textContent}
${res}`;
            log(`${++currentTaskNum}/${titles.length} ${a.textContent}`);
            resolve("");
          }).catch((err) => {
            console.error(err);
            reject(err);
          }).finally(() => {
            tasks.delete(task);
          });
        });
        tasks.add(task);
        if (this.sleepTime) {
          sleep(this.sleepTime);
        }
      }
      await Promise.all(tasks.values());
      downloadTextAsFile(article + "\n" + contents.join("\n"), article);
      return false;
    }
    init() {
      log(this);
      let d = document.querySelector(this.download);
      if (d) {
        d.textContent = "下载";
        d.addEventListener("click", (e) => this.run(e));
      }
    }
  };

  // src/sites/Ak.ts
  var Ak = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "#ul_all_chapters>li>a";
      this.title = "body > div.container > section > div.novel_info_main > div > h1";
      this.download = "body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn";
    }
    static {
      this.host = ["https://www.06ak.com/book/*"];
    }
    static {
      this.pathMatch = /\/book\/\d+$/;
    }
    static {
      this.siteName = "06Ak小说";
    }
    // @override
    // 从DOM树中获取章节内容
    getArticleContent(parser) {
      return Array.from(parser.querySelectorAll("#article>p")).map((a) => a.textContent + "\n").join("");
    }
    // @override
    // 有些章节分几页,需要单独处理
    async pages(url) {
      let content1 = await this.getContent(url);
      let page2 = url.replace(".html", "_2.html");
      let content2 = await this.getContent(page2);
      return content1 + "\n" + content2;
    }
  };

  // src/sites/Diyibanzhu.ts
  var Diyibanzhu = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "div.ml_content > div.zb > div.ml_list > ul > li > a";
      this.title = "div.introduce > h1";
      this.download = "div.introduce > div > p:nth-child(4) > a";
    }
    static {
      this.host = ["https://www.diyibanzhu.buzz/*/*/"];
    }
    static {
      this.pathMatch = /\/\d+\/\d+\/$/;
    }
    static {
      this.siteName = "第一版主";
    }
    /** @override */
    async getArticle(url) {
      return await fetch(url).then((res) => res.arrayBuffer()).then((res) => {
        return new TextDecoder("gbk").decode(res);
      });
    }
    /** @override */
    getArticleContent(parser) {
      const c = parser.querySelector("#articlecontent")?.innerHTML.replaceAll("&nbsp;", "").replaceAll("<br>", "\n") ?? "";
      return c + "\n";
    }
  };

  // src/sites/Hotu.ts
  var Hotu = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "div.bookdetails-catalog-box > ul > li > a";
      this.title = "div.bookdetails-left-mainbox > div:nth-child(1) > div > div > h1";
      this.download = "p.bookdetalis-bookinfo-bookbtnbox.suofang > a";
    }
    static {
      this.host = ["https://www.hotupub.net/book/*/"];
    }
    static {
      this.pathMatch = /\/book\/\d+\/$/;
    }
    static {
      this.siteName = "河图小说";
    }
    getArticleContent(parser) {
      const c = parser.querySelector("div.bookread-content-box")?.innerHTML.replaceAll("<br>", "\n") ?? "";
      return c;
    }
  };

  // src/sites/Lang.ts
  var Lang = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a";
      this.title = "div.row.row-detail > div > h2 > font";
      this.download = "body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read";
    }
    static {
      this.host = ["https://www.langrenxiaoshuo.com/html/*/"];
    }
    static {
      this.pathMatch = /\/html\/\w+\/$/;
    }
    static {
      this.siteName = "狼人小说";
    }
    async getArticle(url) {
      return await fetch(url).then((res) => res.arrayBuffer()).then((res) => {
        return new TextDecoder("gbk").decode(res);
      });
    }
    getArticleContent(parser) {
      return parser.querySelector("#content > div")?.textContent ?? "\n";
    }
  };

  // src/sites/Tianya.ts
  var Tianya = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = ".book dl a";
      this.title = ".book > h1";
      this.download = "#main > div.book > h2 > a";
      this.contentSelector = "#main > p:nth-child(4)";
      this.charset = "gbk";
    }
    static {
      this.host = ["https://www.tianyabooks.com/*/*/"];
    }
    static {
      this.pathMatch = /\/\w+\/.+\//;
    }
    static {
      this.siteName = "天涯书库";
    }
  };

  // src/sites/TianyaWx.ts
  var TianyaWx = class extends Tianya {
    constructor() {
      super(...arguments);
      this.contentSelector = "td p";
    }
    static {
      this.host = ["https://wx.tianyabooks.com/book/*/"];
    }
    static {
      this.pathMatch = /\/book\/\w+\//;
    }
    static {
      this.siteName = "天涯书库-武侠小说";
    }
  };

  // src/sites/Wfxs.ts
  var Wfxs = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "#html_box > li > a";
      this.title = "body > div.h_header.d_header > h2";
      this.download = "#shoucang";
      this.sleepTime = 300;
    }
    static {
      this.host = ["https://m.wfxs.tw/booklist/*"];
    }
    static {
      this.pathMatch = /\/booklist\/\d+\.html/;
    }
    static {
      this.siteName = "微风小说";
    }
    /**
     * @override
     */
    getArticleContent(parser) {
      const contents = Array.from(parser.querySelectorAll("#read_conent_box>p") ?? []).map((v) => v.textContent);
      return contents.join("\n");
    }
    /**
    * 从DOM 树中提取小说内容
    * @param {string} url 
    * @returns {string} 章节内容
    */
    async getContent(url) {
      let content = await this.getArticle(url);
      let parser = new DOMParser();
      let p = parser.parseFromString(content, "text/html");
      const content1 = [this.getArticleContent(p)];
      const next = p?.querySelector("body > article > div.page > div > ul > li:nth-child(3) > a");
      if (next?.textContent === "下一頁") {
        content1.push(await this.getContent(next.href));
      }
      return content1.join("\n");
    }
    /**
     * @override
     */
    async getTitles() {
      log("in getTitles function");
      let parseTitle = (content) => {
        let parser = new DOMParser();
        let p = parser.parseFromString(content, "text/html");
        const titles2 = Array.from(p.querySelectorAll(this.titles));
        return titles2.map((v) => {
          return { href: v.href, textContent: v.textContent };
        });
      };
      let titles = [];
      let pages = Array.from(document.querySelectorAll("#chapter_min_list_box > div > div > div.entry > ul > li > a"));
      log("title is: ", titles);
      const len = pages.length;
      let cur = 0;
      for (let page of pages) {
        let domStr = await fetch(page.href).then((res) => res.text());
        titles.push(...parseTitle(domStr));
        log(`处理目录${cur++}/${len}`);
      }
      return titles;
    }
  };

  // src/sites/Xhszw.ts
  var Xhszw = class extends Base {
    constructor() {
      super(...arguments);
      this.titles = "#list-chapterAll > dd > a";
      this.title = "div.bookinfo > h1";
      this.download = "div.bookinfo > div > a:nth-child(1)";
      this.sleepTime = 500;
    }
    static {
      this.host = ["https://www.xhszw.com/book/*/", "https://xhszw.com/book/*/"];
    }
    static {
      this.pathMatch = /\/book\/\d+\/$/;
    }
    static {
      this.siteName = "xhszw";
    }
    /**
     * @override
     */
    async getContent(url) {
      const [, articleid, chapterid] = /.+\/(\d+)\/(\d+).html/.exec(url) ?? [];
      const api = "/api/reader_js.php";
      return await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `articleid=${articleid}&chapterid=${chapterid}&pid=1`
      }).then((res) => res.text()).then((res) => {
        return res.replaceAll(/<\/?p>/g, "\n");
      });
    }
    /**
     * @override
     */
    async getTitles() {
      log("in getTitles function");
      let parseTitle = (content) => {
        let parser = new DOMParser();
        let p = parser.parseFromString(content, "text/html");
        const titles2 = Array.from(p.querySelectorAll(this.titles));
        return titles2.map((v) => {
          return { href: v.href, textContent: v.textContent };
        });
      };
      let titles = [];
      let pages = Array.from(document.querySelectorAll("#indexselect > option"));
      log("title is: ", titles);
      for (let page of pages) {
        let domStr = await fetch(page.value).then((res) => res.text());
        titles.push(...parseTitle(domStr));
      }
      return titles;
    }
  };

  // src/sites/index.ts
  var sites = [
    Lang,
    Ak,
    Diyibanzhu,
    Hotu,
    Xhszw,
    Wfxs,
    Tianya,
    TianyaWx
  ];

  // src/main.ts
  var { host, pathname } = location;
  sites.some((v) => {
    const hosts = v.host.map((h) => new URL(h).host);
    if (hosts.includes(host) && pathname.match(v.pathMatch)) {
      new v().init();
      return true;
    }
  });
})();

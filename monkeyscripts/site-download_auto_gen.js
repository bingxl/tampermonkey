// nodejs cmd 生成的文件, 请勿直接编辑此文件
// ==UserScript==
// @name         小说下载
// @namespace    http://tampermonkey.net/
// @version      2025031412
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
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// ==/UserScript==

"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // site-download/sites.js
  var require_sites = __commonJS({
    "site-download/sites.js"(exports, module) {
      "use strict";
      var __defProp2 = Object.defineProperty;
      var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames2 = Object.getOwnPropertyNames;
      var __hasOwnProp2 = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all)
          __defProp2(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps2 = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames2(from))
            if (!__hasOwnProp2.call(to, key) && key !== except)
              __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
      var sites_exports = {};
      __export(sites_exports, {
        sites: () => sites2
      });
      module.exports = __toCommonJS(sites_exports);
      function downloadTextAsFile(content, filename) {
        let blob;
        if (typeof content === "string") {
          blob = new Blob([content], { type: "text/plain;charset=utf-8", endings: "native" });
        } else {
          blob = content;
        }
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
      function sleep(d) {
        let now = Date.now();
        while (Date.now() - now <= d)
          ;
      }
      function gbk2Utf8(buffer) {
        const decode = new TextDecoder("gbk");
        return decode.decode(buffer);
      }
      var IDB = class {
        constructor({ dbName = "IDBSample", storeName = "IDBSampleStore", version = 1 } = {}) {
          this.version = 1;
          this.dbName = dbName;
          this.storeName = storeName;
          this.version = version;
        }
        /**打开数据库 */
        async init() {
          if (!this.db) {
            return new Promise((resolve, reject) => {
              const request = indexedDB.open(this.dbName, this.version);
              request.onerror = (err) => {
                console.error(err);
                reject(err);
              };
              request.onsuccess = () => {
                this.db = request.result;
                resolve("");
              };
              request.onupgradeneeded = () => {
                const db = request.result;
                db.createObjectStore(this.storeName);
              };
            });
          }
        }
        /**存放值 */
        async setItem(key, value) {
          if (!this.db) {
            await this.init();
          }
          ;
          return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readwrite").objectStore(this.storeName).add(value, key);
            request.onerror = (err) => {
              console.error(err);
              reject(err);
            };
            request.onsuccess = () => {
              resolve("");
            };
          });
        }
        /**获取值 */
        async getItem(key) {
          if (!this.db) {
            await this.init();
          }
          ;
          return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readonly").objectStore(this.storeName).get(key);
            request.onerror = (err) => {
              console.error(err);
              reject(err);
            };
            request.onsuccess = () => {
              resolve(request.result);
            };
          });
        }
        /**移除值 */
        async removeItem(key) {
          if (!this.db) {
            await this.init();
          }
          ;
          return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readwrite").objectStore(this.storeName).delete(key);
            request.onerror = (err) => {
              console.error(err);
              reject(err);
            };
            request.onsuccess = () => {
              resolve("");
            };
          });
        }
        /**关闭数据库连接 */
        close() {
          this.db?.close();
        }
        /**删除数据库 */
        destroy() {
          this.db?.close();
          window.indexedDB.deleteDatabase(this.dbName);
        }
      };
      var show_default = '<div id="bingxl-root">\r\n\r\n    <style>\r\n        #bingxl-root {\r\n            position: fixed;\r\n            top: 20px;\r\n            right: 20px;\r\n            background-color: cornsilk;\r\n\r\n        }\r\n\r\n        #bingxl-root .container {\r\n            width: 150px;\r\n        }\r\n\r\n        #bingxl-root .container.hidden {\r\n            width: 0;\r\n            height: 0;\r\n        }\r\n\r\n        header {\r\n            display: flex;\r\n            justify-content: space-around;\r\n        }\r\n\r\n        .log {\r\n            max-height: 250px;\r\n            overflow-y: scroll;\r\n            width: 150px;\r\n            overflow-x: hidden;\r\n        }\r\n    </style>\r\n\r\n\r\n    <section class="toggle">收起</section>\r\n    <div class="container">\r\n        <header class="header"><button class="download">下载</button> <button class="clear">清除日志</button></header>\r\n        <progress value="0" class="progress"></progress>\r\n\r\n        <section>\r\n            <pre class="log">\r\n\r\n        </pre>\r\n        </section>\r\n    </div>\r\n\r\n</div>';
      var Base = class {
        // 挂载到文档中的DOM结构 和 时间监听处理
        constructor() {
          this.titles = "";
          this.title = "";
          this.download = "";
          this.contentSelector = "";
          this.charset = "utf8";
          this.host = [];
          this.matchReg = "";
          this.sleepTime = 2;
          this.taskMax = 2;
          this.filters = [];
          this.keyPath = [];
          this.run = async (e) => {
            e?.preventDefault();
            this.log("执行下载函数");
            const article = document.querySelector(this.title)?.textContent ?? "";
            this.store = new IDB({ dbName: article || "小说名" });
            await this.clear();
            let articleKey = "" + Date.now();
            this.storeContent(0, articleKey, article);
            const titles = await this.getTitles().catch(console.error) ?? [];
            let tasks = /* @__PURE__ */ new Set();
            let currentTaskNum = 0;
            for (let i = 0; i < titles.length; i++) {
              let a = titles[i];
              let key = `${article}${Date.now()}-${i}`;
              if (tasks.size >= this.taskMax) {
                await Promise.any(tasks.values()).catch(console.error);
              }
              let task = new Promise((resolve, reject) => {
                this.pages(a.href).then(async (res) => {
                  const content = `
${a.textContent}
${res}`;
                  await this.storeContent(i + 1, key, content);
                  this.log(`${++currentTaskNum}/${titles.length} ${a.textContent}`);
                  this.progressEvent(currentTaskNum / titles.length);
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
            await Promise.allSettled(tasks.values()).catch(console.error);
            await startDownload(article, [...this.keyPath], this.store);
            await this.clear();
            this.store.destroy();
            return false;
          };
          const ui = new Ui(this.run);
          this.log = ui.log;
          this.progressEvent = ui.progress;
        }
        /**
         * 将章节内容存储到 缓存区 (indexedDB/ webSQL/ localStorage/ sessionStorage) 
         * @param {number} index 当前存储数据在 keyPath 中的排序
         * @param {string} keyPath key
         */
        async storeContent(index, key, content) {
          this.keyPath[index] = key;
          await this.store.setItem(key, content).catch((e) => {
            console.error(e);
          });
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
        filter(p) {
          for (let selector of this.filters) {
            p.querySelector(selector)?.remove();
          }
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
          this.filter(p);
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
        /**
         * 清除缓存到 store 中的内容
         */
        async clear() {
          for (const key of this.keyPath) {
            if (!key)
              continue;
            await this.store.removeItem(key).catch(console.error);
          }
        }
      };
      async function startDownload(article, keyPath, store) {
        const blobOptions = { type: "text/plain;charset=utf-8", endings: "native" };
        let batchSize = 30;
        let hasNext = true;
        let blobs = [];
        while (hasNext) {
          const batchKeys = keyPath.splice(0, batchSize);
          let strings = [];
          for (const key of batchKeys) {
            let result = await store.getItem(key).catch(() => "");
            if (result) {
              strings.push(result);
            }
          }
          blobs.push(new Blob([...strings], blobOptions));
          if (keyPath.length <= 0) {
            hasNext = false;
          }
        }
        let contentBlob = new Blob(blobs, blobOptions);
        downloadTextAsFile(contentBlob, article);
      }
      var Ui = class {
        constructor(run) {
          this.logs = [];
          this.progress = (value) => {
            if (this.progressContainer) {
              this.progressContainer.value = value;
            }
          };
          this.log = (...infos) => {
            this.logs.unshift(...infos);
            if (this.logContainer) {
              this.logContainer.innerText = this.logs.slice(0, 10).join("\n");
            }
          };
          const parser = new DOMParser();
          const root = parser.parseFromString(show_default, "text/html");
          document.body.append(root.querySelector("#bingxl-root") ?? "");
          this.initListen(run);
        }
        initListen(run) {
          this.root = document.querySelector("#bingxl-root");
          this.root?.querySelector(".download")?.addEventListener("click", (e) => run(e));
          this.logContainer = this.root?.querySelector(".log") ?? null;
          this.progressContainer = this.root?.querySelector(".progress") ?? null;
          this.root?.querySelector(".clear")?.addEventListener("click", (e) => {
            if (this.logContainer) {
              this.logContainer.innerHTML = "";
            }
          });
          this.root?.querySelector(".toggle")?.addEventListener("click", () => {
            const text = this.root?.querySelector(".toggle")?.textContent;
            if (text === "收起") {
              this.root.querySelector(".toggle").textContent = "展开";
              this.root.querySelector(".container").classList.add("hidden");
            } else {
              this.root.querySelector(".toggle").textContent = "收起";
              this.root.querySelector(".container").classList.remove("hidden");
            }
          });
        }
      };
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
      var Lang = class extends Base {
        constructor() {
          super(...arguments);
          this.titles = "body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a";
          this.title = "div.row.row-detail > div > h2 > font";
          this.download = "body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read";
          this.filters = [".content font", ".content .chapterPages"];
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
        async pages(url) {
          let html = await this.getArticle(url);
          let parser = new DOMParser();
          let p = parser.parseFromString(html, "text/html");
          let subPageUrls = Array.from(p.querySelectorAll(".chapterPages a")).map((a) => a.href);
          this.filter(p);
          let content = [await this.getArticleContent(p)];
          for (let url2 of subPageUrls) {
            content.push(await this.getContent(url2));
            console.log("已处理" + url2);
          }
          return Array.isArray(content) ? content.join("\n") : content;
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
          this.log("in getTitles function");
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
          this.log("title is: ", titles);
          const len = pages.length;
          let cur = 0;
          for (let page of pages) {
            let domStr = await fetch(page.href).then((res) => res.text());
            titles.push(...parseTitle(domStr));
            this.log(`处理目录${cur++}/${len}`);
          }
          return titles;
        }
      };
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
          this.log("in getTitles function");
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
          this.log("title is: ", titles);
          for (let page of pages) {
            let domStr = await fetch(page.value).then((res) => res.text());
            titles.push(...parseTitle(domStr));
          }
          return titles;
        }
      };
      var sites2 = [
        Lang,
        Ak,
        Diyibanzhu,
        Hotu,
        Xhszw,
        Wfxs,
        Tianya,
        TianyaWx
      ];
    }
  });

  // site-download/main.ts
  var import_sites = __toESM(require_sites());
  var { host, pathname } = location;
  import_sites.sites.some((v) => {
    const hosts = v.host.map((h) => new URL(h).host);
    if (hosts.includes(host) && pathname.match(v.pathMatch)) {
      new v();
      return true;
    }
  });
})();

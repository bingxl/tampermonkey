// build 生成的文件, 请勿直接编辑此文件
// ==UserScript==
// @name         小说下载
// @namespace    http://tampermonkey.net/
// @version      2025072010
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
// @match        https://m.diyibanzhu.me/wap.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/site-download_auto_gen.js
// ==/UserScript==

(() => {
  // site-download/tool/misc.ts
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

  // site-download/tool/idbSample.ts
  class IDB {
    dbName;
    storeName;
    version = 1;
    db;
    constructor({ dbName = "IDBSample", storeName = "IDBSampleStore", version = 1 } = {}) {
      this.dbName = dbName;
      this.storeName = storeName;
      this.version = version;
    }
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
    async setItem(key, value) {
      if (!this.db) {
        await this.init();
      }
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
    async getItem(key) {
      if (!this.db) {
        await this.init();
      }
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
    async removeItem(key) {
      if (!this.db) {
        await this.init();
      }
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
    close() {
      this.db?.close();
    }
    destroy() {
      this.db?.close();
      window.indexedDB.deleteDatabase(this.dbName);
    }
  }

  // site-download/show.html.raw
  var show_html_default = `<div id="bingxl-root">

    <style>
        #bingxl-root {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: cornsilk;
        }

        #bingxl-root .container {
            width: 150px;
        }

        #bingxl-root .container.hidden {
            width: 0;
            height: 0;
        }

        header.header {
            display: flex;
            justify-content: space-around;
        }

        .bingxl_log {
            max-height: 250px;
            overflow-y: scroll;
            width: 150px;
            overflow-x: hidden;
        }
    </style>

    <section class="toggle">收起</section>
    <div class="container">
        <header class="header">
            <button class="bingxl_download">下载</button>
            <button class="clear">清除日志</button>
        </header>
        <progress value="0" class="bingxl_progress"></progress>

        <section>
            <pre class="bingxl_log"> </pre>
        </section>
    </div>

</div>`;

  // site-download/sites/Base.ts
  class Base {
    static pathMatch = /.*/;
    static host;
    static siteName;
    titles = "";
    title = "";
    download = "";
    contentSelector = "";
    charset = "utf8";
    matchReg = "";
    sleepTime = 2;
    taskMax = 2;
    filters = [];
    log;
    keyPath = [];
    store;
    progressEvent;
    constructor() {
      const ui = new Ui(this.run);
      this.log = ui.log;
      this.progressEvent = ui.progress;
    }
    async storeContent(index, key, content) {
      this.keyPath[index] = key;
      await this.store.setItem(key, content).catch((e) => {
        console.error(e);
      });
    }
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
    getArticleContent(parser) {
      const c = parser.querySelector(this.contentSelector)?.innerText ?? "";
      return c;
    }
    async pages(url) {
      let content = await this.getContent(url);
      return Array.isArray(content) ? content.join(`
`) : content;
    }
    filter(p) {
      for (let selector of this.filters) {
        p.querySelector(selector)?.remove();
      }
    }
    async getContent(url) {
      let content = await this.getArticle(url);
      let parser = new DOMParser;
      let p = parser.parseFromString(content, "text/html");
      this.filter(p);
      return this.getArticleContent(p);
    }
    async getTitles() {
      const titles = Array.from(document.querySelectorAll(this.titles));
      return titles.map((v) => {
        return { href: v.href, textContent: v.textContent };
      });
    }
    run = async (e) => {
      e?.preventDefault();
      this.log("执行下载函数");
      const article = document.querySelector(this.title)?.textContent ?? "";
      this.store = new IDB({ dbName: article || "小说名" });
      await this.clear();
      let articleKey = "" + Date.now();
      this.storeContent(0, articleKey, article);
      const titles = await this.getTitles().catch(console.error) ?? [];
      let tasks = new Set;
      let currentTaskNum = 0;
      for (let i = 0;i < titles.length; i++) {
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
    async clear() {
      for (const key of this.keyPath) {
        if (!key)
          continue;
        await this.store.removeItem(key).catch(console.error);
      }
    }
  }
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

  class Ui {
    logContainer;
    root;
    progressContainer;
    logs = [];
    constructor(run) {
      const parser = new DOMParser;
      const root = parser.parseFromString(show_html_default, "text/html");
      document.body.append(root.querySelector("#bingxl-root") ?? "");
      this.initListen(run);
    }
    initListen(run) {
      this.root = document.querySelector("#bingxl-root");
      this.root?.querySelector(".bingxl_download")?.addEventListener("click", (e) => run(e));
      this.logContainer = this.root?.querySelector(".bingxl_log") ?? null;
      this.progressContainer = this.root?.querySelector(".bingxl_progress") ?? null;
      this.root?.querySelector(".bingxl_clear")?.addEventListener("click", (e) => {
        if (this.logContainer) {
          this.logContainer.innerHTML = "";
        }
      });
      this.root?.querySelector(".bingxl_toggle")?.addEventListener("click", () => {
        const text = this.root?.querySelector(".bingxl_toggle")?.textContent;
        if (text === "收起") {
          this.root.querySelector(".bingxl_toggle").textContent = "展开";
          this.root.querySelector(".container").classList.add("hidden");
        } else {
          this.root.querySelector(".bingxl_toggle").textContent = "收起";
          this.root.querySelector(".container").classList.remove("hidden");
        }
      });
    }
    progress = (value) => {
      if (this.progressContainer) {
        this.progressContainer.value = value;
      }
    };
    log = (...infos) => {
      this.logs.unshift(...infos);
      if (this.logContainer) {
        this.logContainer.innerText = this.logs.slice(0, 10).join(`
`);
      }
    };
  }

  // site-download/sites/Ak.ts
  class Ak extends Base {
    titles = "#ul_all_chapters>li>a";
    title = "body > div.container > section > div.novel_info_main > div > h1";
    download = "body > div.container > section > div.novel_info_main > div > div:nth-child(5) > a.l_btn";
    static host = ["https://www.06ak.com/book/*"];
    static pathMatch = /\/book\/\d+$/;
    static siteName = "06Ak小说";
    getArticleContent(parser) {
      return Array.from(parser.querySelectorAll("#article>p")).map((a) => a.textContent + `
`).join("");
    }
    async pages(url) {
      let content1 = await this.getContent(url);
      let page2 = url.replace(".html", "_2.html");
      let content2 = await this.getContent(page2);
      return content1 + `
` + content2;
    }
  }

  // site-download/sites/Diyibanzhu.ts
  class Diyibanzhu extends Base {
    titles = "div.ml_content > div.zb > div.ml_list > ul > li > a";
    title = "div.introduce > h1";
    download = "div.introduce > div > p:nth-child(4) > a";
    static host = ["https://www.diyibanzhu.buzz/*/*/"];
    static pathMatch = /\/\d+\/\d+\/$/;
    static siteName = "第一版主";
    async getArticle(url) {
      return await fetch(url).then((res) => res.arrayBuffer()).then((res) => {
        return new TextDecoder("gbk").decode(res);
      });
    }
    getArticleContent(parser) {
      const c = parser.querySelector("#articlecontent")?.innerHTML.replaceAll("&nbsp;", "").replaceAll("<br>", `
`) ?? "";
      return c + `
`;
    }
  }

  // site-download/sites/Hotu.ts
  class Hotu extends Base {
    titles = "div.bookdetails-catalog-box > ul > li > a";
    title = "div.bookdetails-left-mainbox > div:nth-child(1) > div > div > h1";
    download = "p.bookdetalis-bookinfo-bookbtnbox.suofang > a";
    static host = ["https://www.hotupub.net/book/*/"];
    static pathMatch = /\/book\/\d+\/$/;
    static siteName = "河图小说";
    getArticleContent(parser) {
      const c = parser.querySelector("div.bookread-content-box")?.innerHTML.replaceAll("<br>", `
`) ?? "";
      return c;
    }
  }

  // site-download/sites/Lang.ts
  class Lang extends Base {
    titles = "body > div.container > div.row.row-section > div > div:nth-child(4) > ul > li > a";
    title = "div.row.row-detail > div > h2 > font";
    download = "body > div.container > div.row.row-detail > div > div > div.info > div.top > div > p.opt > a.xs-show.btn-read";
    static host = ["https://www.langrenxiaoshuo.com/html/*/"];
    static pathMatch = /\/html\/\w+\/$/;
    static siteName = "狼人小说";
    filters = [".content font", ".content .chapterPages"];
    async pages(url) {
      let html = await this.getArticle(url);
      let parser = new DOMParser;
      let p = parser.parseFromString(html, "text/html");
      let subPageUrls = Array.from(p.querySelectorAll(".chapterPages a")).map((a) => a.href);
      this.filter(p);
      let content = [await this.getArticleContent(p)];
      for (let url2 of subPageUrls) {
        content.push(await this.getContent(url2));
        console.log("已处理" + url2);
      }
      return Array.isArray(content) ? content.join(`
`) : content;
    }
    async getArticle(url) {
      return await fetch(url).then((res) => res.arrayBuffer()).then((res) => {
        return new TextDecoder("gbk").decode(res);
      });
    }
    getArticleContent(parser) {
      return parser.querySelector("#content > div")?.textContent ?? "" + `
`;
    }
  }

  // site-download/sites/Tianya.ts
  class Tianya extends Base {
    titles = ".book dl a";
    title = ".book > h1";
    download = "#main > div.book > h2 > a";
    contentSelector = "#main > p:nth-child(4)";
    charset = "gbk";
    static host = ["https://www.tianyabooks.com/*/*/"];
    static pathMatch = /\/\w+\/.+\//;
    static siteName = "天涯书库";
  }

  // site-download/sites/TianyaWx.ts
  class TianyaWx extends Tianya {
    contentSelector = "td p";
    static host = ["https://wx.tianyabooks.com/book/*/"];
    static pathMatch = /\/book\/\w+\//;
    static siteName = "天涯书库-武侠小说";
  }

  // site-download/sites/Wfxs.ts
  class Wfxs extends Base {
    titles = "#html_box > li > a";
    title = "body > div.h_header.d_header > h2";
    download = "#shoucang";
    sleepTime = 300;
    static host = ["https://m.wfxs.tw/booklist/*"];
    static pathMatch = /\/booklist\/\d+\.html/;
    static siteName = "微风小说";
    getArticleContent(parser) {
      const contents = Array.from(parser.querySelectorAll("#read_conent_box>p") ?? []).map((v) => v.textContent);
      return contents.join(`
`);
    }
    async getContent(url) {
      let content = await this.getArticle(url);
      let parser = new DOMParser;
      let p = parser.parseFromString(content, "text/html");
      const content1 = [this.getArticleContent(p)];
      const next = p?.querySelector("body > article > div.page > div > ul > li:nth-child(3) > a");
      if (next?.textContent === "下一頁") {
        content1.push(await this.getContent(next.href));
      }
      return content1.join(`
`);
    }
    async getTitles() {
      this.log("in getTitles function");
      let parseTitle = (content) => {
        let parser = new DOMParser;
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
  }

  // site-download/sites/Xhszw.ts
  class Xhszw extends Base {
    titles = "#list-chapterAll > dd > a";
    title = "div.bookinfo > h1";
    download = "div.bookinfo > div > a:nth-child(1)";
    sleepTime = 500;
    static host = ["https://www.xhszw.com/book/*/", "https://xhszw.com/book/*/"];
    static pathMatch = /\/book\/\d+\/$/;
    static siteName = "xhszw";
    async getContent(url) {
      const [, articleid, chapterid] = /.+\/(\d+)\/(\d+).html/.exec(url) ?? [];
      const api = "/api/reader_js.php";
      return await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `articleid=${articleid}&chapterid=${chapterid}&pid=1`
      }).then((res) => res.text()).then((res) => {
        return res.replaceAll(/<\/?p>/g, `
`);
      });
    }
    async getTitles() {
      this.log("in getTitles function");
      let parseTitle = (content) => {
        let parser = new DOMParser;
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
  }

  // site-download/sites/Diyibanzhume.ts
  class DiyibanzhuMe extends Base {
    static pathmatch = /\/wap.php*/;
    static siteName = "第一版主ME";
    static host = ["https://m.diyibanzhu.me/wap.php"];
    tocPageSelector = 'select[name="pagelist"] option';
    titles = ".container div:nth-of-type(7) .list a";
    title = ".container .right h1";
    contentSelector = ".page-content #nr1";
    filters = [".chapterPages", "font"];
    contentNextPage = ".chapterPages span + a";
    matchReg = "/wap.php";
    sleepTime = 500;
    taskMax = 2;
    async getTitles(url = "") {
      const titleSelector = this.titles;
      const titlesFromDocument = (dm) => {
        console.log("in titlesFromDocument", "selector: ", titleSelector);
        const titles2 = Array.from(dm?.querySelectorAll(titleSelector));
        return titles2.map((v) => {
          return { href: v.href, textContent: v.textContent ?? "" };
        });
      };
      if (url) {
        let domStr = await fetch(url).then((res) => res.text());
        let dm = new DOMParser().parseFromString(domStr, "text/html");
        return titlesFromDocument(dm);
      }
      let pages = document.querySelectorAll(this.tocPageSelector);
      if (!pages || pages.length === 0) {
        return titlesFromDocument(document);
      }
      let links = Array.from(pages)?.map((v) => v.value);
      let titles = [];
      for (let link of links) {
        let result = await this.getTitles(link) ?? [];
        titles = titles.concat(result);
      }
      return titles;
    }
    async getContent(url) {
      if (!url) {
        return "";
      }
      let content = await this.getArticle(url);
      let parser = new DOMParser;
      let p = parser.parseFromString(content, "text/html");
      let nextPage = p.querySelector(this.contentNextPage)?.href ?? "";
      this.filter(p);
      let curContent = await this.getArticleContent(p);
      if (nextPage) {
        let nextContent = await this.getContent(nextPage);
        curContent += `
` + nextContent;
      }
      return curContent;
    }
  }

  // site-download/sites/index.ts
  var sites = [
    Lang,
    Ak,
    Diyibanzhu,
    Hotu,
    Xhszw,
    Wfxs,
    Tianya,
    TianyaWx,
    DiyibanzhuMe
  ];

  // site-download/main.ts
  var { host, pathname } = location;
  sites.some((v) => {
    const hosts = v.host.map((h) => new URL(h).host);
    if (hosts.includes(host) && pathname.match(v.pathMatch)) {
      new v;
      return true;
    }
  });
})();

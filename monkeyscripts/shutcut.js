// ==UserScript==
// @name         快捷键
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  网站快捷键绑定
// @author       bingxl
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/shutcut.js
// @downloadURL  https://raw.githubusercontent.com/bingxl/tampermonkey/main/monkeyscripts/shutcut.js
// ==/UserScript==

(() => {

    // 绑定快捷键的网站
    // key： 网站域名，使用btoa 编码，还原时使用atob
    const sites = {
        // btoa(location.host)
        // 嗨皮漫画
        "aGloaW1hbmdhLmNvbQ==": {
            // keyboardEvent.key: selector or [selector] eg: ".root > a" or [".root > a", ".root > .b"]
            "ArrowRight": "footer article div:nth-child(2) a:nth-child(2)",
            "ArrowLeft": "footer article div:nth-child(2) a:nth-child(1)",
            init() {
                document.querySelector('.MuiContainer-root').style.marginLeft = '10px'
            },
        },
        // manga copy
        "bWFuZ2Fjb3B5LmNvbQ==": {
            "ArrowRight": "div.footer > div.comicContent-next > a",
            "ArrowLeft": "div.footer > div:nth-child(2) > a",
        },

        // jin man
        "MThjb21pYy52aXA=": {
            "ArrowRight": "ul.menu-bolock-ul > li:nth-child(8) > a",
            "ArrowLeft": "ul.menu-bolock-ul > li:nth-child(9) > a",
        },

        // rou man 5
        "cm91bWFuNS5jb20=": {
            "ArrowRight": ".my-2 div a:last-child",
            "ArrowLeft": ".my-2 div a:first-child",
        },

    }

    function click(target) {
        console.log("click 函数", target)
        document.querySelector(target)?.click()
    }

    const hostASCII = btoa(location.host);

    if (hostASCII in sites) {
        console.log("匹配网站")
        const site = sites[hostASCII];

        document.addEventListener("keydown", (e) => {
            console.log("keydown 事件", e.key)
            if (!(e.key in site)) {
                return;
            }

            if (Array.isArray(site[e.key])) {
                site[e.key].forEach(t => click(t));
                return
            }

            click(site[e.key])
        });
        site?.init?.();
    }
})()

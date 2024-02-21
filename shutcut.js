// ==UserScript==
// @name         快捷键
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  网站快捷键绑定
// @author       bingxl
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=06ak.com
// @grant        none
// ==/UserScript==

(() => {

    // 绑定快捷键的网站
    const sites = {
        // location.host
        "m.happymh.com": {
            // keyboardEvent.key: selector or [selector] eg: ".root > a" or [".root > a", ".root > .b"]
            "ArrowRight": ".jss85 > a",
            "ArrowLeft": ".jss86 > a"
        },
    }

    function click(target) {
        console.log("click 函数", target)
        document.querySelector(target)?.click()
    }

    if (location.host in sites) {
        console.log("匹配网站")
        const site = sites[location.host];

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
        })
    }
})()
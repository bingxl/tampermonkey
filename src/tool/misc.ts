/**
 * 将字符串下载为文件
 * @param {string} text 文件内容
 * @param {string} filename 文件名
 */
export function downloadTextAsFile(text: string, filename: string) {
    // 创建一个 Blob 实例
    const blob = new Blob([text], { type: "text/plain;charset=utf-8", endings: "native" });

    // 创建一个 a 标签并设置属性
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    // 将 a 标签添加到文档中并模拟点击事件来开始下载
    document.body.appendChild(a);
    a.click();

    // 下载完成后移除 a 标签
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
    }, 0);
}




/** 
 * --------------------log end
 */


/**
 * 程序空转一定时间, 不精确
 * @param {number} d 空转时间, 单位 ms
 */
export function sleep(d: number) {
    let now = Date.now();
    while (Date.now() - now <= d);
}

export interface ChapterInter { href: string, textContent: string }

/**
 * GBK buffer 转utf8字符串
 * @param {ArrayBuffer} buffer 经过GBK编码的 arrayBuffer
 * @returns 转为utf8编码的字符串
 */
export function gbk2Utf8(buffer: ArrayBuffer) {
    const decode = new TextDecoder('gbk');
    return decode.decode(buffer);
}
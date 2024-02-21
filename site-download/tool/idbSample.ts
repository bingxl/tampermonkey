/**
 * 简单的 indexedDB key-value 存储
 */

export class IDB {
    dbName: string;
    storeName: string;
    version = 1;
    db!: IDBDatabase;
    constructor({ dbName = "IDBSample", storeName = "IDBSampleStore", version = 1 } = {}) {
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
            })
        }
    }

    /**存放值 */
    async setItem(key: string, value: any) {
        if (!this.db) { await this.init() };

        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readwrite")
                .objectStore(this.storeName)
                .add(value, key);
            request.onerror = (err) => {
                console.error(err);
                reject(err);
            };
            request.onsuccess = () => {
                resolve("");
            };
        })
    }

    /**获取值 */
    async getItem(key: string) {
        if (!this.db) { await this.init() };
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readonly")
                .objectStore(this.storeName)
                .get(key);
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
    async removeItem(key: string) {
        if (!this.db) { await this.init() };
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], "readwrite")
                .objectStore(this.storeName)
                .delete(key);
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
}
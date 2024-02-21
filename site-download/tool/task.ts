/**简单的任务队列 */

import { sleep } from "./misc";

interface ITask {
    name?: string;
    /**任务执行函数 */
    run: Function;
    /**当前任务执行出错的次数 */
    errorTimes?: number;
    /**任务状态 */
    status?: "ready" | "running" | "error" | "complete";
    /**传递给 run 的参数 */
    props?: any[];
    onSuccess?: Function;
    onError?: Function;
}

class Task {
    tasks = new Map<Symbol, ITask>();
    taskKeys: Symbol[] = [];
    sleepTime = 0;
    errorTimes = 0;
    /**当前队列是否空闲 */
    isFree = true;
    /**是否为同步队列 */
    isSync: boolean;
    // 正在执行的任务数量
    runningTaskNumber = 0;

    /**
     * 
     * @param isSync 是否为同步队列, 同步队列需要等
     * @param sleepTime 
     * @param errorTimes 
     */
    constructor(isSync = true, sleepTime = 0, errorTimes = 0) {
        this.sleepTime = sleepTime;
        this.errorTimes = errorTimes;
        this.isSync = isSync;
    }

    /**判断队列是否已空 */
    isEmpty() {
        return this.runningTaskNumber === 0 && this.taskKeys.length === 0
    }

    /**
     * 
     * @param run 即将执行的函数
     * @param props 传递到函数的参数
     */
    add(task: ITask) {
        const key = Symbol();
        if (task.errorTimes) {
            task.errorTimes = 0;
        }
        task.status = "ready";
        this.tasks.set(key, task);
        this.taskKeys.push(key);
        if (this.isFree) {
            this.isFree = false;
            // 当前队列空闲则启动队列
            this.start();
        }
    }

    pickTask() {
        const key = this.taskKeys.shift();
        const hasNext = this.taskKeys.length > 0;
        let task: ITask | undefined;
        if (key && this.tasks.has(key)) {
            task = this.tasks.get(key);
            this.tasks.delete(key);

        }
        return { hasNext, task };
    }

    async start() {
        this.isFree = false;
        const { task, hasNext } = this.pickTask();
        if (task) {
            task.status = "running";
            this.runningTaskNumber++;
            const result = task.run(...(task.props || [])).then((res: any) => {
                // 任务完成, 回调onSuccess
                task.status = "complete";
                if (task.onSuccess) {
                    try {
                        task.onSuccess(res);
                    } catch (e) {
                        // 
                    }

                }
            }).catch((err: any) => {
                task.status = "error";
                task.errorTimes = (this.errorTimes ?? 0) + 1;

                /** 任务失败, 回调 onError, 如果设置了失败重执行则在此入队 */
                if (task.onError) {
                    try {
                        task.onError(err);
                    } catch (e) {
                        // 
                    };
                    if (this.errorTimes > task.errorTimes) {
                        this.add(task);
                    }
                }
            }).final(() => {
                this.runningTaskNumber--;
            });

            // 同步队列则等待执行完成
            if (this.isSync) {
                await result;
            }
        }

        if (!hasNext) {
            // 队列已空
            this.isFree = true;
            return;
        }
        if (this.sleepTime) {
            await sleep(this.sleepTime);
        }
        this.start();
    }
}
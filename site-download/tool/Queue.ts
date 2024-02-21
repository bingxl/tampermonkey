
class QueueType<T> {
    prev: QueueType<T> | undefined;
    next: QueueType<T> | undefined;
    value: T | undefined;

    constructor(
        value: T,
        prev?: QueueType<T>,
        next?: QueueType<T>,
    ) {
        this.prev = prev;
        this.next = next;
        this.value = value;
    }
}

/**双向队列 */
export class Queue<T>{
    /**队头 */
    head: QueueType<T> | undefined;
    /**队尾 */
    footer: QueueType<T> | undefined;
    /**队列长度 */
    #counter = 0;

    constructor(...items: T[]) {
        for (let item of items) {
            this.enqueue(item)
        }
    }

    /**入队 */
    enqueue = (element: T) => {
        const e = new QueueType<T>(element)
        this.#counter++;
        if (!this.head) {
            this.head = e;
            this.footer = e;
            return;
        }
        e.prev = this.footer;

        if (this.footer) {
            this.footer.next = e;
        }

    }

    /**出队 */
    dequeue = () => {
        if (this.footer) {
            const e = this.footer;
            this.footer = e.prev;
            this.#counter--;
            return e.value;
        }
    }

    /**队列是否为空 */
    isEmpty = () => {
        return !this.head;
    }
    /**队列长度 */
    size = () => {
        return this.#counter;
    }
    /**清空队列 */
    clear = () => {
        this.head = undefined;
        this.footer = undefined;
        this.#counter = 0;
    }
}

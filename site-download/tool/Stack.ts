

export class Stack<T> {
    #items: T[] = [];

    /**入栈 */
    push = (...element: T[]) => {
        this.#items.push(...element);
    }

    /**出栈: 返回栈顶元素并出栈 */
    pop = () => {
        return this.#items.pop();
    }

    /**仅返回栈顶元素 */
    peek = () => {
        return this.#items.at(-1)
    }

    /**清空栈 */
    clear = () => {
        this.#items = []
    }

    /**栈元素个数 */
    size = () => {
        return this.#items.length
    }

    /**栈是否为空 */
    isEmpty = () => {
        return this.#items.length === 0;
    }

}
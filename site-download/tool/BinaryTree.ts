
class TreeNode<T>{
    data: T;
    lChild: TreeNode<T> | null;
    rChild: TreeNode<T> | null;

    constructor(data: T, lChild: TreeNode<T> | null = null, rChild: TreeNode<T> | null = null) {
        this.data = data;
        this.lChild = lChild;
        this.rChild = rChild;
    }
}


class BinaryTree<T>{
    root: TreeNode<T> | null = null;
    constructor(rootV: T | null = null) {
        if (rootV) {
            this.root = new TreeNode<T>(rootV)
        }

    }

    insertLeft(value: T, parent?: TreeNode<T>) {
        if (parent == null) { return false }
        const newNode = new TreeNode<T>(value);
        if (parent.lChild !== null) {
            newNode.lChild = parent.lChild;
        }
        parent.lChild = newNode;
        return true;
    }

    insertRight(value: T, parent?: TreeNode<T>) {
        if (parent == null) { return false }
        const newNode = new TreeNode<T>(value);
        if (parent.rChild !== null) {
            newNode.rChild = parent.rChild;
        }
        parent.rChild = newNode;
        return true;
    }

    deleteLeft(parent?: TreeNode<T>) {
        if (!parent) return false;

        parent.lChild = null;
        return true;
    }
    deleteRight(parent?: TreeNode<T>) {
        if (!parent) return false;

        parent.rChild = null;
        return true;
    }
}
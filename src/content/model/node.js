import EventEimtter from "events";
import { idea } from "./idea";
import { VM } from "./vm";

export const getParentChain = (node) => {
  const chain = [];
  let pointer = node;
  while (pointer && !pointer.isRoot) {
    chain.unshift(pointer);
    pointer = pointer.parent;
  }
  return chain;
};

export class Node {
  #_emitter = new EventEimtter();

  vm = new VM(this);

  depth = 0;

  constructor(value, parent, isRoot = false) {
    this.id = Math.random().toString(12).slice(2);
    this.value = value;
    this.parent = parent;
    this.children = undefined;
    this.isRoot = isRoot;
    this.depth = this.parent ? this.parent.depth + 1 : 0;
  }

  path() {
    let _path = [];
    let _node = this;
    while (_node.parent) {
      _path.unshift(_node);
      _node = _node.parent;
    }
    return _path;
  }

  root() {
    let _node = this;
    while (_node.parent) {
      _node = _node.parent;
    }
    return _node;
  }

  export() {
    return {
      value: this.value,
      children: (this.children || []).map((child) => child.export()),
    };
  }

  addChild(child) {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  }

  removeChild(child) {
    const index = this.children.findIndex((node) => node === child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  raise(node) {
    if (node) {
    } else {
      this.parent.removeChild(this);
      this.parent.parent.children.push(this);
    }
  }

  /**
   * 按照前序遍历的顺序返回下一个节点，额外传入一个判断该节点是否准确的条件函数
   */
  inOrderNext(conditionFn = () => true) {
    const index = idea.flatNodes.findIndex((node) => node === this);
    if (index > -1) {
      const findNode = (index) => {
        if (conditionFn(idea.flatNodes[index])) {
          return idea.flatNodes[index];
        } else {
          if (index + 1 >= idea.flatNodes.length) return;
          return findNode(index + 1);
        }
      };
      if (index + 1 >= idea.flatNodes.length) return;
      return findNode(index + 1);
    }
  }

  inOrderPrev(conditionFn = () => true) {
    const index = idea.flatNodes.findIndex((node) => node === this);
    if (index > -1) {
      const findNode = (index) => {
        if (conditionFn(idea.flatNodes[index % idea.flatNodes.length])) {
          return idea.flatNodes[index];
        } else {
          if (index - 1 < 0) return;
          return findNode(index - 1);
        }
      };
      if (index - 1 < 0) return;
      return findNode(index - 1);
    }
  }

  onChange(fn) {
    this.#_emitter.on("change", fn);
    return () => {
      this.#_emitter.off("change", fn);
    };
  }

  onChildrenAdd(fn) {
    this.#_emitter.on("add", fn);
    return () => {
      this.#_emitter.off("change", fn);
    };
  }
}

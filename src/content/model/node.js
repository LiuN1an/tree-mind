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
    child.vm.remove();
    const index = this.children.findIndex((node) => node === child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    idea.remove(child);
    this.#_emitter.emit("remove", this.children);
  }

  remove() {
    this.parent.removeChild(this);
  }

  onChange(fn) {
    this.#_emitter.on("change", fn);
    return () => {
      this.#_emitter.off("change", fn);
    };
  }

  onChildrenRemove(fn) {
    this.#_emitter.on("remove", fn);
    return () => {
      this.#_emitter.off("remove", fn);
    };
  }

  onChildrenAdd(fn) {
    this.#_emitter.on("add", fn);
    return () => {
      this.#_emitter.off("add", fn);
    };
  }
}

import EventEimtter from "events";
import {
  getStorage,
  setStorage,
  setStorageDemo,
  getStorageDemo,
} from "@/utils";
import { DATA_KEY } from "./constant";
import { Node } from "./node";
import { storeMock } from "../mock";

export const loop = (item, path, flat) => {
  if (!item) return;
  const parent = path[path.length - 1];
  if (Array.isArray(item)) {
    for (const child of item) {
      const node = new Node(child.value, parent);
      parent && parent.addChild(node);
      flat.push(node);
      loop(child.children, [...path, node], flat);
    }
  }
};

export class Idea {
  records = [];

  flatNodes = [];

  #_emitter = new EventEimtter();

  selected = [];

  root = null;

  async init() {
    // await storeMock();
    const data =
      process.env.MODE === "development"
        ? await getStorageDemo(DATA_KEY)
        : JSON.parse(await getStorage(DATA_KEY));
    console.log({ data });
    this.records = data.children || [];
    const root = new Node(null, null, true);
    loop(this.records, [root], this.flatNodes);
    this.root = root;
    this.#_emitter.emit("init", { rootNode: root, data: this.records });
  }

  flat(node) {
    const flatNodes = [];
    const dsl = (_n) => {
      flatNodes.push(_n);
      if (_n.children) {
        _n.children.forEach((child) => {
          child && dsl(child);
        });
      }
    };
    dsl(node);
    return flatNodes;
  }

  remove(node) {
    const newFlat = this.flat(node);
    this.flatNodes = this.flatNodes.filter(
      (child) => !newFlat.includes(child)
    );
  }

  fresh() {
    this.root = null;
    this.records = [];
    this.flatNodes = [];
    this.selected = [];
  }

  pushSelected(node) {
    this.selected.push(node);
    this.#_emitter.emit("select-change", {
      added: node,
      selected: this.selected,
    });
  }

  removeSelected(index) {
    const node = this.selected.splice(index, 1);
    this.#_emitter.emit("select-change", {
      index,
      removed: node,
      selected: this.selected,
    });
  }

  add(search, contextNode) {
    const node = new Node(search, contextNode);
    const findLast = (_n) => {
      if (!_n.children || _n.children.length === 0) return _n;
      return findLast(_n.children[_n.children.length - 1]);
    };
    const last = findLast(contextNode);
    contextNode.addChild(node);
    const index = this.index(last.id);
    if (index !== -1) {
      this.flatNodes.splice(index + 1, 0, node);
    }
    this.#_emitter.emit("change");
  }

  index(id) {
    return this.flatNodes.findIndex((node) => node.id === id);
  }

  onChange(fn) {
    this.#_emitter.on("change", fn);
    return () => {
      this.#_emitter.off("change", fn);
    };
  }

  onInit(fn) {
    this.#_emitter.on("init", fn);
    return () => {
      this.#_emitter.off("init", fn);
    };
  }

  onSelectChange(fn) {
    this.#_emitter.on("select-change", fn);
    return () => {
      this.#_emitter.off("select-change", fn);
    };
  }

  forEach(fn) {
    for (const [index, node] of this.flatNodes.entries()) {
      fn(node, index, this.flatNodes);
    }
  }

  async save() {
    const data = this.root.export();
    process.env.MODE === "development"
      ? setStorageDemo(DATA_KEY, JSON.stringify(data))
      : setStorage({ [DATA_KEY]: JSON.stringify(data) });
  }

  /**
   * 按照前序遍历的顺序返回下一个节点，额外传入一个判断该节点是否准确的条件函数
   */
  inOrderNext(_node, conditionFn = () => true) {
    const index = this.flatNodes.findIndex((node) => node === _node);
    if (index > -1) {
      const findNode = (index) => {
        if (conditionFn(this.flatNodes[index])) {
          return this.flatNodes[index];
        } else {
          if (index + 1 >= this.flatNodes.length) return;
          return findNode(index + 1);
        }
      };
      if (index + 1 >= this.flatNodes.length) return;
      return findNode(index + 1);
    }
  }

  inOrderPrev(_node, conditionFn = () => true) {
    const index = this.flatNodes.findIndex((node) => node === _node);
    if (index > -1) {
      const findNode = (index) => {
        if (conditionFn(this.flatNodes[index % this.flatNodes.length])) {
          return this.flatNodes[index];
        } else {
          if (index - 1 < 0) return;
          return findNode(index - 1);
        }
      };
      if (index - 1 < 0) return;
      return findNode(index - 1);
    }
  }
}

export const idea = new Idea();

window.idea = idea;

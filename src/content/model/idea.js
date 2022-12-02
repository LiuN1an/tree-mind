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

  constructor() {}

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
    console.log(newFlat);
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
    contextNode.addChild(new Node(search, contextNode));
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
}

export const idea = new Idea();

window.idea = idea;

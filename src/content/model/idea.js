import EventEimtter from "events";
import { getStorage, getStorageDemo } from "@/utils";
import { DATA_KEY } from "./constant";
import { Node } from "./node";

export const loop = (item, path, flat) => {
  if (!item) return;
  const parent = path[path.length - 1];
  if (Array.isArray(item)) {
    for (const child of item) {
      const node = new Node(child.value, parent, false);
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

  constructor() {}

  async init() {
    const data =
      process.env.MODE === "development"
        ? await getStorageDemo(DATA_KEY)
        : await getStorage(DATA_KEY);
    if (data) {
      console.log({ data });
      this.records = data;
      const root = new Node(null, null, true);
      loop(data, [root], this.flatNodes);
      this.#_emitter.emit("init", { rootNode: root, data });
    }
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
}

export const idea = new Idea();

window.idea = idea;

import EventEimtter from "events";
import { idea } from "./idea";

export class VM {
  #_emitter = new EventEimtter();

  #select = false;

  #childSelect = false;

  containRef = null;

  valueRef = null;

  isMoving = false;

  #collapse = false;

  constructor(model) {
    this.model = model;
  }

  addContainRef(dom) {
    this.containRef = dom;
  }

  addValueRef(dom) {
    this.valueRef = dom;
    this.#_emitter.emit("value-ref", dom);
    this.model.root().checkIsFirstChild(this.model);
  }

  onChildMount(fn) {
    this.#_emitter.on("value-ref", fn);
    return () => {
      this.#_emitter.off("value-ref", fn);
    };
  }

  select(props) {
    if (this.model.isRoot) return;
    props &&
      props.exclusive &&
      idea.flatNodes.forEach((node) => node.vm.unselect());
    if (!idea.selected.find((node) => node === this.model)) {
      idea.pushSelected(this.model);
    }
    this.#select = true;
    this.model.parent.vm.childSelect(props);
    this.#_emitter.emit("select", true);
  }

  unselect() {
    const index = idea.selected.findIndex((node) => node === this.model);
    if (index > -1) {
      idea.removeSelected(index);
    }
    this.#select = false;
    this.#_emitter.emit("select", false);
  }

  childSelect(props) {
    props &&
      props.exclusive &&
      idea.flatNodes.forEach((node) => node.vm.unChildSelect());
    if (this.model.isRoot) return;
    this.#childSelect = true;
    this.#_emitter.emit("child-select", true);
  }

  unChildSelect() {
    this.#childSelect = false;
    this.#_emitter.emit("child-select", false);
  }

  isCollapse() {
    return this.#collapse;
  }

  isBeCollapsed() {
    if (this.model) {
      let pointer = this.model;
      while (pointer.parent && pointer.parent.vm) {
        if (pointer.parent.vm.isCollapse()) {
          return true;
        }
        pointer = pointer.parent;
      }
      return false;
    }
  }

  remove() {
    this.#_emitter.emit("remove");
  }

  collapse() {
    this.#collapse = true;
    this.#_emitter.emit("collapse", { status: true });
  }

  uncollapse() {
    this.#collapse = false;
    this.#_emitter.emit("collapse", { status: false });
  }

  onSelectChange(fn) {
    this.#_emitter.on("select", fn);
    return () => {
      this.#_emitter.off("select", fn);
    };
  }

  onChildSelectChange(fn) {
    this.#_emitter.on("child-select", fn);
    return () => {
      this.#_emitter.off("child-select", fn);
    };
  }

  scrollIntoView() {
    if (this.containRef) {
      this.containRef.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  onCollapseChange(fn) {
    this.#_emitter.on("collapse", fn);
    return () => {
      this.#_emitter.off("collapse", fn);
    };
  }

  onRemove(fn) {
    this.#_emitter.on("remove", fn);
    return () => {
      this.#_emitter.off("remove", fn);
    };
  }
}

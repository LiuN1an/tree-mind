import React, { useState, useRef, useEffect, useMemo } from "react";
import classnames from "classnames";
import { CELL_HEIGHT } from "./model";

const CollapseIcon = ({ className, rotate, active, onClick }) => {
  return (
    <>
      <svg
        onClick={onClick}
        className={classnames(
          className,
          rotate ? "scale-100" : "scale-0 opacity-0"
        )}
        t="1668619135617"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4183"
        width="16"
        height="16"
      >
        <path
          d="M752 240H144c-17.7 0-32 14.3-32 32v608c0 17.7 14.3 32 32 32h608c17.7 0 32-14.3 32-32V272c0-17.7-14.3-32-32-32zM596 606c0 4.4-3.6 8-8 8H308c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h280c4.4 0 8 3.6 8 8v48z m284-494H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h576v576c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V144c0-17.7-14.3-32-32-32z"
          p-id="4184"
          fill={active ? "#fff" : "#1d4ed8"}
        ></path>
      </svg>
    </>
  );
};

export const Nodes = ({ node }) => {
  const [select, setSelect] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [height, setHeight] = useState("0px");
  const [childSelect, setChildSelect] = useState(false);
  const [childs, setChilds] = useState(node.children || []);
  const containRef = useRef(null);
  const valueRef = useRef(null);
  const childsRef = useRef(null);

  useEffect(() => {
    setChilds(node.children || []);
  }, [node]);

  useEffect(() => {
    if (node && childsRef.current) {
      const dom = childsRef.current;
      const onSelect = node.vm.onSelectChange((select) => {
        setSelect(select);
      });
      const onCollapse = node.vm.onCollapseChange(({ status }) => {
        if (!node.isRoot) {
          setCollapse(status);
          if (status) {
            setHeight(`-${dom.offsetHeight}px`);
          } else {
            setHeight("0px");
          }
        }
      });
      const onChildSelect = node.vm.onChildSelectChange((status) => {
        setChildSelect(status);
      });
      const onChildsAdd = node.onChildrenAdd((childs) => {
        setChilds(childs);
      });

      return () => {
        onSelect();
        onCollapse();
        onChildSelect();
        onChildsAdd();
      };
    }
  }, [node, childsRef.current]);

  useEffect(() => {
    if (containRef.current && node) {
      node.vm.addContainRef(containRef.current);
    }
  }, [containRef.current, node]);

  useEffect(() => {
    if (valueRef.current && node) {
      node.vm.addValueRef(valueRef.current);
    }
  }, [valueRef.current, node]);

  const isLeaf = useMemo(() => {
    return !(node.children && node.children.length);
  }, [node]);

  const children = useMemo(() => {
    return childs.map((child) => {
      return (
        <div key={child.id}>
          <Nodes node={child} />
        </div>
      );
    });
  }, [childs]);

  if (!node) return null;

  return (
    <div
      className={classnames(
        "transition-all duration-300 select-none overflow-hidden",
        "rounded-xl border-2 border-transparent box-border border-dashed",
        node.isRoot ? "p-2" : "ml-2 relative",
        select && "border-slate-900",
        childSelect && "bg-slate-300"
      )}
      ref={(ele) => (containRef.current = ele)}
      onClick={(event) => {
        node.vm.select({ exclusive: true });
        event.stopPropagation();
      }}
    >
      {!collapse && !node.isRoot && !isLeaf && (
        <div
          className={classnames(
            "absolute top-8 h-[calc(100%-32px)] w-[1px] transition-opacity duration-150",
            select ? "opacity-0" : "opacity-100",
            childSelect ? "bg-white" : "bg-slate-400"
          )}
        />
      )}
      {!node.isRoot && (
        <div
          className={classnames(
            "transition-all duration-300 box-border relative",
            "p-2 cursor-pointer",
            "flex justify-start items-center gap-3",
            "bg-transparent",
            select ? "text-white font-bold" : "hover:bg-slate-100"
          )}
          style={{ height: `${CELL_HEIGHT}px` }}
          ref={(ele) => (valueRef.current = ele)}
        >
          {node.value}
          {!isLeaf && (
            <CollapseIcon
              className={classnames(
                "transition-all duration-150 z-10",
                "hover:scale-125"
              )}
              rotate={collapse}
              active={select}
              onClick={() => {
                if (!isLeaf && node.vm.isCollapse()) {
                  node.vm.uncollapse();
                }
              }}
            />
          )}
        </div>
      )}
      <div
        className={classnames("transition-all duration-100")}
        style={{ marginBottom: height }}
        ref={(ele) => (childsRef.current = ele)}
      >
        {children}
      </div>
    </div>
  );
};

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { callModal, useTailWindFade } from "../utils/index";
import classnames from "classnames";
import { idea, CELL_HEIGHT, getParentChain } from "./model";
import { Nodes } from "./node";
import { Node } from "./model/node";
import { motion } from "framer-motion";
import throttle from "lodash.throttle";
import "./index.less";

export default function App() {
  const [query] = useState("我是加进去的");

  const treeRef = useRef(null);
  const {
    open: coverOpen,
    setOpen: setCover,
    style: styleCover,
  } = useTailWindFade({
    open: process.env.NODE_ENV === "development" ? false : undefined,
  });

  const {
    open: modelOpen,
    setOpen: setModal,
    style: styleModal,
  } = useTailWindFade({
    open: process.env.NODE_ENV === "development" ? false : undefined,
  });

  const contentRef = useRef(null);
  const barRef = useRef(null);
  const [node, setNode] = useState(null);
  const [activeCoordinate, setCoordinate] = useState({});
  const [bars, setBars] = useState([]);
  const [ghost, setGhost] = useState(null);
  const [notAllowMove, setNotAllowMove] = useState(false);

  const change = useCallback(
    (status) => {
      setCover(status);
      setModal(status);
    },
    [setCover, setModal]
  );

  const [inputBtn] = useState(
    document.querySelector(
      "body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input"
    )
  );
  const [searchBtn] = useState(
    document.querySelector(
      "body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.gNO89b"
    )
  );

  useEffect(() => {
    if (barRef && barRef.current) {
      if (bars.length >= 8) {
        barRef.current.scrollTo({
          top: 0,
          left: (bars.length - 7) * 48,
          behavior: "smooth",
        });
      }
    }
  }, [barRef.current, bars]);

  //   useEffect(() => {
  //     if (process.env.NODE_ENV !== "development") {
  //       const handleKeyDown = (event) => {
  //         if (event.key == "Enter") {
  //           event.preventDefault();
  //           event.stopPropagation();
  //           if (inputBtn.value == "123") {
  //             // searchBtn.click();
  //             setCover(true);
  //             setModal(true);
  //             inputBtn.blur();
  //           } else {
  //             setCover(false);
  //             setModal(false);
  //           }
  //         }
  //         if (event.key == "Escape") {
  //           inputBtn.focus();
  //           setCover(false);
  //           setModal(false);
  //           event.preventDefault();
  //           event.stopPropagation();
  //         }
  //         if (event.keyCode === 38) {
  //         }
  //         if (event.keyCode === 40) {
  //         }
  //       };
  //       const handleKeyUp = () => {};

  //       document.addEventListener("keydown", handleKeyDown);
  //       document.addEventListener("keyup", handleKeyUp);
  //       return () => {
  //         document.removeEventListener("keydown", handleKeyDown);
  //         document.removeEventListener("keyup", handleKeyUp);
  //       };
  //     }
  //   }, [inputBtn, searchBtn]);

  useEffect(() => {
    const removeInit = idea.onInit(({ data, rootNode }) => {
      setNode(rootNode);
      rootNode.children[0].vm.onValueRef((dom) => {
        setTimeout(() => {
          const rect = dom.getBoundingClientRect();
          setCoordinate(
            {
              x: 0,
              y: 0,
              width: rect.width + 2,
            },
            100
          );
          rootNode.children[0].vm.select();
        }, 100);
      });
    });
    return () => {
      removeInit();
    };
  }, []);

  useEffect(() => {
    const handleTrigger = (evnet) => {
      const { altKey, key, ctrlKey } = event;
      if (altKey && key === "q") {
        if (!(modelOpen && coverOpen)) {
          change(true);
          idea.init();
        }
      }
    };
    document.addEventListener("keydown", handleTrigger);
    return () => {
      document.removeEventListener("keydown", handleTrigger);
    };
  }, [coverOpen, modelOpen, change]);

  useEffect(() => {
    if (node && contentRef.current && barRef.current) {
      const { height: unit, width } =
        contentRef.current.getBoundingClientRect();
      const removeSelectChange = idea.onSelectChange(
        ({ selected, added, removed, index }) => {
          if (added && added.vm && added.vm.valueRef) {
            setGhost(added);
            const rect = added.vm.valueRef.getBoundingClientRect();
            const index = idea.flatNodes
              .filter((node) => !node.vm.isBeCollapsed() || node === added)
              .findIndex((node) => node === added);
            if (index > -1) {
              const totalScrollY = CELL_HEIGHT * (index + 1) + index * 6;
              contentRef.current.scrollTo({
                top: totalScrollY - unit / 2,
                left: 0,
                behavior: "smooth",
              });
              setCoordinate({
                x:
                  (added.depth - 1) * 10 < 0
                    ? 1
                    : (added.depth - 1) * 10 + 1,
                y: CELL_HEIGHT * index + index * 4 - (added.depth - 2) * 2,
                width: rect.width + 2,
              });
            }
          }
          const parentChain = getParentChain(added);
          setBars(parentChain);
        }
      );

      let isOpenModal = false;

      const move = throttle((event) => {
        const [node] = idea.selected;

        if (event.key === "Enter") {
          if (!isOpenModal) {
            callModal({
              type: "confirm",
              onClose() {
                isOpenModal = false;
              },
              async onOk() {
                node.addChild(new Node(query, node));
                idea.save();
                change(false);
                return true;
              },
              async onCancel() {
                console.log("cancel");
              },
            });
            isOpenModal = true;
          }
        }

        // 上
        if (event.keyCode === 38) {
          const prev = node.inOrderPrev(
            (node) => !node.vm.isBeCollapsed()
          );
          if (prev && prev.vm) {
            prev.vm.select({ exclusive: true });
          }
        }
        // 下
        if (event.keyCode === 40) {
          if (idea.selected.length > 0) {
            const nxt = node.inOrderNext(
              (node) => !node.vm.isBeCollapsed()
            );
            if (nxt && nxt.vm) {
              nxt.vm.select({ exclusive: true });
            }
          }
        }
        // 左
        if (event.keyCode === 37) {
          const isLeaf = !(node.children && node.children.length);
          if (!isLeaf && !node.vm.isCollapse()) {
            node.vm.collapse();
          } else {
            if (node.parent.isRoot) {
              return;
            }
            node.parent.vm.collapse();
            node.parent.vm.select({ exclusive: true });
          }
        }
        // 右
        if (event.keyCode === 39) {
          const isLeaf = !(node.children && node.children.length);
          if (!isLeaf && node.vm.isCollapse()) {
            node.vm.uncollapse();
          }
        }
      }, 150);

      const handleMove = (event) => {
        if (coverOpen) {
          move(event);
          const { altKey, key, ctrlKey } = event;
          if (altKey && key === "q") {
            change(false);
          }
          if (ctrlKey && key === "f") {
            alert("f");
          }
          event.preventDefault();
          event.stopPropagation();
        }
      };

      document.body.addEventListener("keydown", handleMove);
      return () => {
        document.body.removeEventListener("keydown", handleMove);
        removeSelectChange && removeSelectChange();
      };
    }
  }, [
    node,
    contentRef.current,
    barRef.current,
    treeRef.current,
    query,
    change,
    coverOpen,
  ]);

  return (
    <div ref={treeRef}>
      <div
        data-x="cover"
        className={classnames(
          ...styleCover(
            "fixed top-0 left-0 right-0 bottom-0 bg-black z-[1000]",
            "pointer-events-none opacity-0",
            "opacity-60"
          )
        )}
      />
      <div
        data-x="modal"
        className={classnames(
          ...styleModal(
            "fixed top-1/3 left-1/2 w-1/3 h-1/2 -translate-x-1/2 bg-white rounded-lg z-[1000]",
            "-translate-y-1/2 opacity-0 pointer-events-none",
            "-translate-y-1/3"
          ),
          "overflow-hidden flex flex-col select-none"
        )}
      >
        <div
          className={classnames(
            "h-12 bg-white shadow-md box-border px-8",
            "flex flew-row justify-start items-center overflow-y-hidden overflow-x-auto",
            "scroll-custom-horizontal"
          )}
          data-x="bar"
          ref={barRef}
        >
          {bars.map((barNode, index) => {
            return (
              <BarNode
                node={barNode}
                key={barNode.id}
                index={index}
                isLast={index === bars.length - 1}
              />
            );
          })}
        </div>
        <div
          ref={contentRef}
          className={classnames(
            "overflow-auto p-3 flex-1 relative box-border",
            "scroll-custom"
          )}
        >
          <motion.div
            className={classnames(
              "transition-all duration-150 z-10",
              "absolute left-[30px] top-[22px]",
              "bg-blue-700 rounded-xl"
            )}
            style={{
              x: 0,
              y: 0,
              width: activeCoordinate.width || 0 + "px",
              height: `${CELL_HEIGHT}px`,
            }}
            animate={{
              x: activeCoordinate.x || 0,
              y: activeCoordinate.y || 0,
            }}
            transition={{
              type: "spring",
              duration: 0.02,
            }}
            data-x="select-container"
          >
            <div className="flex h-full text-white font-bold items-center p-2">
              {ghost ? ghost.value : ""}
            </div>
          </motion.div>
          {node && <Nodes node={node} />}
        </div>
      </div>
    </div>
  );
}

export const BarNode = ({ node, isLast }) => {
  const { style } = useTailWindFade({ open: true });

  return (
    <div
      key={node.id}
      className={classnames(
        ...style(
          "flex item-center gap-2 ml-2 text-slate-500",
          "opacity-0 -translate-x-2",
          "opacity-100"
        )
      )}
    >
      <div
        className={classnames(
          "w-12 truncate cursor-pointer hover:text-blue-800 hover:underline"
        )}
        onClick={() => {
          node.vm.select({ exclusive: true });
        }}
      >
        {node.value}
      </div>
      {!isLast && <div>{">"}</div>}
    </div>
  );
};

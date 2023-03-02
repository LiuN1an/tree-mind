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

  const {
    open: modelOpen,
    setOpen: setModal,
    style: styleModal,
  } = useTailWindFade({
    open: process.env.NODE_ENV === "development" ? false : undefined,
  });

  const {
    open: isSelectRoot,
    setOpen: setSelectRoot,
    style: styleRoot,
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
      setModal(status);
      !status && setSelectRoot(status);
    },
    [setModal, setSelectRoot]
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
    if (modelOpen) {
      const removeInit = idea.onInit(({ data, rootNode }) => {
        setNode(rootNode);
        if (rootNode.children && rootNode.children.length) {
          rootNode.children[0].vm.onChildMount((dom) => {
            setTimeout(() => {
              if (dom) {
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
              }
            }, 100);
          });
        } else {
          setSelectRoot(true);
          idea.pushSelected(rootNode);
        }
      });
      return () => {
        removeInit();
      };
    } else {
      idea.fresh();
    }
  }, [modelOpen]);

  useEffect(() => {
    const handleTrigger = (evnet) => {
      const { altKey, key, ctrlKey } = event;
      if (ctrlKey && key === "q") {
        if (!modelOpen) {
          change(true);
          idea.init();
        }
      }
    };
    document.addEventListener("keydown", handleTrigger);
    return () => {
      document.removeEventListener("keydown", handleTrigger);
    };
  }, [modelOpen, change]);

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

      let isOpenModal = [];

      const move = throttle((event) => {
        const [node] = idea.selected;

        // if (event.keyCode === 8) {
        //   if (!isOpenModal) {
        //     callModal({
        //       type: "confirm",
        //       text: "Are you to delete this idea?",
        //       onClose() {
        //         isOpenModal = false;
        //       },
        //       async onOk() {
        //         let selected;
        //         const prev = idea.inOrderPrev(
        //           node,
        //           (node) => !node.vm.isBeCollapsed()
        //         );
        //         if (prev && prev.vm) {
        //           selected = prev;
        //         } else {
        //           const nxt = idea.inOrderNext(
        //             node,
        //             (node) => !node.vm.isBeCollapsed()
        //           );
        //           if (nxt && nxt.vm) {
        //             selected = nxt;
        //           }
        //         }
        //         node.remove();
        //         if (selected) {
        //           selected.vm.select({ exclusive: true });
        //         } else {
        //           setSelectRoot(true);
        //         }
        //         idea.save();
        //         return true;
        //       },
        //       async onCancel() {
        //         console.log("cancel");
        //       },
        //     });
        //     isOpenModal = true;
        //   }
        // }

        if (event.keyCode === 13) {
          if (isOpenModal.length === 0) {
            isOpenModal.push(true);
            callModal({
              type: "search",
              async onOk(input) {
                isOpenModal.push(true);
                return await new Promise((resolve) => {
                  callModal({
                    type: "confirm",
                    async onOk() {
                      if (isSelectRoot) {
                        idea.root.addChild(new Node(input, idea.root));
                      } else {
                        node.addChild(new Node(input, node));
                      }
                      idea.save();
                      change(false);
                      resolve(true);
                      return true;
                    },
                    async onCancel() {
                      resolve(false);
                      console.log("cancel");
                    },
                    onClose() {
                      isOpenModal.pop();
                    },
                  });
                });
              },
              onClose() {
                isOpenModal.pop();
              },
            });
          }
        }

        // 上
        if (event.keyCode === 38) {
          if (isSelectRoot) return;
          const prev = idea.inOrderPrev(
            node,
            (node) => !node.vm.isBeCollapsed()
          );
          if (prev && prev.vm) {
            prev.vm.select({ exclusive: true });
          }
        }
        // 下
        if (event.keyCode === 40) {
          if (isSelectRoot) return;
          if (idea.selected.length > 0) {
            const nxt = idea.inOrderNext(
              node,
              (node) => !node.vm.isBeCollapsed()
            );
            if (nxt && nxt.vm) {
              nxt.vm.select({ exclusive: true });
            }
          }
        }
        // 左
        if (event.keyCode === 37) {
          if (isSelectRoot) return;
          const isLeaf = !(node.children && node.children.length);
          if (!isLeaf && !node.vm.isCollapse()) {
            node.vm.collapse();
          } else {
            if (node.parent.isRoot) {
              setSelectRoot(true);
              return;
            } else {
              node.parent.vm.collapse();
              node.parent.vm.select({ exclusive: true });
            }
          }
        }
        // 右
        if (event.keyCode === 39) {
          if (isSelectRoot) {
            idea.root.children &&
              idea.root.children.length &&
              setSelectRoot(false);
          } else {
            const isLeaf = !(node.children && node.children.length);
            if (!isLeaf && node.vm.isCollapse()) {
              node.vm.uncollapse();
            }
          }
        }
      }, 150);

      let searching = false;
      const handleMove = (event) => {
        if (modelOpen) {
          move(event);
          const { altKey, key, ctrlKey } = event;
          if (ctrlKey && key === "q") {
            event.preventDefault();
            event.stopPropagation();
            change(false);
          }
          //   if (ctrlKey && key === "f") {
          //     event.preventDefault();
          //     event.stopPropagation();
          //     if (!searching) {
          //       searching = true;
          //       callModal({
          //         type: "search",
          //         nodes: idea.flatNodes,
          //         async onOk(input) {
          //           console.log({ input });
          //           return true;
          //         },
          //         async onCancel() {},
          //         onClose() {
          //           searching = false;
          //         },
          //       });
          //     }
          //   }
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
    query,
    change,
    modelOpen,
    isSelectRoot,
  ]);

  return (
    <div className="less-test-container">
      <div
        data-x="cover"
        className={classnames(
          ...styleModal(
            "fixed top-0 left-0 right-0 bottom-0 bg-black z-[9999]",
            "pointer-events-none opacity-0",
            "opacity-60"
          )
        )}
        onClick={() => {
          change(false);
        }}
      />
      <div
        data-x="modal"
        className={classnames(
          ...styleModal(
            "fixed top-1/3 left-1/2 w-1/3 h-1/2 bg-white -translate-x-1/2 rounded-lg z-[9999]",
            "-translate-y-1/2 opacity-0 pointer-events-none",
            "-translate-y-1/3"
          ),
          "overflow-hidden flex flex-col select-none"
        )}
        style={{ filter: isSelectRoot ? "blur(4px)" : "blur(0)" }}
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
          date-x="select-highlight"
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
              x: activeCoordinate.x || 1,
              y: activeCoordinate.y || 2,
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
      <div
        className={classnames(
          ...styleRoot(
            "fixed top-1/3 left-1/2 w-1/3 h-1/2 bg-black -translate-x-1/2 rounded-lg z-[9999]",
            "translate-y-1/4 opacity-0 pointer-events-none",
            "-translate-y-1/3 opacity-60"
          )
        )}
      />
      <div
        className={classnames(
          ...styleRoot(
            "fixed top-1/3 left-1/2 w-1/3 h-1/2 -translate-x-1/2 -translate-y-1/3 rounded-lg z-[9999]",
            "scale-0 pointer-events-none opacity-0",
            "scale-100"
          ),
          "flex flex-col gap-2 justify-center items-center text-white"
        )}
      >
        <div className="w-1/2"> 已到达根节点，请进行以下操作</div>
        <div className="w-1/2 mt-3 flex flex-row items-center gap-2 font-bold">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              d="M417 1c-48.602 0-88 39.399-88 88v346H89c-48.6 0-88 39.399-88 88v412c0 48.6 39.4 88 88 88h314.69c4.341 0.658 8.786 1 13.31 1h517c24.555 0 46.761-10.057 62.724-26.277C1012.943 981.761 1023 959.555 1023 935V523c0-4.524-0.341-8.968-1-13.31V89c0-48.601-39.398-88-88-88H417z m250.036 645.739V389.131c0-27.134 21.977-49.131 49.087-49.131 27.11 0 49.088 21.997 49.088 49.131V745H453.699l31.657 31.657c19.174 19.173 19.167 50.263-0.012 69.441-19.178 19.179-50.268 19.185-69.441 0.013L266 696.207l149.956-149.955c19.179-19.179 50.269-19.185 69.441-0.013 19.172 19.173 19.167 50.263-0.012 69.441l-31.059 31.059h212.71z"
              p-id="2040"
              fill="#ffffff"
            ></path>
          </svg>
          <span>{" 放到该目录下"}</span>
        </div>
        <div className="w-1/2">或</div>
        <div className="w-1/2 flex flex-row items-center gap-2 font-bold">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              d="M47.104 453.632q0-43.008 20.992-57.856t66.048-14.848q20.48 0 64.512 0.512t93.696 0.512 96.768 0.512 74.752 0.512q38.912 1.024 61.44-6.656t22.528-35.328q0-20.48 1.536-48.64t1.536-48.64q1.024-35.84 20.48-45.568t49.152 14.848q30.72 24.576 71.68 58.368t84.992 69.12 86.016 69.632 74.752 59.904q29.696 24.576 30.208 46.592t-28.16 45.568q-29.696 24.576-70.144 56.32t-83.968 65.536-85.504 67.072-74.752 58.88q-35.84 28.672-58.88 21.504t-22.016-44.032l0-24.576 0-29.696q0-15.36-0.512-30.208t-0.512-27.136q0-25.6-15.36-32.256t-41.984-6.656q-29.696 0-77.824-0.512t-100.352-0.512-101.376-0.512-79.872-0.512q-13.312 0-27.648-2.56t-26.112-9.728-18.944-20.992-7.168-37.376q0-27.648-0.512-53.248t0.512-57.344z"
              p-id="4085"
              fill="#ffffff"
            ></path>
          </svg>
          <span>{" 回到下一级继续选择"}</span>
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

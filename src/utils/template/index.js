import { Confirm } from "./confirm";
import { Search } from "./search";

export * from "./confirm";
export * from "./search";

export const options = (type) => {
  switch (type) {
    case "confirm":
      return {
        width: "20vw",
        height: "20vh",
        component: Confirm,
        leaveAnimate: "scale-0 pointer-events-none opacity-0",
        enterAnimate: "scale-100",
      };
    case "search":
      return {
        width: "33vw",
        height: "50vh",
        component: Search,
        leaveAnimate: "-translate-y-1/2 opacity-0 pointer-events-none",
        enterAnimate: "-translate-y-1/3",
      };
    default:
      return {
        width: "30vw",
        height: "50vh",
        leaveAnimate: "-translate-y-1/2 opacity-0 pointer-events-none",
        enterAnimate: "-translate-y-1/3",
      };
  }
};

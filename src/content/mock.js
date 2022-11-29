import { setStorage } from "@/utils";
import { DATA_KEY } from "./model";

export const MOCK = [
  {
    value: "把脚上的哈桑",
    children: [
      {
        value: "阿塞拜疆大叔几乎大厦",
      },
    ],
  },
  {
    value: "sadasds",
    children: [{ value: "asd" }],
  },
  {
    value: "zxvcsqe",
    children: [
      {
        value: "asd",
        children: [
          {
            value: "asdzxcsdafasdf",
            children: [
              {
                value: "vwdthujhduj",
              },
            ],
          },
          {
            value: "ytujcvbsdf",
            children: [
              {
                value: "67834w",
              },
              {
                value: "vbnerg",
              },
              {
                value: "567234xcvxcv",
                children: [
                  {
                    value: "bjkajkd",
                  },
                  {
                    value: "ytujcvbsdf",
                    children: [
                      {
                        value: "67834w",
                      },
                      {
                        value: "vbnerg",
                      },
                      {
                        value: "567234xcvxcv",
                        children: [
                          {
                            value: "bjkajkd",
                          },
                          {
                            value: "ytujcvbsdf",
                            children: [
                              {
                                value: "67834w",
                              },
                              {
                                value: "vbnerg",
                              },
                              {
                                value: "567234xcvxcv",
                                children: [
                                  {
                                    value: "bjkajkd",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    value: "hfdfgfdg",
    children: [{ value: "asd" }],
  },
];

export const storeMock = async () => {
  if (process.env.MODE === "development") {
    window.localStorage.setItem(
      DATA_KEY,
      JSON.stringify({
        value: undefined,
        children: [...MOCK, ...MOCK, ...MOCK],
      })
    );
  } else {
    return await setStorage({
      [DATA_KEY]: JSON.stringify({
        value: undefined,
        children: [...MOCK, ...MOCK, ...MOCK],
      }),
    });
  }
};

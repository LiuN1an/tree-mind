## 坑一

manifest.json 的 content_scripts 中如果没有引入 react.js 就不会生效，而且调试的时候只会在扩展面板那里给你报错，很隐晦

## 坑二

由于使用的content_scripts方式 + tailwind，所以样式需要隔离，参考了下“沙拉查词”的做法，是通过shadow-root来做的
module.exports = {
  css: { // 配置 CSS 相关的 loader
    loaderOptions: { // loader 选项
      sass: { // 配置 Sass 的选项
        data: `@import "@/styles/main.scss";` 
        // @import 为引入
        // @/styles/main.scss 引入的路径，即要处理的文件
      }
    }
  }
};

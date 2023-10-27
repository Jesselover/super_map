const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, //关闭eslint检查
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/styles/main.scss";`,
      },
    },
  },
});

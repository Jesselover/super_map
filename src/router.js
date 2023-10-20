import Vue from 'vue'
//引入VueRouter
import VueRouter from "vue-router";
Vue.use(VueRouter);
//引入路由 组件
import LeafletMap from "./view/LeafletMap.vue";
import SuperMap from "./view/SuperMap/index.vue"
//创建router实例对象，去管理一组一组的路由规则
const router = new VueRouter({
  routes: [
    {
      path: "/LeafletMap",
      component: LeafletMap,
    },
    {
      path:"/SuperMap",
      component:SuperMap,
    }
  ],
});

//暴露router
export default router;

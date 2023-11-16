import Vue from 'vue'
//引入VueRouter
import VueRouter from "vue-router";
Vue.use(VueRouter);
//引入路由 组件
import LeafletMap from "./view/Map/LeafletMap/index.vue";
import SuperMap from "./view/Map/SuperMap/index.vue";
import HistoricalTrack from"./view/Map/historicalTrack/index.vue"
//创建router实例对象，去管理一组一组的路由规则
const router = new VueRouter({
  mode: "history",
  routes: [
    // {
    //   path:"/",
    //   component:SuperMap,
    // },
    {
      path: "/",
      component: HistoricalTrack,
    },
  ],
});

//暴露router
export default router;

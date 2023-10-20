import Vue from 'vue'
import App from './App.vue'
import utils from './utils'
import router from './router'
Vue.prototype.$utils = utils;

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

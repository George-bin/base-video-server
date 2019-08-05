import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
/* eslint-disable */
import $ from 'jquery'
import '../../static/reset.css'
// import '../../static/strophe/strophe.js'
// import '../../static/strophe/strophe.disco.min.js?v=1'
// import '../../static/lib-jitsi-meet.min'
// import '../../static/lib-jitsi-meet'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

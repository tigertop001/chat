import Vue from 'vue'
import Router from 'vue-router'
import imServer from '@/views/imServer/imServer'
import imClient from '@/views/imClient/imClient'

Vue.use(Router)

export default new Router({
    routes: [
        { path: '/', redirect: 'imClient' },
        { path: '/imServer', name: 'imServer', component: imServer },
        { path: '/imClient', name: 'imClient', component: imClient },
    ]
})
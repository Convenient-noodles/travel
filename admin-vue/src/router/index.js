import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '管理员登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    meta: { title: '控制台', requiresAuth: true, hidden: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制台', icon: 'Odometer' }
      },
      {
        path: 'scenic',
        name: 'Scenic',
        component: () => import('@/views/scenic/index.vue'),
        meta: { title: '景点管理', icon: 'Location' }
      },
      {
        path: 'scenic/edit/:id?',
        name: 'ScenicEdit',
        component: () => import('@/views/scenic/edit.vue'),
        meta: { title: '景点编辑', hidden: true }
      },
      {
        path: 'food',
        name: 'Food',
        component: () => import('@/views/food/index.vue'),
        meta: { title: '美食管理', icon: 'Food' }
      },
      {
        path: 'food/edit/:id?',
        name: 'FoodEdit',
        component: () => import('@/views/food/edit.vue'),
        meta: { title: '美食编辑', hidden: true }
      },
      {
        path: 'hotel',
        name: 'Hotel',
        component: () => import('@/views/hotel/index.vue'),
        meta: { title: '酒店管理', icon: 'House' }
      },
      {
        path: 'hotel/edit/:id?',
        name: 'HotelEdit',
        component: () => import('@/views/hotel/edit.vue'),
        meta: { title: '酒店编辑', hidden: true }
      },
      {
        path: 'culture',
        name: 'Culture',
        component: () => import('@/views/culture/index.vue'),
        meta: { title: '文化体验', icon: 'Goblet' }
      },
      {
        path: 'culture/edit/:id?',
        name: 'CultureEdit',
        component: () => import('@/views/culture/edit.vue'),
        meta: { title: '文化体验编辑', hidden: true }
      },
      {
        path: 'red-tourism',
        name: 'RedTourism',
        component: () => import('@/views/red-tourism/index.vue'),
        meta: { title: '红色旅游', icon: 'Medal' }
      },
      {
        path: 'red-tourism/edit/:id?',
        name: 'RedTourismEdit',
        component: () => import('@/views/red-tourism/edit.vue'),
        meta: { title: '红色旅游编辑', hidden: true }
      },
      {
        path: 'route',
        name: 'Route',
        component: () => import('@/views/route/index.vue'),
        meta: { title: '旅游路线', icon: 'Guide' }
      },
      {
        path: 'route/edit/:id?',
        name: 'RouteEdit',
        component: () => import('@/views/route/edit.vue'),
        meta: { title: '路线编辑', hidden: true }
      },
      {
        path: 'banner',
        name: 'Banner',
        component: () => import('@/views/banner/index.vue'),
        meta: { title: '轮播图管理', icon: 'PictureFilled' }
      },
      {
        path: 'banner/edit/:id?',
        name: 'BannerEdit',
        component: () => import('@/views/banner/edit.vue'),
        meta: { title: '轮播图编辑', hidden: true }
      },
      {
        path: 'region',
        name: 'Region',
        component: () => import('@/views/region/index.vue'),
        meta: { title: '地区管理', icon: 'MapLocation' }
      },
      {
        path: 'admin-user',
        name: 'AdminUser',
        component: () => import('@/views/admin-user/index.vue'),
        meta: { title: '管理员', icon: 'User', roles: ['super_admin'] }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'Tickets' }
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('@/views/booking/index.vue'),
        meta: { title: '预约管理', icon: 'Calendar' }
      },
      {
        path: 'payment-config',
        name: 'PaymentConfig',
        component: () => import('@/views/hotel/payment-config.vue'),
        meta: { title: '支付配置', icon: 'CreditCard' }
      },
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/config/index.vue'),
        meta: { title: '系统配置', icon: 'Setting' }
      },
      {
        path: 'strategy',
        name: 'Strategy',
        component: () => import('@/views/strategy/index.vue'),
        meta: { title: '攻略管理', icon: 'Document' }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = to.meta.title ? `${to.meta.title} - 带你黔游` : '带你黔游 - 后台管理系统'

  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
  } else {
    // 检查角色权限
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userStore = JSON.parse(localStorage.getItem('userRoles') || '[]')
      const hasRole = to.meta.roles.some(r => userStore.includes(r))
      if (!hasRole) {
        NProgress.done()
        next({ name: 'Dashboard' })
        return
      }
    }
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
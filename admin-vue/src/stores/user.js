import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isSuperAdmin: (state) => state.roles.includes('super_admin')
  },

  actions: {
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        if (res.code === 200) {
          this.token = res.data.token
          this.userInfo = res.data.userInfo
          this.roles = res.data.userInfo.role ? [res.data.userInfo.role] : []
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userRoles', JSON.stringify(this.roles))
          return true
        } else {
          ElMessage.error(res.message || '登录失败')
          return false
        }
      } catch (error) {
        console.warn('后端服务未启动，使用mock登录')
        return await this.mockLogin(loginForm)
      }
    },

    /**
     * 本地 Mock 登录（仅在 import.meta.env.DEV 时可用）
     * 🔒 生产环境真实认证由后端 BCrypt 处理，不依赖此 mock
     */
    async mockLogin(loginForm) {
      // 仅在开发环境下允许 mock 登录
      if (import.meta.env.PROD) {
        ElMessage.error('用户名或密码错误')
        return false
      }
      if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
        this.token = 'mock_token_' + Date.now()
        this.userInfo = {
          id: 1,
          username: 'admin',
          nickname: '超级管理员',
          role: 'super_admin'
        }
        this.roles = ['super_admin']
        localStorage.setItem('token', this.token)
        localStorage.setItem('userRoles', JSON.stringify(this.roles))
        return true
      } else {
        ElMessage.error('用户名或密码错误')
        return false
      }
    },

    async getUserInfo() {
      try {
        const res = await getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          this.roles = res.data.role ? [res.data.role] : []
          return res.data
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    },

    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('退出登录失败', error)
      } finally {
        this.token = ''
        this.userInfo = null
        this.roles = []
        localStorage.removeItem('token')
        localStorage.removeItem('userRoles')
      }
    },

    checkToken() {
      if (!this.token) {
        return false
      }
      return true
    }
  }
})
import request from './axios'

export const login = (data) => {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}

export const logout = () => {
  return request({
    url: '/api/admin/logout',
    method: 'post'
  })
}

export const getUserInfo = () => {
  return request({
    url: '/api/admin/profile',
    method: 'get'
  })
}

export const updateProfile = (data) => {
  return request({
    url: '/api/admin/profile',
    method: 'put',
    data
  })
}

export const updatePassword = (data) => {
  return request({
    url: '/api/admin/password',
    method: 'put',
    data
  })
}
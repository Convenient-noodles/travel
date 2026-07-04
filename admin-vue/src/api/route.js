import request from './axios'

export const getRouteList = (params) => {
  return request({
    url: '/api/admin/routes',
    method: 'get',
    params
  })
}

export const getRouteDetail = (id) => {
  return request({
    url: `/api/admin/routes/${id}`,
    method: 'get'
  })
}

export const createRoute = (data) => {
  return request({
    url: '/api/admin/routes',
    method: 'post',
    data
  })
}

export const updateRoute = (id, data) => {
  return request({
    url: `/api/admin/routes/${id}`,
    method: 'put',
    data
  })
}

export const deleteRoute = (id) => {
  return request({
    url: `/api/admin/routes/${id}`,
    method: 'delete'
  })
}

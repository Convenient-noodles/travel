import request from './axios'

export const getCultureList = (params) => {
  return request({
    url: '/api/admin/cultures',
    method: 'get',
    params
  })
}

export const getCultureDetail = (id) => {
  return request({
    url: `/api/admin/cultures/${id}`,
    method: 'get'
  })
}

export const createCulture = (data) => {
  return request({
    url: '/api/admin/cultures/json',
    method: 'post',
    data
  })
}

export const updateCulture = (id, data) => {
  return request({
    url: `/api/admin/cultures/${id}/json`,
    method: 'put',
    data
  })
}

export const deleteCulture = (id) => {
  return request({
    url: `/api/admin/cultures/${id}`,
    method: 'delete'
  })
}

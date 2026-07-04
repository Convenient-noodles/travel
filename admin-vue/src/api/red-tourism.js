import request from './axios'

export const getRedTourismList = (params) => {
  return request({
    url: '/api/admin/red-tourisms',
    method: 'get',
    params
  })
}

export const getRedTourismDetail = (id) => {
  return request({
    url: `/api/admin/red-tourisms/${id}`,
    method: 'get'
  })
}

export const createRedTourism = (data) => {
  return request({
    url: '/api/admin/red-tourisms/json',
    method: 'post',
    data
  })
}

export const updateRedTourism = (id, data) => {
  return request({
    url: `/api/admin/red-tourisms/${id}/json`,
    method: 'put',
    data
  })
}

export const deleteRedTourism = (id) => {
  return request({
    url: `/api/admin/red-tourisms/${id}`,
    method: 'delete'
  })
}

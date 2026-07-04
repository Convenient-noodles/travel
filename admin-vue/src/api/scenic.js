import request from './axios'

export const getScenicList = (params) => {
  return request({
    url: '/api/admin/scenics',
    method: 'get',
    params
  })
}

export const getScenicDetail = (id) => {
  return request({
    url: `/api/admin/scenics/${id}`,
    method: 'get'
  })
}

export const createScenic = (data) => {
  return request({
    url: '/api/admin/scenics',
    method: 'post',
    data
  })
}

export const updateScenic = (id, data) => {
  return request({
    url: `/api/admin/scenics/${id}`,
    method: 'put',
    data
  })
}

export const deleteScenic = (id) => {
  return request({
    url: `/api/admin/scenics/${id}`,
    method: 'delete'
  })
}

export const batchDeleteScenics = (ids) => {
  return request({
    url: '/api/admin/scenics/batch-delete',
    method: 'post',
    data: { ids }
  })
}

export const toggleRecommend = (id, isRecommended) => {
  return request({
    url: '/api/admin/scenics/toggle-recommend',
    method: 'put',
    data: { id, isRecommended }
  })
}

export const updateSort = (data) => {
  return request({
    url: '/api/admin/scenics/sort',
    method: 'put',
    data
  })
}
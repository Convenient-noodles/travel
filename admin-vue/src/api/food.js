import request from './axios'

export const getFoodList = (params) => {
  return request({
    url: '/api/admin/foods',
    method: 'get',
    params
  })
}

export const getFoodDetail = (id) => {
  return request({
    url: `/api/admin/foods/${id}`,
    method: 'get'
  })
}

export const createFood = (data) => {
  return request({
    url: '/api/admin/foods',
    method: 'post',
    data
  })
}

export const updateFood = (id, data) => {
  return request({
    url: `/api/admin/foods/${id}`,
    method: 'put',
    data
  })
}

export const deleteFood = (id) => {
  return request({
    url: `/api/admin/foods/${id}`,
    method: 'delete'
  })
}

export const toggleRecommend = (id, isRecommended) => {
  return request({
    url: '/api/admin/foods/toggle-recommend',
    method: 'put',
    data: { id, isRecommended }
  })
}

import request from './axios'

export const getHotelList = (params) => {
  return request({
    url: '/api/admin/hotels',
    method: 'get',
    params
  })
}

export const getHotelDetail = (id) => {
  return request({
    url: `/api/admin/hotels/${id}`,
    method: 'get'
  })
}

export const createHotel = (data) => {
  return request({
    url: '/api/admin/hotels',
    method: 'post',
    data
  })
}

export const updateHotel = (id, data) => {
  return request({
    url: `/api/admin/hotels/${id}`,
    method: 'put',
    data
  })
}

export const deleteHotel = (id) => {
  return request({
    url: `/api/admin/hotels/${id}`,
    method: 'delete'
  })
}

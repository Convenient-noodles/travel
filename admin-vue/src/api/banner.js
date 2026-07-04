import request from './axios'

export const getBannerList = (params) => {
  return request({
    url: '/api/admin/banners',
    method: 'get',
    params
  })
}

export const getBannerDetail = (id) => {
  return request({
    url: `/api/admin/banners/${id}`,
    method: 'get'
  })
}

export const createBanner = (data) => {
  return request({
    url: '/api/admin/banners',
    method: 'post',
    data
  })
}

export const updateBanner = (id, data) => {
  return request({
    url: `/api/admin/banners/${id}`,
    method: 'put',
    data
  })
}

export const deleteBanner = (id) => {
  return request({
    url: `/api/admin/banners/${id}`,
    method: 'delete'
  })
}

export const updateBannerSort = (data) => {
  return request({
    url: `/api/admin/banners/${data.id}/sort`,
    method: 'put',
    data: { sortOrder: data.sort }
  })
}

export const toggleBanner = (id, enabled) => {
  return request({
    url: `/api/admin/banners/${id}/enabled`,
    method: 'put',
    data: { isEnabled: enabled }
  })
}

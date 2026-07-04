import request from './axios'

export const getRegionList = () => {
  return request({
    url: '/api/admin/regions',
    method: 'get'
  })
}

export const getRegionById = (id) => {
  return request({
    url: `/api/admin/regions/${id}`,
    method: 'get'
  })
}

export const createRegion = (data) => {
  return request({
    url: '/api/admin/regions',
    method: 'post',
    data
  })
}

export const updateRegion = (id, data) => {
  return request({
    url: `/api/admin/regions/${id}`,
    method: 'put',
    data
  })
}

export const deleteRegion = (id) => {
  return request({
    url: `/api/admin/regions/${id}`,
    method: 'delete'
  })
}

export const toggleRegion = (id, isEnabled) => {
  return request({
    url: `/api/admin/regions/${id}/enabled`,
    method: 'put',
    data: { isEnabled }
  })
}

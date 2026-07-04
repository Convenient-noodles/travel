import request from './axios'

export const getStrategyList = () => {
  return request({
    url: '/api/admin/strategies',
    method: 'get'
  })
}

export const getStrategyById = (id) => {
  return request({
    url: `/api/admin/strategies/${id}`,
    method: 'get'
  })
}

export const getEnabledStrategies = () => {
  return request({
    url: '/api/admin/strategies/enabled',
    method: 'get'
  })
}

export const createStrategy = (data) => {
  return request({
    url: '/api/admin/strategies',
    method: 'post',
    data
  })
}

export const updateStrategy = (id, data) => {
  return request({
    url: `/api/admin/strategies/${id}`,
    method: 'put',
    data
  })
}

export const deleteStrategy = (id) => {
  return request({
    url: `/api/admin/strategies/${id}`,
    method: 'delete'
  })
}

export const toggleStrategy = (id, isEnabled) => {
  return request({
    url: `/api/admin/strategies/${id}/enabled`,
    method: 'put',
    data: { isEnabled }
  })
}
import request from './axios'

export const getDashboardStats = () => {
  return request({
    url: '/api/admin/dashboard/stats',
    method: 'GET'
  })
}

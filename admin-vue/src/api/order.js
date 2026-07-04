import request from './axios'

export function getOrderList(params) {
  return request({
    url: '/api/admin/orders',
    method: 'get',
    params
  })
}

export function getOrderDetail(id) {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'get'
  })
}

export function deleteOrder(id) {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'delete'
  })
}

export function refundOrder(id, reason) {
  return request({
    url: `/api/admin/orders/${id}/refund`,
    method: 'put',
    data: { reason }
  })
}

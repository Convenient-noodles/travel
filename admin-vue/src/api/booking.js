import request from './axios'

export function getBookingList(params) {
  return request({
    url: '/api/admin/bookings',
    method: 'get',
    params
  })
}

export function getBookingDetail(id) {
  return request({
    url: `/api/admin/bookings/${id}`,
    method: 'get'
  })
}

export function cancelBooking(id) {
  return request({
    url: `/api/admin/bookings/${id}/cancel`,
    method: 'put'
  })
}

export function deleteBooking(id) {
  return request({
    url: `/api/admin/bookings/${id}`,
    method: 'delete'
  })
}

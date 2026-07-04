package com.example.tourism.service;

import com.example.tourism.entity.Order;

import java.util.Map;

public interface OrderService {

    Map<String, Object> findByPage(String keyword, String status, Integer page, Integer pageSize);

    Order getById(Long id);

    Order getByOrderNo(String orderNo);

    Order create(Order order);

    Order update(Order order);

    void delete(Long id);

    Map<String, Object> createPaymentOrder(Order order);

    boolean processPaymentCallback(String orderNo, String transactionId);

    Order refund(Long id, String reason);

    Order refundByOrderNo(String orderNo, String reason, String openid);
}

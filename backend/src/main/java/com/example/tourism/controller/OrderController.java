package com.example.tourism.controller;

import com.example.tourism.entity.Order;
import com.example.tourism.service.OrderService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = orderService.findByPage(keyword, status, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Order order = orderService.getById(id);
        if (order == null) {
            return ResultUtil.error("订单不存在");
        }
        return ResultUtil.success(order);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/refund")
    public ResultUtil refund(@PathVariable Long id, @RequestBody Map<String, String> params) {
        String reason = params.getOrDefault("reason", "用户申请退款");
        Order order = orderService.refund(id, reason);
        return ResultUtil.success("退款成功", order);
    }

    // ========== 小程序公开接口 ==========

    @PostMapping("/public/create")
    public ResultUtil publicCreate(@RequestBody Order order) {
        Map<String, Object> payParams = orderService.createPaymentOrder(order);
        return ResultUtil.success(payParams);
    }

    @PostMapping("/public/pay/{orderNo}")
    public ResultUtil publicPayCallback(@PathVariable String orderNo, @RequestBody Map<String, String> params) {
        String transactionId = params.getOrDefault("transactionId", "SIMULATED_TXN");
        boolean success = orderService.processPaymentCallback(orderNo, transactionId);
        if (!success) {
            return ResultUtil.error("支付回调处理失败");
        }
        return ResultUtil.success("支付成功");
    }

    @GetMapping("/public/status/{orderNo}")
    public ResultUtil publicQueryStatus(@PathVariable String orderNo) {
        Order order = orderService.getByOrderNo(orderNo);
        if (order == null) {
            return ResultUtil.error("订单不存在");
        }
        return ResultUtil.success(order);
    }

    @PutMapping("/public/refund/{orderNo}")
    public ResultUtil publicRefund(@PathVariable String orderNo, @RequestBody Map<String, String> params) {
        String reason = params.getOrDefault("reason", "用户申请退款");
        String openid = params.get("openid");
        if (openid == null || openid.isBlank()) {
            return ResultUtil.error("用户身份验证失败");
        }
        Order order = orderService.refundByOrderNo(orderNo, reason, openid);
        return ResultUtil.success("退款申请已提交，待商家审核", order);
    }

    @GetMapping("/public/list/{openid}")
    public ResultUtil publicUserOrders(@PathVariable String openid,
                                       @RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = orderService.findByPage(openid, null, page, pageSize);
        return ResultUtil.success(result);
    }
}

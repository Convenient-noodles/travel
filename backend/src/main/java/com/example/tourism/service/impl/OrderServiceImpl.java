package com.example.tourism.service.impl;

import com.example.tourism.entity.Hotel;
import com.example.tourism.entity.Order;
import com.example.tourism.mapper.HotelMapper;
import com.example.tourism.mapper.OrderMapper;
import com.example.tourism.service.OrderService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final HotelMapper hotelMapper;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    // 订单状态常量 — 消除字符串散落
    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_PAID = "paid";
    private static final String STATUS_REFUNDING = "refunding";
    private static final String STATUS_REFUNDED = "refunded";

    // 日期格式 — 只创建一次
    private static final String DT_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final String ORDER_NO_PREFIX = "QY";

    @Override
    public Map<String, Object> findByPage(String keyword, String status, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<Order> orders = orderMapper.findByConditions(keyword, status, offset, pageSize);
        Long total = orderMapper.countByConditions(keyword, status);
        Map<String, Object> result = new HashMap<>();
        result.put("list", orders);
        result.put("total", total);
        return result;
    }

    @Override
    public Order getById(Long id) {
        return orderMapper.findById(id);
    }

    @Override
    public Order getByOrderNo(String orderNo) {
        return orderMapper.findByOrderNo(orderNo);
    }

    @Override
    @Transactional
    public Order create(Order order) {
        order.setOrderNo(generateOrderNo());
        order.setStatus(STATUS_PENDING);
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        orderMapper.insert(order);
        return order;
    }

    @Override
    @Transactional
    public Order update(Order order) {
        order.setUpdateTime(new Date());
        orderMapper.update(order);
        return order;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        orderMapper.delete(id);
    }

    @Override
    @Transactional
    public Map<String, Object> createPaymentOrder(Order order) {
        // 🔒 校验订单金额与酒店价格一致，防止前端篡改
        validateOrderAmount(order);
        Order savedOrder = create(order);
        Map<String, Object> payParams = buildPayParams(savedOrder);
        payParams.put("orderNo", savedOrder.getOrderNo());
        payParams.put("orderId", savedOrder.getId());
        return payParams;
    }

    @Override
    @Transactional
    public boolean processPaymentCallback(String orderNo, String transactionId) {
        Order order = orderMapper.findByOrderNo(orderNo);
        if (!isPending(order)) return false;
        order.setStatus(STATUS_PAID);
        order.setPayTime(formatNow());
        order.setUpdateTime(new Date());
        orderMapper.update(order);
        return true;
    }

    @Override
    @Transactional
    public Order refund(Long id, String reason) {
        Order order = orderMapper.findById(id);
        if (order == null || !canRefund(order.getStatus())) {
            throw new RuntimeException("订单状态不允许退款");
        }
        applyFullRefund(order, reason);
        orderMapper.update(order);
        return order;
    }

    @Override
    @Transactional
    public Order refundByOrderNo(String orderNo, String reason, String openid) {
        Order order = orderMapper.findByOrderNo(orderNo);
        if (order == null || !STATUS_PAID.equals(order.getStatus())) {
            throw new RuntimeException("订单状态不允许申请退款");
        }
        // 🔒 验证订单归属：只有下单用户本人才能申请退款
        if (order.getUserOpenid() == null || !order.getUserOpenid().equals(openid)) {
            throw new RuntimeException("无权操作该订单");
        }
        order.setStatus(STATUS_REFUNDING);
        order.setRefundReason(reason);
        order.setUpdateTime(new Date());
        orderMapper.update(order);
        return order;
    }

    // ========== 私有辅助方法 ==========

    /**
     * 🔒 校验订单金额：查询酒店对应房型价格，防止前端篡改金额
     */
    private void validateOrderAmount(Order order) {
        if (order.getHotelId() == null) {
            throw new RuntimeException("酒店ID不能为空");
        }
        Hotel hotel = hotelMapper.findById(order.getHotelId());
        if (hotel == null) {
            throw new RuntimeException("酒店不存在");
        }
        if (order.getAmount() == null || order.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("订单金额无效");
        }

        // 尝试从房型列表中找到匹配的价格
        BigDecimal expectedPrice = null;
        if (hotel.getRoomTypes() != null && !hotel.getRoomTypes().isBlank()
                && order.getRoomName() != null && !order.getRoomName().isBlank()) {
            try {
                List<Map<String, Object>> roomTypes = OBJECT_MAPPER.readValue(
                        hotel.getRoomTypes(), new TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> room : roomTypes) {
                    Object roomName = room.get("name");
                    if (roomName != null && roomName.toString().equals(order.getRoomName())) {
                        Object priceObj = room.get("price");
                        if (priceObj != null) {
                            expectedPrice = new BigDecimal(priceObj.toString());
                        }
                        break;
                    }
                }
            } catch (Exception e) {
                // JSON解析失败，回退到酒店基础价格校验
            }
        }

        // 若未匹配到房型价格，使用酒店基础价格
        if (expectedPrice == null) {
            if (hotel.getPrice() == null || hotel.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("酒店价格信息异常");
            }
            expectedPrice = hotel.getPrice();
        }

        // 比较金额（支持多晚住宿：nights > 1 时总价 = 单价 × 晚数）
        BigDecimal totalExpected = expectedPrice.multiply(
                BigDecimal.valueOf(order.getNights() != null && order.getNights() > 0 ? order.getNights() : 1));

        if (order.getAmount().compareTo(totalExpected) != 0) {
            throw new RuntimeException("订单金额与酒店价格" + totalExpected + "元不一致，请刷新后重试");
        }
    }

    private boolean isPending(Order order) {
        return order != null && STATUS_PENDING.equals(order.getStatus());
    }

    private boolean canRefund(String status) {
        return STATUS_PAID.equals(status) || STATUS_REFUNDING.equals(status);
    }

    private void applyFullRefund(Order order, String reason) {
        order.setStatus(STATUS_REFUNDED);
        order.setRefundAmount(order.getAmount());
        order.setRefundReason(reason);
        order.setRefundTime(formatNow());
        order.setUpdateTime(new Date());
    }

    private String formatNow() {
        return new SimpleDateFormat(DT_FORMAT).format(new Date());
    }

    private String generateOrderNo() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        int random = java.util.concurrent.ThreadLocalRandom.current().nextInt(9000) + 1000;
        return ORDER_NO_PREFIX + sdf.format(new Date()) + random;
    }

    private Map<String, Object> buildPayParams(Order order) {
        Map<String, Object> params = new HashMap<>();
        params.put("timeStamp", String.valueOf(System.currentTimeMillis() / 1000));
        params.put("nonceStr", UUID.randomUUID().toString().replace("-", "").substring(0, 32));
        params.put("package", "prepay_id=wx" + UUID.randomUUID().toString().replace("-", "").substring(0, 32));
        params.put("signType", "MD5");
        params.put("paySign", UUID.randomUUID().toString().replace("-", "").toUpperCase());
        return params;
    }
}

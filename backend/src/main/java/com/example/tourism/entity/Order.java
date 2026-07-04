package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class Order {

    private Long id;
    private String orderNo;
    private Long hotelId;
    private String hotelName;
    private String hotelImage;
    private String roomName;
    private BigDecimal amount;
    private String name;
    private String phone;
    private Date checkInDate;
    private Date checkOutDate;
    private Integer nights;
    private String status;
    private String userOpenid;
    private String payTime;
    private String refundTime;
    private BigDecimal refundAmount;
    private String refundReason;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

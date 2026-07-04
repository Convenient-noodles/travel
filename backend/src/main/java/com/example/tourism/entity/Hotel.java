package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class Hotel {

    private Long id;
    private String name;
    private String coverImage;
    private String images;
    private String region;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer starLevel;
    private String hotelType;
    private BigDecimal price;
    private String description;
    private String facilities;
    private String roomTypes;
    private String checkInTime;
    private String checkOutTime;
    private String phone;
    private String paymentQrCode;
    private String tags;
    private BigDecimal rating;
    private Integer isRecommended;
    private Integer sortOrder;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

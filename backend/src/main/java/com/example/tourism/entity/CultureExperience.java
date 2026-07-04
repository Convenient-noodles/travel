package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class CultureExperience {

    private Long id;
    private String name;
    private String coverImage;
    private String images;
    private String region;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String category;
    private String duration;
    private BigDecimal price;
    private String description;
    private String highlights;
    private String bookingInfo;
    private String openTime;
    private String phone;
    private String tags;
    private BigDecimal rating;
    private Integer isRecommended;
    private Integer sortOrder;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

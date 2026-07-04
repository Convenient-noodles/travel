package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class Food {

    private Long id;
    private String name;
    private String coverImage;
    private String images;
    private String region;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String category;
    private String taste;
    private BigDecimal price;
    private String description;
    private String recommendedDishes;
    private String openTime;
    private String phone;
    private String tags;
    private BigDecimal rating;
    private String highlights; //【改】添加亮点特色字段
    private String craft; //【改】添加制作工艺字段
    private Integer isRecommended;
    private Integer sortOrder;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class RedTourismSite {

    private Long id;
    private String name;
    private String coverImage;
    private String images;
    private String type;
    private String region;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private String history;
    private String significance;
    private String ticketInfo;
    private String openTime;
    private String trafficInfo;
    private String tips;
    private String tags;
    private BigDecimal rating;
    private Integer visitCount;
    private Integer isRecommended;
    private Integer sortOrder;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

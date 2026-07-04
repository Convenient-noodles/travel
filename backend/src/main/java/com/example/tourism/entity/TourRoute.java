package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class TourRoute {

    private Long id;
    private String name;
    private String coverImage;
    private String images;
    private String tag;
    private String region;
    private Integer days;
    private Integer nights;
    private BigDecimal price;
    private String description;
    private String highlights;
    private String includes;
    private String itinerary;
    private String suitableFor;
    private String bestSeason;
    private String notes;
    private Integer isRecommended;
    private Integer isHot;
    private Integer sortOrder;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

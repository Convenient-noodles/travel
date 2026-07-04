package com.example.tourism.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class Region {

    private Long id;
    private String name;
    private String code;
    private String parentCode;
    private Integer level;
    private String pinyin;
    private BigDecimal lng;
    private BigDecimal lat;
    private Integer sortOrder;
    private Integer isEnabled;
    private Date createTime;
    private Date updateTime;
}

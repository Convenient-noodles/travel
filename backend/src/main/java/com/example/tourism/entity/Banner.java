package com.example.tourism.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Banner {

    private Long id;
    private String title;
    private String subtitle;
    private String image;
    private String type;
    private String targetId;
    private String targetUrl;
    private Integer sort;
    private Integer enabled;
    private Date createTime;
    private Date updateTime;
}

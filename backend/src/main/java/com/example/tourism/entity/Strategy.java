package com.example.tourism.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Strategy {

    private Long id;
    private String title;
    private String content;
    private String coverImage;
    private String author;
    private String category; // 【新增】分类字段
    private String tips; // 【新增】小贴士字段
    private Integer viewCount;
    private Integer likeCount;
    private Integer sortOrder;
    private Integer isEnabled;
    private Date createTime;
    private Date updateTime;
}
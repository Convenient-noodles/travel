package com.example.tourism.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Booking {
    private Long id;
    private Long cultureId;
    private String cultureName;
    private String cultureImage;
    private String location;
    private String duration;
    private String name;
    private String phone;
    private String bookDate;
    private Integer count;
    private String status;
    private String userOpenid;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

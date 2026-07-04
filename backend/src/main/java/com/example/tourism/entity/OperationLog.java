package com.example.tourism.entity;

import lombok.Data;

import java.util.Date;

@Data
public class OperationLog {

    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String module;
    private String description;
    private String requestMethod;
    private String requestUrl;
    private String requestParams;
    private Integer responseCode;
    private String ipAddress;
    private String userAgent;
    private Date createTime;
}

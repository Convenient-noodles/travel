package com.example.tourism.entity;

import lombok.Data;

import java.util.Date;

@Data
public class SystemConfig {

    private Long id;
    private String groupKey;
    private String configKey;
    private String configValue;
    private String configName;
    private String configType;
    private String configOptions;
    private Integer sortOrder;
    private Integer isSystem;
    private String remark;
    private Date createTime;
    private Date updateTime;
}

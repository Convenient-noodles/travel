package com.example.tourism.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Date;

@Data
public class AdminUser {

    private Long id;
    private String username;

    /**
     * 🔒 只允许反序列化（接收请求中的密码），不允许序列化（响应中不返回密码）
     * 服务层 getAll/getById 也会主动清除以双重保险
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String nickname;
    private String phone;
    private String email;
    private String avatar;
    private String role;
    private Integer status;
    private String lastLoginIp;
    private Date lastLoginTime;
    private Date createTime;
    private Date updateTime;
    private Date deleteTime;
}

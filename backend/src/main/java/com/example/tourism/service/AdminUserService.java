package com.example.tourism.service;

import com.example.tourism.dto.LoginDTO;
import com.example.tourism.entity.AdminUser;

import java.util.List;
import java.util.Map;

public interface AdminUserService {

    Map<String, Object> login(LoginDTO loginDTO, String ip);

    AdminUser getById(Long id);

    List<AdminUser> getAll();

    AdminUser create(AdminUser adminUser);

    AdminUser update(AdminUser adminUser);

    void delete(Long id);

    void updatePassword(Long id, String oldPassword, String newPassword);
}

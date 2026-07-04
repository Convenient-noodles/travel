package com.example.tourism.controller;

import com.example.tourism.dto.LoginDTO;
import com.example.tourism.entity.AdminUser;
import com.example.tourism.service.AdminUserService;
import com.example.tourism.util.ResultUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping("/login")
    public ResultUtil login(@Valid @RequestBody LoginDTO loginDTO, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        Map<String, Object> result = adminUserService.login(loginDTO, ip);
        return ResultUtil.success(result);
    }

    @GetMapping("/users")
    public ResultUtil getAllUsers() {
        List<AdminUser> users = adminUserService.getAll();
        return ResultUtil.success(users);
    }

    @GetMapping("/users/{id}")
    public ResultUtil getUserById(@PathVariable Long id) {
        AdminUser user = adminUserService.getById(id);
        if (user == null) {
            return ResultUtil.error("用户不存在");
        }
        return ResultUtil.success(user);
    }

    @PostMapping("/users")
    public ResultUtil createUser(@RequestBody AdminUser adminUser) {
        AdminUser user = adminUserService.create(adminUser);
        return ResultUtil.success("创建成功", user);
    }

    @PutMapping("/users/{id}")
    public ResultUtil updateUser(@PathVariable Long id, @RequestBody AdminUser adminUser) {
        adminUser.setId(id);
        AdminUser user = adminUserService.update(adminUser);
        return ResultUtil.success("更新成功", user);
    }

    @DeleteMapping("/users/{id}")
    public ResultUtil deleteUser(@PathVariable Long id) {
        adminUserService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/users/{id}/password")
    public ResultUtil updatePassword(@PathVariable Long id, @RequestBody Map<String, String> params) {
        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");
        adminUserService.updatePassword(id, oldPassword, newPassword);
        return ResultUtil.success("密码修改成功");
    }
}

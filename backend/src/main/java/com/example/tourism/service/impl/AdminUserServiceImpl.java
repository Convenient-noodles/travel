package com.example.tourism.service.impl;

import com.example.tourism.dto.LoginDTO;
import com.example.tourism.entity.AdminUser;
import com.example.tourism.mapper.AdminUserMapper;
import com.example.tourism.service.AdminUserService;
import com.example.tourism.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final AdminUserMapper adminUserMapper;
    private final JwtUtil jwtUtil;

    /** BCrypt 哈希盐值轮数（10~12 为推荐值，值越大越安全但越慢） */
    private static final int BCRYPT_ROUNDS = 10;

    /** 对明文密码做 BCrypt 哈希 */
    private String hashPassword(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }

    /** 验证明文密码是否与哈希值匹配 */
    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(rawPassword, hashedPassword);
        } catch (Exception e) {
            return false;
        }
    }

    /** 判断字符串是否为 BCrypt 哈希格式（以 $2a$ 或 $2b$ 开头，长度60） */
    private boolean isBcryptHash(String password) {
        return password != null 
            && password.length() == 60 
            && (password.startsWith("$2a$") || password.startsWith("$2b$"));
    }

    /**
     * 认证密码 + 自动升级旧明文密码
     *   - 若数据库中是 BCrypt 哈希 → BCrypt 比对
     *   - 若数据库中是明文 → 明文比对，成功则自动升级为 BCrypt
     */
    private boolean authenticateAndUpgrade(String rawPassword, String storedPassword, Long userId) {
        if (isBcryptHash(storedPassword)) {
            return verifyPassword(rawPassword, storedPassword);
        }
        // 旧明文密码比对
        if (storedPassword != null && storedPassword.equals(rawPassword)) {
            // 自动升级为 BCrypt
            adminUserMapper.updatePassword(userId, hashPassword(rawPassword));
            return true;
        }
        return false;
    }

    @Override
    public Map<String, Object> login(LoginDTO loginDTO, String ip) {
        AdminUser user = adminUserMapper.findByUsername(loginDTO.getUsername());

        if (user == null) {
            throw new RuntimeException("用户名不存在");
        }

        if (user.getStatus() != 1) {
            throw new RuntimeException("账号已被禁用");
        }

        // 🔒 验证密码（兼容旧明文密码，首次登录自动升级为 BCrypt）
        String storedPwd = user.getPassword();
        if (!authenticateAndUpgrade(loginDTO.getPassword(), storedPwd, user.getId())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        adminUserMapper.updateLastLogin(user.getId(), ip, new java.util.Date());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("nickname", user.getNickname());
        userInfo.put("role", user.getRole());
        userInfo.put("phone", user.getPhone());
        userInfo.put("email", user.getEmail());
        result.put("userInfo", userInfo);

        return result;
    }

    @Override
    public AdminUser getById(Long id) {
        AdminUser user = adminUserMapper.findById(id);
        if (user != null) {
            user.setPassword(null); // 🔒 脱敏，禁止返回密码
        }
        return user;
    }

    @Override
    public List<AdminUser> getAll() {
        List<AdminUser> users = adminUserMapper.findAll();
        users.forEach(u -> u.setPassword(null)); // 🔒 脱敏，禁止返回密码
        return users;
    }

    @Override
    @Transactional
    public AdminUser create(AdminUser adminUser) {
        AdminUser existing = adminUserMapper.findByUsername(adminUser.getUsername());
        if (existing != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 🔒 密码 BCrypt 哈希后再入库
        adminUser.setPassword(hashPassword(adminUser.getPassword()));
        adminUser.setRole(adminUser.getRole() != null ? adminUser.getRole() : "admin");
        adminUser.setStatus(adminUser.getStatus() != null ? adminUser.getStatus() : 1);
        adminUser.setCreateTime(new java.util.Date());
        adminUser.setUpdateTime(new java.util.Date());

        adminUserMapper.insert(adminUser);
        // 返回前清除密码字段，避免泄露
        adminUser.setPassword(null);
        return adminUser;
    }

    @Override
    @Transactional
    public AdminUser update(AdminUser adminUser) {
        // 修改基本信息时不涉及密码，直接更新
        adminUser.setUpdateTime(new java.util.Date());
        adminUserMapper.update(adminUser);
        return adminUser;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        adminUserMapper.delete(id);
    }

    @Override
    @Transactional
    public void updatePassword(Long id, String oldPassword, String newPassword) {
        AdminUser user = adminUserMapper.findById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 🔒 BCrypt 验证旧密码
        if (!verifyPassword(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }

        // 🔒 新密码 BCrypt 哈希后写入
        adminUserMapper.updatePassword(id, hashPassword(newPassword));
    }
}

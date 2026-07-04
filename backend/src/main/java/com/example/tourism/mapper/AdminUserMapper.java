package com.example.tourism.mapper;

import com.example.tourism.entity.AdminUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminUserMapper {

    AdminUser findByUsername(@Param("username") String username);

    AdminUser findById(@Param("id") Long id);

    List<AdminUser> findAll();

    int insert(AdminUser adminUser);

    int update(AdminUser adminUser);

    int delete(@Param("id") Long id);

    int updatePassword(@Param("id") Long id, @Param("password") String password);

    int updateLastLogin(@Param("id") Long id, @Param("ip") String ip, @Param("time") java.util.Date time);
}

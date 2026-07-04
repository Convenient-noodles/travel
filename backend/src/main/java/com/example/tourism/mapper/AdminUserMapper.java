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

    /** 返回用户总数（逻辑删除除外），用于 Dashboard 统计，避免加载全部记录到内存 */
    long countAll();

    int insert(AdminUser adminUser);

    int update(AdminUser adminUser);

    int delete(@Param("id") Long id);

    int updatePassword(@Param("id") Long id, @Param("password") String password);

    int updateLastLogin(@Param("id") Long id, @Param("ip") String ip, @Param("time") java.util.Date time);
}

package com.example.tourism.mapper;

import com.example.tourism.entity.Banner;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BannerMapper {

    List<Banner> findAll();

    List<Banner> findEnabled();
    
    List<Banner> findByPage(@Param("offset") Integer offset, @Param("pageSize") Integer pageSize);
    
    int count();

    Banner findById(@Param("id") Long id);

    int insert(Banner banner);

    int update(Banner banner);

    int delete(@Param("id") Long id);

    int updateEnabled(@Param("id") Long id, @Param("isEnabled") Integer isEnabled);

    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    int updateClickCount(@Param("id") Long id);
}

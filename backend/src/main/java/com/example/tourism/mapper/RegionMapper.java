package com.example.tourism.mapper;

import com.example.tourism.entity.Region;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RegionMapper {

    List<Region> findByParentCode(@Param("parentCode") String parentCode);

    List<Region> findByLevel(@Param("level") Integer level);

    Region findById(@Param("id") Long id);

    Region findByCode(@Param("code") String code);

    int insert(Region region);

    int update(Region region);

    int delete(@Param("id") Long id);
}

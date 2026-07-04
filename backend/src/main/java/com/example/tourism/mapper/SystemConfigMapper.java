package com.example.tourism.mapper;

import com.example.tourism.entity.SystemConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SystemConfigMapper {

    List<SystemConfig> findByGroupKey(@Param("groupKey") String groupKey);

    SystemConfig findByGroupAndKey(@Param("groupKey") String groupKey, @Param("configKey") String configKey);

    List<SystemConfig> findAll();

    int insert(SystemConfig systemConfig);

    int update(SystemConfig systemConfig);

    int updateValue(@Param("groupKey") String groupKey, @Param("configKey") String configKey, @Param("configValue") String configValue);
}

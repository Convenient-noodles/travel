package com.example.tourism.service;

import com.example.tourism.entity.SystemConfig;

import java.util.List;
import java.util.Map;

public interface SystemConfigService {

    List<SystemConfig> findByGroupKey(String groupKey);

    SystemConfig findByGroupAndKey(String groupKey, String configKey);

    List<SystemConfig> findAll();

    SystemConfig create(SystemConfig systemConfig);

    SystemConfig update(SystemConfig systemConfig);

    void updateBatch(List<SystemConfig> configs);

    Map<String, String> getConfigMap(String groupKey);

    String getConfigValue(String groupKey, String configKey);
}

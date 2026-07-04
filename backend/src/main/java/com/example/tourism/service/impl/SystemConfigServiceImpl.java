package com.example.tourism.service.impl;

import com.example.tourism.entity.SystemConfig;
import com.example.tourism.mapper.SystemConfigMapper;
import com.example.tourism.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigMapper systemConfigMapper;

    @Override
    public List<SystemConfig> findByGroupKey(String groupKey) {
        return systemConfigMapper.findByGroupKey(groupKey);
    }

    @Override
    public SystemConfig findByGroupAndKey(String groupKey, String configKey) {
        return systemConfigMapper.findByGroupAndKey(groupKey, configKey);
    }

    @Override
    public List<SystemConfig> findAll() {
        return systemConfigMapper.findAll();
    }

    @Override
    @Transactional
    public SystemConfig create(SystemConfig systemConfig) {
        systemConfig.setSortOrder(systemConfig.getSortOrder() != null ? systemConfig.getSortOrder() : 0);
        systemConfig.setIsSystem(systemConfig.getIsSystem() != null ? systemConfig.getIsSystem() : 0);
        systemConfig.setCreateTime(new java.util.Date());
        systemConfig.setUpdateTime(new java.util.Date());
        
        systemConfigMapper.insert(systemConfig);
        return systemConfig;
    }

    @Override
    @Transactional
    public SystemConfig update(SystemConfig systemConfig) {
        systemConfig.setUpdateTime(new java.util.Date());
        systemConfigMapper.update(systemConfig);
        return systemConfig;
    }

    @Override
    @Transactional
    public void updateBatch(List<SystemConfig> configs) {
        for (SystemConfig config : configs) {
            systemConfigMapper.updateValue(config.getGroupKey(), config.getConfigKey(), config.getConfigValue());
        }
    }

    @Override
    public Map<String, String> getConfigMap(String groupKey) {
        List<SystemConfig> configs = systemConfigMapper.findByGroupKey(groupKey);
        Map<String, String> map = new HashMap<>();
        for (SystemConfig config : configs) {
            map.put(config.getConfigKey(), config.getConfigValue());
        }
        return map;
    }

    @Override
    public String getConfigValue(String groupKey, String configKey) {
        SystemConfig config = systemConfigMapper.findByGroupAndKey(groupKey, configKey);
        return config != null ? config.getConfigValue() : null;
    }
}

package com.example.tourism.controller;

import com.example.tourism.entity.SystemConfig;
import com.example.tourism.service.SystemConfigService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/configs")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    public ResultUtil getAll() {
        List<SystemConfig> list = systemConfigService.findAll();
        return ResultUtil.success(list);
    }

    @GetMapping("/group/{groupKey}")
    public ResultUtil getByGroup(@PathVariable String groupKey) {
        List<SystemConfig> list = systemConfigService.findByGroupKey(groupKey);
        return ResultUtil.success(list);
    }

    @GetMapping("/{groupKey}/{configKey}")
    public ResultUtil getByGroupAndKey(@PathVariable String groupKey, @PathVariable String configKey) {
        SystemConfig config = systemConfigService.findByGroupAndKey(groupKey, configKey);
        if (config == null) {
            return ResultUtil.error("配置不存在");
        }
        return ResultUtil.success(config);
    }

    @PostMapping
    public ResultUtil create(@RequestBody SystemConfig systemConfig) {
        SystemConfig config = systemConfigService.create(systemConfig);
        return ResultUtil.success("创建成功", config);
    }

    @PutMapping
    public ResultUtil update(@RequestBody SystemConfig systemConfig) {
        SystemConfig config = systemConfigService.update(systemConfig);
        return ResultUtil.success("更新成功", config);
    }

    @PutMapping("/batch")
    public ResultUtil updateBatch(@RequestBody List<SystemConfig> configs) {
        systemConfigService.updateBatch(configs);
        return ResultUtil.success("批量更新成功");
    }

    @GetMapping("/map/{groupKey}")
    public ResultUtil getConfigMap(@PathVariable String groupKey) {
        Map<String, String> map = systemConfigService.getConfigMap(groupKey);
        return ResultUtil.success(map);
    }
}

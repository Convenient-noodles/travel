package com.example.tourism.controller;

import com.example.tourism.entity.Region;
import com.example.tourism.service.RegionService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    public ResultUtil getList() {
        List<Region> list = regionService.findAll();
        return ResultUtil.success(list);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Region region = regionService.getById(id);
        if (region == null) {
            return ResultUtil.error("地区不存在");
        }
        return ResultUtil.success(region);
    }

    @GetMapping("/level/{level}")
    public ResultUtil getByLevel(@PathVariable Integer level) {
        List<Region> list = regionService.findByLevel(level);
        return ResultUtil.success(list);
    }

    @PostMapping
    public ResultUtil create(@RequestBody Region region) {
        Region r = regionService.create(region);
        return ResultUtil.success("创建成功", r);
    }

    @PutMapping("/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody Region region) {
        region.setId(id);
        Region r = regionService.update(region);
        return ResultUtil.success("更新成功", r);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        regionService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/enabled")
    public ResultUtil updateEnabled(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isEnabled = params.get("isEnabled");
        regionService.updateEnabled(id, isEnabled);
        return ResultUtil.success("操作成功");
    }
}

package com.example.tourism.controller;

import com.example.tourism.entity.ScenicSpot;
import com.example.tourism.service.ScenicSpotService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/scenics")
@RequiredArgsConstructor
public class ScenicSpotController {

    private final ScenicSpotService scenicSpotService;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = scenicSpotService.findByPage(keyword, region, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        ScenicSpot scenicSpot = scenicSpotService.getById(id);
        if (scenicSpot == null) {
            return ResultUtil.error("景点不存在");
        }
        return ResultUtil.success(scenicSpot);
    }

    @PostMapping
    public ResultUtil create(@RequestBody ScenicSpot scenicSpot) {
        ScenicSpot spot = scenicSpotService.create(scenicSpot);
        return ResultUtil.success("创建成功", spot);
    }

    @PutMapping("/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody ScenicSpot scenicSpot) {
        scenicSpot.setId(id);
        ScenicSpot spot = scenicSpotService.update(scenicSpot);
        return ResultUtil.success("更新成功", spot);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        scenicSpotService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/recommend")
    public ResultUtil updateRecommend(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isRecommended = params.get("isRecommended");
        scenicSpotService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }

    @PutMapping("/toggle-recommend")
    public ResultUtil toggleRecommend(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer isRecommended = Integer.valueOf(params.get("isRecommended").toString());
        scenicSpotService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }

    // 小程序公开接口
    @GetMapping("/public/list")
    public ResultUtil getListForApp(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = scenicSpotService.findByPage(keyword, region, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/{id}")
    public ResultUtil getByIdForApp(@PathVariable Long id) {
        ScenicSpot scenicSpot = scenicSpotService.getById(id);
        if (scenicSpot == null) {
            return ResultUtil.error("景点不存在");
        }
        return ResultUtil.success(scenicSpot);
    }

    // 获取热门景点（按评分排序）
    @GetMapping("/public/hot")
    public ResultUtil getHotScenics() {
        return ResultUtil.success(scenicSpotService.findHotScenics());
    }
}

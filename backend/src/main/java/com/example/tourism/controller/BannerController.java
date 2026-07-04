package com.example.tourism.controller;

import com.example.tourism.entity.Banner;
import com.example.tourism.service.BannerService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResultUtil getList(@RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        List<Banner> list = bannerService.findByPage(page, pageSize);
        int total = bannerService.count();
        return ResultUtil.success(ResultUtil.pageResult(list, (long) total));
    }

    @GetMapping("/enabled")
    public ResultUtil getEnabledList() {
        List<Banner> list = bannerService.findEnabled();
        return ResultUtil.success(list);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Banner banner = bannerService.getById(id);
        if (banner == null) {
            return ResultUtil.error("轮播图不存在");
        }
        return ResultUtil.success(banner);
    }

    @PostMapping
    public ResultUtil create(@RequestBody Banner banner) {
        Banner b = bannerService.create(banner);
        return ResultUtil.success("创建成功", b);
    }

    @PutMapping("/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody Banner banner) {
        banner.setId(id);
        Banner b = bannerService.update(banner);
        return ResultUtil.success("更新成功", b);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/enabled")
    public ResultUtil updateEnabled(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isEnabled = params.get("isEnabled");
        bannerService.updateEnabled(id, isEnabled);
        return ResultUtil.success("操作成功");
    }

    @PutMapping("/{id}/sort")
    public ResultUtil updateSortOrder(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer sortOrder = params.get("sortOrder");
        bannerService.updateSortOrder(id, sortOrder);
        return ResultUtil.success("操作成功");
    }

    @PutMapping("/sort")
    public ResultUtil updateSort(@RequestBody Map<String, Object> params) {
        Long id = Long.parseLong(params.get("id").toString());
        Integer sort = (Integer) params.get("sort");
        bannerService.updateSortOrder(id, sort);
        return ResultUtil.success("操作成功");
    }

    @PutMapping("/{id}/toggle")
    public ResultUtil toggle(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer enabled = params.get("enabled");
        bannerService.updateEnabled(id, enabled);
        return ResultUtil.success("操作成功");
    }
}

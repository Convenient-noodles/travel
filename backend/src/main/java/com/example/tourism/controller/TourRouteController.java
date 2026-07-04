package com.example.tourism.controller;

import com.example.tourism.entity.TourRoute;
import com.example.tourism.service.TourRouteService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/routes")
@RequiredArgsConstructor
public class TourRouteController {

    private final TourRouteService tourRouteService;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Integer days,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = tourRouteService.findByPage(keyword, region, days, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/list")
    public ResultUtil getPublicList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Integer days,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = tourRouteService.findByPage(keyword, region, days, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/{id}")
    public ResultUtil getPublicById(@PathVariable Long id) {
        TourRoute route = tourRouteService.getById(id);
        if (route == null) {
            return ResultUtil.error("路线不存在");
        }
        return ResultUtil.success(route);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        TourRoute route = tourRouteService.getById(id);
        if (route == null) {
            return ResultUtil.error("路线不存在");
        }
        return ResultUtil.success(route);
    }

    @PostMapping
    public ResultUtil create(@RequestBody TourRoute tourRoute) {
        TourRoute route = tourRouteService.create(tourRoute);
        return ResultUtil.success("创建成功", route);
    }

    @PutMapping("/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody TourRoute tourRoute) {
        tourRoute.setId(id);
        TourRoute route = tourRouteService.update(tourRoute);
        return ResultUtil.success("更新成功", route);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        tourRouteService.delete(id);
        return ResultUtil.success("删除成功");
    }
}

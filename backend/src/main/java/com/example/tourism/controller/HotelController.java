package com.example.tourism.controller;

import com.example.tourism.entity.Hotel;
import com.example.tourism.service.HotelService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Integer starLevel,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = hotelService.findByPage(keyword, region, starLevel, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Hotel hotel = hotelService.getById(id);
        if (hotel == null) {
            return ResultUtil.error("酒店不存在");
        }
        return ResultUtil.success(hotel);
    }

    @PostMapping
    public ResultUtil create(@RequestBody Hotel hotel) {
        Hotel h = hotelService.create(hotel);
        return ResultUtil.success("创建成功", h);
    }

    @PutMapping("/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody Hotel hotel) {
        hotel.setId(id);
        Hotel h = hotelService.update(hotel);
        return ResultUtil.success("更新成功", h);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        hotelService.delete(id);
        return ResultUtil.success("删除成功");
    }

    // 小程序公开接口
    @GetMapping("/public/list")
    public ResultUtil getListForApp(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = hotelService.findByPage(keyword, region, null, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/{id}")
    public ResultUtil getByIdForApp(@PathVariable Long id) {
        Hotel hotel = hotelService.getById(id);
        if (hotel == null) {
            return ResultUtil.error("酒店不存在");
        }
        return ResultUtil.success(hotel);
    }

    @PutMapping("/{id}/recommend")
    public ResultUtil updateRecommend(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isRecommended = params.get("isRecommended");
        hotelService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }
}

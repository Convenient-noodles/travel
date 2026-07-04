package com.example.tourism.controller;

import com.example.tourism.entity.Booking;
import com.example.tourism.service.BookingService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ========== 管理端接口 ==========

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = bookingService.findByPage(keyword, status, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) {
            return ResultUtil.error("预约记录不存在");
        }
        return ResultUtil.success(booking);
    }

    @PutMapping("/{id}/cancel")
    public ResultUtil cancel(@PathVariable Long id) {
        Booking booking = bookingService.cancel(id);
        return ResultUtil.success("已取消", booking);
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        bookingService.delete(id);
        return ResultUtil.success("删除成功");
    }

    // ========== 小程序公开接口 ==========

    @PostMapping("/public/create")
    public ResultUtil publicCreate(@RequestBody Booking booking) {
        Booking saved = bookingService.create(booking);
        return ResultUtil.success(saved);
    }

    @GetMapping("/public/list")
    public ResultUtil publicList(
            @RequestParam(required = false) String openid,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        Map<String, Object> result = bookingService.findByPage(null, null, page, pageSize);
        return ResultUtil.success(result);
    }

    @PutMapping("/public/cancel/{id}")
    public ResultUtil publicCancel(@PathVariable Long id) {
        Booking booking = bookingService.cancel(id);
        return ResultUtil.success("已取消", booking);
    }
}

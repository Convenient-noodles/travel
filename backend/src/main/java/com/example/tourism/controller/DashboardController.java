package com.example.tourism.controller;

import com.example.tourism.mapper.*;
import com.example.tourism.util.ResultUtil; //【改】导入ResultUtil
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    @Autowired
    private ScenicSpotMapper scenicSpotMapper;

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private HotelMapper hotelMapper;

    @Autowired
    private AdminUserMapper adminUserMapper;

    @GetMapping("/stats")
    public ResultUtil getStats() { // 【改】返回类型改为ResultUtil
        Map<String, Object> result = new HashMap<>();
        result.put("scenicCount", scenicSpotMapper.countByConditions(null, null));
        result.put("foodCount", foodMapper.countByConditions(null, null, null, null));
        result.put("hotelCount", hotelMapper.countByConditions(null, null, null));
        result.put("userCount", adminUserMapper.findAll().size());
        return ResultUtil.success(result); // 【改】使用ResultUtil包装返回
    }
}

package com.example.tourism.service.impl;

import com.example.tourism.entity.Food;
import com.example.tourism.mapper.FoodMapper;
import com.example.tourism.service.FoodService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodMapper foodMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, String category, Integer status, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<Food> list = foodMapper.findByConditions(keyword, region, category, status, offset, pageSize);
        Long total = foodMapper.countByConditions(keyword, region, category, status);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public Food getById(Long id) {
        return foodMapper.findById(id);
    }

    @Override
    @Transactional
    public Food create(Food food) {
        food.setSortOrder(food.getSortOrder() != null ? food.getSortOrder() : 0);
        food.setStatus(food.getStatus() != null ? food.getStatus() : 1);
        food.setCreateTime(new java.util.Date());
        food.setUpdateTime(new java.util.Date());
        
        foodMapper.insert(food);
        return food;
    }

    @Override
    @Transactional
    public Food update(Food food) {
        food.setUpdateTime(new java.util.Date());
        foodMapper.update(food);
        return food;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        foodMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateRecommend(Long id, Integer isRecommended) {
        foodMapper.updateRecommend(id, isRecommended);
    }
}

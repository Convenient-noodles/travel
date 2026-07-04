package com.example.tourism.service;

import com.example.tourism.entity.Food;

import java.util.List;
import java.util.Map;

public interface FoodService {

    Map<String, Object> findByPage(String keyword, String region, String category, Integer status, Integer page,
            Integer pageSize);

    Food getById(Long id);

    Food create(Food food);

    Food update(Food food);

    void delete(Long id);

    void updateRecommend(Long id, Integer isRecommended);
}

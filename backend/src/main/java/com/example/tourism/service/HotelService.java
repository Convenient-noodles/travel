package com.example.tourism.service;

import com.example.tourism.entity.Hotel;

import java.util.List;
import java.util.Map;

public interface HotelService {

    Map<String, Object> findByPage(String keyword, String region, Integer starLevel, Integer page, Integer pageSize);

    Hotel getById(Long id);

    Hotel create(Hotel hotel);

    Hotel update(Hotel hotel);

    void delete(Long id);

    void updateRecommend(Long id, Integer isRecommended);
}

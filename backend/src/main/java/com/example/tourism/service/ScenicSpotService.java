package com.example.tourism.service;

import com.example.tourism.entity.ScenicSpot;

import java.util.List;
import java.util.Map;

public interface ScenicSpotService {

    Map<String, Object> findByPage(String keyword, String region, Integer page, Integer pageSize);

    ScenicSpot getById(Long id);

    ScenicSpot create(ScenicSpot scenicSpot);

    ScenicSpot update(ScenicSpot scenicSpot);

    void delete(Long id);

    void updateRecommend(Long id, Integer isRecommended);

    List<ScenicSpot> findHotScenics();
}

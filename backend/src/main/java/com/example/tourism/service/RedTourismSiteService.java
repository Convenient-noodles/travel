package com.example.tourism.service;

import com.example.tourism.entity.RedTourismSite;

import java.util.Map;

public interface RedTourismSiteService {

    Map<String, Object> findByPage(String keyword, String region, String type, Integer page, Integer pageSize);

    RedTourismSite getById(Long id);

    RedTourismSite create(RedTourismSite redTourismSite);

    RedTourismSite update(RedTourismSite redTourismSite);

    void delete(Long id);

    void updateRecommend(Long id, Integer isRecommended);
}

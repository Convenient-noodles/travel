package com.example.tourism.service;

import com.example.tourism.entity.CultureExperience;

import java.util.Map;

public interface CultureExperienceService {

    Map<String, Object> findByPage(String keyword, String region, String category, Integer page, Integer pageSize);

    CultureExperience getById(Long id);

    CultureExperience create(CultureExperience cultureExperience);

    CultureExperience update(CultureExperience cultureExperience);

    void delete(Long id);

    void updateRecommend(Long id, Integer isRecommended);
}

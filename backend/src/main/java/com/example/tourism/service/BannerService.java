package com.example.tourism.service;

import com.example.tourism.entity.Banner;

import java.util.List;
import java.util.Map;

public interface BannerService {

    List<Banner> findAll();

    List<Banner> findEnabled();
    
    List<Banner> findByPage(Integer page, Integer pageSize);
    
    int count();

    Banner getById(Long id);

    Banner create(Banner banner);

    Banner update(Banner banner);

    void delete(Long id);

    void updateEnabled(Long id, Integer isEnabled);

    void updateSortOrder(Long id, Integer sortOrder);
}

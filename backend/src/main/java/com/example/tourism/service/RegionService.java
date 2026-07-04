package com.example.tourism.service;

import com.example.tourism.entity.Region;

import java.util.List;

public interface RegionService {

    List<Region> findAll();

    List<Region> findByLevel(Integer level);

    Region getById(Long id);

    Region create(Region region);

    Region update(Region region);

    void delete(Long id);

    void updateEnabled(Long id, Integer isEnabled);
}

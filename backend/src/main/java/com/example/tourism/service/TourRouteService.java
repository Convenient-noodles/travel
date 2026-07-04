package com.example.tourism.service;

import com.example.tourism.entity.TourRoute;

import java.util.Map;

public interface TourRouteService {

    Map<String, Object> findByPage(String keyword, String region, Integer days, Integer page, Integer pageSize);

    TourRoute getById(Long id);

    TourRoute create(TourRoute tourRoute);

    TourRoute update(TourRoute tourRoute);

    void delete(Long id);
}

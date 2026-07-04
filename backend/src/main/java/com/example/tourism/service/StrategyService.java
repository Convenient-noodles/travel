package com.example.tourism.service;

import com.example.tourism.entity.Strategy;

import java.util.List;

public interface StrategyService {

    List<Strategy> findAll();

    List<Strategy> findEnabled();

    Strategy getById(Long id);

    Strategy create(Strategy strategy);

    Strategy update(Strategy strategy);

    void delete(Long id);

    void updateViewCount(Long id);

    void updateLikeCount(Long id);

    void updateEnabled(Long id, Integer isEnabled);
}
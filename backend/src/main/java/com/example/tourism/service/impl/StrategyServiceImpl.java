package com.example.tourism.service.impl;

import com.example.tourism.entity.Strategy;
import com.example.tourism.mapper.StrategyMapper;
import com.example.tourism.service.StrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StrategyServiceImpl implements StrategyService {

    private final StrategyMapper strategyMapper;

    @Override
    public List<Strategy> findAll() {
        return strategyMapper.findAll();
    }

    @Override
    public List<Strategy> findEnabled() {
        return strategyMapper.findEnabled();
    }

    @Override
    public Strategy getById(Long id) {
        return strategyMapper.findById(id);
    }

    @Override
    @Transactional
    public Strategy create(Strategy strategy) {
        Date now = new Date();
        strategy.setCreateTime(now);
        strategy.setUpdateTime(now);
        strategyMapper.insert(strategy);
        return strategyMapper.findById(strategy.getId());
    }

    @Override
    @Transactional
    public Strategy update(Strategy strategy) {
        strategy.setUpdateTime(new Date());
        strategyMapper.update(strategy);
        return strategyMapper.findById(strategy.getId());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        strategyMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateViewCount(Long id) {
        strategyMapper.updateViewCount(id);
    }

    @Override
    @Transactional
    public void updateLikeCount(Long id) {
        strategyMapper.updateLikeCount(id);
    }

    @Override
    @Transactional
    public void updateEnabled(Long id, Integer isEnabled) {
        Strategy strategy = strategyMapper.findById(id);
        if (strategy != null) {
            strategy.setIsEnabled(isEnabled);
            strategy.setUpdateTime(new Date());
            strategyMapper.update(strategy);
        }
    }
}
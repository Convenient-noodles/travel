package com.example.tourism.service.impl;

import com.example.tourism.entity.TourRoute;
import com.example.tourism.mapper.TourRouteMapper;
import com.example.tourism.service.TourRouteService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TourRouteServiceImpl implements TourRouteService {

    private final TourRouteMapper tourRouteMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, Integer days, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<TourRoute> list = tourRouteMapper.findByConditions(keyword, region, days, offset, pageSize);
        Long total = tourRouteMapper.countByConditions(keyword, region, days);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public TourRoute getById(Long id) {
        return tourRouteMapper.findById(id);
    }

    @Override
    @Transactional
    public TourRoute create(TourRoute tourRoute) {
        tourRoute.setSortOrder(tourRoute.getSortOrder() != null ? tourRoute.getSortOrder() : 0);
        tourRoute.setStatus(tourRoute.getStatus() != null ? tourRoute.getStatus() : 1);
        tourRoute.setCreateTime(new java.util.Date());
        tourRoute.setUpdateTime(new java.util.Date());
        
        tourRouteMapper.insert(tourRoute);
        return tourRoute;
    }

    @Override
    @Transactional
    public TourRoute update(TourRoute tourRoute) {
        tourRoute.setUpdateTime(new java.util.Date());
        tourRouteMapper.update(tourRoute);
        return tourRoute;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        tourRouteMapper.delete(id);
    }
}

package com.example.tourism.service.impl;

import com.example.tourism.entity.ScenicSpot;
import com.example.tourism.mapper.ScenicSpotMapper;
import com.example.tourism.service.ScenicSpotService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScenicSpotServiceImpl implements ScenicSpotService {

    private final ScenicSpotMapper scenicSpotMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<ScenicSpot> list = scenicSpotMapper.findByConditions(keyword, region, offset, pageSize);
        Long total = scenicSpotMapper.countByConditions(keyword, region);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public ScenicSpot getById(Long id) {
        return scenicSpotMapper.findById(id);
    }

    @Override
    @Transactional
    public ScenicSpot create(ScenicSpot scenicSpot) {
        scenicSpot.setVisitCount(0);
        scenicSpot.setLikeCount(0);
        scenicSpot.setSortOrder(scenicSpot.getSortOrder() != null ? scenicSpot.getSortOrder() : 0);
        scenicSpot.setStatus(scenicSpot.getStatus() != null ? scenicSpot.getStatus() : 1);
        scenicSpot.setCreateTime(new java.util.Date());
        scenicSpot.setUpdateTime(new java.util.Date());

        scenicSpotMapper.insert(scenicSpot);
        // 【改】确保返回的实体包含正确的id（MyBatis 会自动回填自增ID）
        return scenicSpot;
    }

    @Override
    @Transactional
    public ScenicSpot update(ScenicSpot scenicSpot) {
        scenicSpot.setUpdateTime(new java.util.Date());
        scenicSpotMapper.update(scenicSpot);
        return scenicSpot;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        scenicSpotMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateRecommend(Long id, Integer isRecommended) {
        scenicSpotMapper.updateRecommend(id, isRecommended);
    }

    @Override
    public List<ScenicSpot> findHotScenics() {
        return scenicSpotMapper.findHotScenics();
    }
}

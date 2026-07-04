package com.example.tourism.service.impl;

import com.example.tourism.entity.RedTourismSite;
import com.example.tourism.mapper.RedTourismSiteMapper;
import com.example.tourism.service.RedTourismSiteService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RedTourismSiteServiceImpl implements RedTourismSiteService {

    private final RedTourismSiteMapper redTourismSiteMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, String type, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<RedTourismSite> list = redTourismSiteMapper.findByConditions(keyword, region, type, offset, pageSize);
        Long total = redTourismSiteMapper.countByConditions(keyword, region, type);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public RedTourismSite getById(Long id) {
        return redTourismSiteMapper.findById(id);
    }

    @Override
    @Transactional
    public RedTourismSite create(RedTourismSite redTourismSite) {
        redTourismSite.setVisitCount(0);
        redTourismSite.setSortOrder(redTourismSite.getSortOrder() != null ? redTourismSite.getSortOrder() : 0);
        redTourismSite.setStatus(redTourismSite.getStatus() != null ? redTourismSite.getStatus() : 1);
        redTourismSite.setCreateTime(new java.util.Date());
        redTourismSite.setUpdateTime(new java.util.Date());
        
        redTourismSiteMapper.insert(redTourismSite);
        return redTourismSite;
    }

    @Override
    @Transactional
    public RedTourismSite update(RedTourismSite redTourismSite) {
        redTourismSite.setUpdateTime(new java.util.Date());
        redTourismSiteMapper.update(redTourismSite);
        return redTourismSite;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        redTourismSiteMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateRecommend(Long id, Integer isRecommended) {
        redTourismSiteMapper.updateRecommend(id, isRecommended);
    }
}

package com.example.tourism.service.impl;

import com.example.tourism.entity.CultureExperience;
import com.example.tourism.mapper.CultureExperienceMapper;
import com.example.tourism.service.CultureExperienceService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CultureExperienceServiceImpl implements CultureExperienceService {

    private final CultureExperienceMapper cultureExperienceMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, String category, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<CultureExperience> list = cultureExperienceMapper.findByConditions(keyword, region, category, offset, pageSize);
        Long total = cultureExperienceMapper.countByConditions(keyword, region, category);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public CultureExperience getById(Long id) {
        return cultureExperienceMapper.findById(id);
    }

    @Override
    @Transactional
    public CultureExperience create(CultureExperience cultureExperience) {
        cultureExperience.setSortOrder(cultureExperience.getSortOrder() != null ? cultureExperience.getSortOrder() : 0);
        cultureExperience.setStatus(cultureExperience.getStatus() != null ? cultureExperience.getStatus() : 1);
        cultureExperience.setCreateTime(new java.util.Date());
        cultureExperience.setUpdateTime(new java.util.Date());
        
        cultureExperienceMapper.insert(cultureExperience);
        return cultureExperience;
    }

    @Override
    @Transactional
    public CultureExperience update(CultureExperience cultureExperience) {
        cultureExperience.setUpdateTime(new java.util.Date());
        cultureExperienceMapper.update(cultureExperience);
        return cultureExperience;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        cultureExperienceMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateRecommend(Long id, Integer isRecommended) {
        cultureExperienceMapper.updateRecommend(id, isRecommended);
    }
}

package com.example.tourism.service.impl;

import com.example.tourism.entity.Region;
import com.example.tourism.mapper.RegionMapper;
import com.example.tourism.service.RegionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionServiceImpl implements RegionService {

    private final RegionMapper regionMapper;

    @Override
    public List<Region> findAll() {
        return regionMapper.findByLevel(1);
    }

    @Override
    public List<Region> findByLevel(Integer level) {
        return regionMapper.findByLevel(level);
    }

    @Override
    public Region getById(Long id) {
        return regionMapper.findById(id);
    }

    @Override
    @Transactional
    public Region create(Region region) {
        Date now = new Date(); //【改】设置创建时间
        region.setCreateTime(now);
        region.setUpdateTime(now);
        regionMapper.insert(region);
        return regionMapper.findById(region.getId());
    }

    @Override
    @Transactional
    public Region update(Region region) {
        region.setUpdateTime(new Date()); //【改】设置更新时间
        regionMapper.update(region);
        return regionMapper.findById(region.getId());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        regionMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateEnabled(Long id, Integer isEnabled) {
        Region region = regionMapper.findById(id);
        if (region != null) {
            region.setIsEnabled(isEnabled);
            region.setUpdateTime(new Date()); //【改】设置更新时间
            regionMapper.update(region);
        }
    }
}

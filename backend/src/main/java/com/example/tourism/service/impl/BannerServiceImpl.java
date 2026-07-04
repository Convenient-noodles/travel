package com.example.tourism.service.impl;

import com.example.tourism.entity.Banner;
import com.example.tourism.mapper.BannerMapper;
import com.example.tourism.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerMapper bannerMapper;

    @Override
    public List<Banner> findAll() {
        return bannerMapper.findAll();
    }

    @Override
    public List<Banner> findEnabled() {
        return bannerMapper.findEnabled();
    }

    @Override
    public List<Banner> findByPage(Integer page, Integer pageSize) {
        Integer offset = (page - 1) * pageSize;
        return bannerMapper.findByPage(offset, pageSize);
    }

    @Override
    public int count() {
        return bannerMapper.count();
    }

    @Override
    public Banner getById(Long id) {
        return bannerMapper.findById(id);
    }

    @Override
    @Transactional
    public Banner create(Banner banner) {
        banner.setSort(banner.getSort() != null ? banner.getSort() : 0);
        banner.setEnabled(banner.getEnabled() != null ? banner.getEnabled() : 1);

        bannerMapper.insert(banner);
        return banner;
    }

    @Override
    @Transactional
    public Banner update(Banner banner) {
        bannerMapper.update(banner);
        return banner;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        bannerMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateEnabled(Long id, Integer isEnabled) {
        bannerMapper.updateEnabled(id, isEnabled);
    }

    @Override
    @Transactional
    public void updateSortOrder(Long id, Integer sortOrder) {
        bannerMapper.updateSortOrder(id, sortOrder);
    }
}

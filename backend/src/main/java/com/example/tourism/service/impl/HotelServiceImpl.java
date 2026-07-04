package com.example.tourism.service.impl;

import com.example.tourism.entity.Hotel;
import com.example.tourism.mapper.HotelMapper;
import com.example.tourism.service.HotelService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelMapper hotelMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String region, Integer starLevel, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<Hotel> list = hotelMapper.findByConditions(keyword, region, starLevel, offset, pageSize);
        Long total = hotelMapper.countByConditions(keyword, region, starLevel);
        return ResultUtil.pageResult(list, total);
    }

    @Override
    public Hotel getById(Long id) {
        return hotelMapper.findById(id);
    }

    @Override
    @Transactional
    public Hotel create(Hotel hotel) {
        hotel.setSortOrder(hotel.getSortOrder() != null ? hotel.getSortOrder() : 0);
        hotel.setStatus(hotel.getStatus() != null ? hotel.getStatus() : 1);
        hotel.setCreateTime(new java.util.Date());
        hotel.setUpdateTime(new java.util.Date());
        
        hotelMapper.insert(hotel);
        return hotel;
    }

    @Override
    @Transactional
    public Hotel update(Hotel hotel) {
        hotel.setUpdateTime(new java.util.Date());
        hotelMapper.update(hotel);
        return hotel;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        hotelMapper.delete(id);
    }

    @Override
    @Transactional
    public void updateRecommend(Long id, Integer isRecommended) {
        hotelMapper.updateRecommend(id, isRecommended);
    }
}

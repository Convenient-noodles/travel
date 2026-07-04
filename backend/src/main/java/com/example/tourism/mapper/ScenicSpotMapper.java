package com.example.tourism.mapper;

import com.example.tourism.entity.ScenicSpot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ScenicSpotMapper {

    List<ScenicSpot> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
            @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region);

    ScenicSpot findById(@Param("id") Long id);

    int insert(ScenicSpot scenicSpot);

    int update(ScenicSpot scenicSpot);

    int delete(@Param("id") Long id);

    int updateRecommend(@Param("id") Long id, @Param("isRecommended") Integer isRecommended);

    int updateVisitCount(@Param("id") Long id);

    List<ScenicSpot> findHotScenics();
}

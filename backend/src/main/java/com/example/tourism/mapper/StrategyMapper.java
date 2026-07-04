package com.example.tourism.mapper;

import com.example.tourism.entity.Strategy;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StrategyMapper {

    List<Strategy> findAll();

    List<Strategy> findEnabled();

    Strategy findById(@Param("id") Long id);

    int insert(Strategy strategy);

    int update(Strategy strategy);

    int delete(@Param("id") Long id);

    int updateViewCount(@Param("id") Long id);

    int updateLikeCount(@Param("id") Long id);
}
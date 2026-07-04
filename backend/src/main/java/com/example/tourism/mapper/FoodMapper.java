package com.example.tourism.mapper;

import com.example.tourism.entity.Food;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FoodMapper {

    List<Food> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
                                @Param("category") String category, @Param("status") Integer status,
                                @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region,
                          @Param("category") String category, @Param("status") Integer status);

    Food findById(@Param("id") Long id);

    int insert(Food food);

    int update(Food food);

    int delete(@Param("id") Long id);

    int updateRecommend(@Param("id") Long id, @Param("isRecommended") Integer isRecommended);
}

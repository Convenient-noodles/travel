package com.example.tourism.mapper;

import com.example.tourism.entity.Hotel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HotelMapper {

    List<Hotel> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
                                 @Param("starLevel") Integer starLevel,
                                 @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region,
                          @Param("starLevel") Integer starLevel);

    Hotel findById(@Param("id") Long id);

    int insert(Hotel hotel);

    int update(Hotel hotel);

    int delete(@Param("id") Long id);

    int updateRecommend(@Param("id") Long id, @Param("isRecommended") Integer isRecommended);
}

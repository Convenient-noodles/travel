package com.example.tourism.mapper;

import com.example.tourism.entity.TourRoute;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TourRouteMapper {

    List<TourRoute> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
                                     @Param("days") Integer days,
                                     @Param("offset") Integer offset, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region,
                          @Param("days") Integer days);

    TourRoute findById(@Param("id") Long id);

    int insert(TourRoute tourRoute);

    int update(TourRoute tourRoute);

    int delete(@Param("id") Long id);
}

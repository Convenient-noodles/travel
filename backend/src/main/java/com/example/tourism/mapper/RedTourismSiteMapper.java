package com.example.tourism.mapper;

import com.example.tourism.entity.RedTourismSite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RedTourismSiteMapper {

    List<RedTourismSite> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
                                          @Param("type") String type,
                                          @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region,
                          @Param("type") String type);

    RedTourismSite findById(@Param("id") Long id);

    int insert(RedTourismSite redTourismSite);

    int update(RedTourismSite redTourismSite);

    int delete(@Param("id") Long id);

    int updateRecommend(@Param("id") Long id, @Param("isRecommended") Integer isRecommended);
}

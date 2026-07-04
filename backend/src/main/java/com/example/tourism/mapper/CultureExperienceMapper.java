package com.example.tourism.mapper;

import com.example.tourism.entity.CultureExperience;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CultureExperienceMapper {

    List<CultureExperience> findByConditions(@Param("keyword") String keyword, @Param("region") String region,
                                             @Param("category") String category,
                                             @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("region") String region,
                          @Param("category") String category);

    CultureExperience findById(@Param("id") Long id);

    int insert(CultureExperience cultureExperience);

    int update(CultureExperience cultureExperience);

    int delete(@Param("id") Long id);

    int updateRecommend(@Param("id") Long id, @Param("isRecommended") Integer isRecommended);
}

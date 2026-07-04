package com.example.tourism.mapper;

import com.example.tourism.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OperationLogMapper {

    int insert(OperationLog operationLog);

    List<OperationLog> findByConditions(@Param("userId") Long userId, @Param("module") String module,
                                        @Param("startTime") java.util.Date startTime,
                                        @Param("endTime") java.util.Date endTime,
                                        @Param("page") Integer page, @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("userId") Long userId, @Param("module") String module,
                          @Param("startTime") java.util.Date startTime, @Param("endTime") java.util.Date endTime);

    int deleteByIds(@Param("ids") List<Long> ids);
}

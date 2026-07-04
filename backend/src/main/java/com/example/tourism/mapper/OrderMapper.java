package com.example.tourism.mapper;

import com.example.tourism.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {

    List<Order> findByConditions(@Param("keyword") String keyword,
                                 @Param("status") String status,
                                 @Param("page") Integer page,
                                 @Param("pageSize") Integer pageSize);

    Long countByConditions(@Param("keyword") String keyword, @Param("status") String status);

    Order findById(@Param("id") Long id);

    Order findByOrderNo(@Param("orderNo") String orderNo);

    int insert(Order order);

    int update(Order order);

    int delete(@Param("id") Long id);

    int updateStatus(@Param("id") Long id, @Param("status") String status);
}

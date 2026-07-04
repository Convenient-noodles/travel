package com.example.tourism.mapper;

import com.example.tourism.entity.Booking;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BookingMapper {

    List<Booking> findByConditions(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize);

    Long countByConditions(
            @Param("keyword") String keyword,
            @Param("status") String status);

    Booking findById(@Param("id") Long id);

    int insert(Booking booking);

    int updateStatus(
            @Param("id") Long id,
            @Param("status") String status);

    int delete(@Param("id") Long id);
}

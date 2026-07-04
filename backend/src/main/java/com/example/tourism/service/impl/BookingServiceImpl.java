package com.example.tourism.service.impl;

import com.example.tourism.entity.Booking;
import com.example.tourism.mapper.BookingMapper;
import com.example.tourism.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingMapper bookingMapper;

    @Override
    public Map<String, Object> findByPage(String keyword, String status,
                                           Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        List<Booking> list = bookingMapper.findByConditions(keyword, status, offset, pageSize);
        Long total = bookingMapper.countByConditions(keyword, status);
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        return result;
    }

    @Override
    public Booking getById(Long id) {
        return bookingMapper.findById(id);
    }

    @Override
    @Transactional
    public Booking create(Booking booking) {
        if (booking.getStatus() == null) {
            booking.setStatus("confirmed");
        }
        booking.setCreateTime(new Date());
        booking.setUpdateTime(new Date());
        bookingMapper.insert(booking);
        return booking;
    }

    @Override
    @Transactional
    public Booking cancel(Long id) {
        Booking booking = bookingMapper.findById(id);
        if (booking == null) {
            throw new RuntimeException("预约记录不存在或已被删除");
        }
        bookingMapper.updateStatus(id, "cancelled");
        booking.setStatus("cancelled");
        return booking;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        bookingMapper.delete(id);
    }
}

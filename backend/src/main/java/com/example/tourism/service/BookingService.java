package com.example.tourism.service;

import com.example.tourism.entity.Booking;

import java.util.Map;

public interface BookingService {

    Map<String, Object> findByPage(String keyword, String status, Integer page, Integer pageSize);

    Booking getById(Long id);

    Booking create(Booking booking);

    Booking cancel(Long id);

    void delete(Long id);
}

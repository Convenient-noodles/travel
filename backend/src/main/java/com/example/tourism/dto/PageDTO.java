package com.example.tourism.dto;

import lombok.Data;

@Data
public class PageDTO {

    private Integer page = 1;
    private Integer pageSize = 10;
    private String keyword;
    private String region;
}

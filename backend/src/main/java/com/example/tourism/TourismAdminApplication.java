package com.example.tourism;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@MapperScan("com.example.tourism.mapper")
@ServletComponentScan //【改】添加Servlet组件扫描，支持@WebFilter注解
public class TourismAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(TourismAdminApplication.class, args);
    }
}

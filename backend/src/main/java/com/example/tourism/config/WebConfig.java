package com.example.tourism.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path:./uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置 /uploads/** 路径的静态资源映射
        String resourceLocation = uploadDir.endsWith("/") ? "file:" + uploadDir : "file:" + uploadDir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);

        // 添加对常见图片文件扩展名的支持，防止直接访问文件名
        registry.addResourceHandler("/images/**")
                .addResourceLocations(resourceLocation);
        registry.addResourceHandler("/*.jpg")
                .addResourceLocations(resourceLocation);
        registry.addResourceHandler("/*.jpeg")
                .addResourceLocations(resourceLocation);
        registry.addResourceHandler("/*.png")
                .addResourceLocations(resourceLocation);
        registry.addResourceHandler("/*.gif")
                .addResourceLocations(resourceLocation);
        registry.addResourceHandler("/*.webp")
                .addResourceLocations(resourceLocation);
    }

    //【改】添加UTF-8字符编码配置
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 配置String类型消息转换器为UTF-8
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        converters.add(stringConverter);

        // 配置JSON消息转换器为UTF-8
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(jsonConverter);
    }
}

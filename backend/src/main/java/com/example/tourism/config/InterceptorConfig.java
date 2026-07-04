package com.example.tourism.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns("/api/admin/login")
                .excludePathPatterns("/api/admin/scenics/public/**")
                .excludePathPatterns("/api/admin/foods/public/**")
                .excludePathPatterns("/api/admin/hotels/public/**")
                .excludePathPatterns("/api/admin/cultures/public/**")
                .excludePathPatterns("/api/admin/red-tourisms/public/**")
                .excludePathPatterns("/api/admin/routes/public/**")
                .excludePathPatterns("/api/admin/banners/enabled")
                .excludePathPatterns("/api/admin/strategies/enabled") // 【改】添加攻略公开接口
                .excludePathPatterns("/api/admin/strategies/*") // 【改】允许公开访问单个攻略详情
                .excludePathPatterns("/api/admin/dashboard/**") //【改】添加dashboard公开接口
                .excludePathPatterns("/api/admin/orders/public/**")
                .excludePathPatterns("/api/admin/bookings/public/**")
                .excludePathPatterns("/api/upload");
    }
}

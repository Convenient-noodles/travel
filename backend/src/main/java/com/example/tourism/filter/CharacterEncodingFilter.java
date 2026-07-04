package com.example.tourism.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 字符编码过滤器，强制设置UTF-8编码
 */
@WebFilter(urlPatterns = "/*")
public class CharacterEncodingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 设置请求编码为UTF-8
        request.setCharacterEncoding(StandardCharsets.UTF_8.name());
        // 设置响应编码为UTF-8
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        chain.doFilter(request, response);
    }
}

package com.example.tourism.config;

import com.example.tourism.util.JwtUtil;
import com.example.tourism.util.ResultUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.PrintWriter;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String token = request.getHeader("Authorization");

        if (token == null || token.isEmpty()) {
            response.setContentType("application/json;charset=UTF-8");
            PrintWriter writer = response.getWriter();
            writer.write(new ObjectMapper().writeValueAsString(ResultUtil.unauthorized("请先登录")));
            writer.flush();
            writer.close();
            return false;
        }

        if (!token.startsWith("Bearer ")) {
            response.setContentType("application/json;charset=UTF-8");
            PrintWriter writer = response.getWriter();
            writer.write(new ObjectMapper().writeValueAsString(ResultUtil.unauthorized("token格式错误")));
            writer.flush();
            writer.close();
            return false;
        }

        token = token.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                response.setContentType("application/json;charset=UTF-8");
                PrintWriter writer = response.getWriter();
                writer.write(new ObjectMapper().writeValueAsString(ResultUtil.unauthorized("token已过期")));
                writer.flush();
                writer.close();
                return false;
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            request.setAttribute("userId", userId);
            request.setAttribute("username", username);
            request.setAttribute("role", role);

            return true;
        } catch (Exception e) {
            response.setContentType("application/json;charset=UTF-8");
            PrintWriter writer = response.getWriter();
            writer.write(new ObjectMapper().writeValueAsString(ResultUtil.unauthorized("token无效")));
            writer.flush();
            writer.close();
            return false;
        }
    }
}

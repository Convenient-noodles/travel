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
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private void writeUnauthorized(HttpServletResponse response, String message) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter writer = response.getWriter();
        writer.write(OBJECT_MAPPER.writeValueAsString(ResultUtil.unauthorized(message)));
        writer.flush();
        writer.close();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String token = request.getHeader("Authorization");

        if (token == null || token.isEmpty()) {
            writeUnauthorized(response, "请先登录");
            return false;
        }

        if (!token.startsWith("Bearer ")) {
            writeUnauthorized(response, "token格式错误");
            return false;
        }

        token = token.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                writeUnauthorized(response, "token已过期");
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
            writeUnauthorized(response, "token无效");
            return false;
        }
    }
}

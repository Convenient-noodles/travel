package com.example.tourism.util;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class ResultUtil {

    private Integer code;
    private String message;
    private Object data;
    private Long total;

    private ResultUtil(Integer code, String message, Object data, Long total) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.total = total;
    }

    public static ResultUtil success() {
        return new ResultUtil(200, "操作成功", null, null);
    }

    public static ResultUtil success(Object data) {
        return new ResultUtil(200, "操作成功", data, null);
    }

    public static ResultUtil success(Object data, Long total) {
        return new ResultUtil(200, "操作成功", data, total);
    }

    public static ResultUtil success(String message, Object data) {
        return new ResultUtil(200, message, data, null);
    }

    public static ResultUtil error(String message) {
        return new ResultUtil(500, message, null, null);
    }

    public static ResultUtil error(Integer code, String message) {
        return new ResultUtil(code, message, null, null);
    }

    public static ResultUtil unauthorized(String message) {
        return new ResultUtil(401, message, null, null);
    }

    public static ResultUtil forbidden(String message) {
        return new ResultUtil(403, message, null, null);
    }

    public static Map<String, Object> pageResult(Object list, Long total) {
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        return result;
    }
}

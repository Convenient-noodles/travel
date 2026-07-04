package com.example.tourism.controller;

import com.example.tourism.util.ResultUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * 微信小程序登录 — 通过 wx.login 返回的临时 code 换取真实 openid
 */
@RestController
@RequestMapping("/api/public/wx")
public class WxLoginController {

    @Value("${wx.app-id:}")
    private String appId;

    @Value("${wx.app-secret:}")
    private String appSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 用 wx.login 返回的临时 code 换取真实 openid
     * POST /api/public/wx/login  { code: "xxx" }
     * → { code: 200, data: { openid: "oXXXX..." } }
     */
    @PostMapping("/login")
    public ResultUtil login(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        if (code == null || code.isBlank()) {
            return ResultUtil.error("缺少登录凭证 code");
        }

        // 调用微信官方接口换取 openid
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            appId, appSecret, code
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> wxResp = restTemplate.getForObject(url, Map.class);
            if (wxResp == null) {
                return ResultUtil.error("微信服务无响应");
            }
            // 微信返回的错误码
            if (wxResp.containsKey("errcode") && (int) wxResp.get("errcode") != 0) {
                return ResultUtil.error("微信登录失败: " + wxResp.getOrDefault("errmsg", "未知错误"));
            }

            String openid = (String) wxResp.get("openid");
            String sessionKey = (String) wxResp.get("session_key");

            Map<String, String> data = new HashMap<>();
            data.put("openid", openid);
            // session_key 仅后端使用，不返回给前端
            return ResultUtil.success(data);

        } catch (Exception e) {
            return ResultUtil.error("微信服务调用异常，请稍后重试");
        }
    }
}

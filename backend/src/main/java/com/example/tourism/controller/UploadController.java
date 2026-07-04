package com.example.tourism.controller;

import com.example.tourism.util.ResultUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Value("${upload.path:./uploads}")
    private String uploadDir;

    // 🔒 单文件上传大小限制：5MB
    private static final long MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

    @PostMapping("/upload")
    public ResultUtil upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResultUtil.error("请选择要上传的文件");
        }

        // 🔒 校验文件大小
        if (file.getSize() > MAX_UPLOAD_SIZE) {
            return ResultUtil.error("文件大小不能超过5MB");
        }

        // 检查文件类型（扩展名白名单 + MIME 类型校验）
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
            return ResultUtil.error("只支持jpg、jpeg、png、gif、webp格式的图片");
        }
        // 二次校验 MIME 类型，防止伪造扩展名
        String contentType = file.getContentType();
        if (contentType == null || !contentType.matches("image/(jpeg|png|gif|webp)")) {
            return ResultUtil.error("只支持JPG、PNG、GIF、WebP格式的图片");
        }

        try {
            // 确保上传目录存在（使用绝对路径）
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // 生成唯一文件名
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);

            // 保存文件
            file.transferTo(filePath.toFile());

            // 返回访问URL
            String url = "http://localhost:8080/uploads/" + newFilename;
            return ResultUtil.success(url);
        } catch (IOException e) {
            e.printStackTrace();
            return ResultUtil.error("文件上传失败");
        }
    }
}

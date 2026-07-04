package com.example.tourism.controller;

import com.example.tourism.entity.CultureExperience;
import com.example.tourism.service.CultureExperienceService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/cultures")
@RequiredArgsConstructor
public class CultureExperienceController {

    private final CultureExperienceService cultureExperienceService;

    @Value("${upload.path:./uploads}")
    private String uploadDir;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = cultureExperienceService.findByPage(keyword, region, category, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        CultureExperience culture = cultureExperienceService.getById(id);
        if (culture == null) {
            return ResultUtil.error("文化体验不存在");
        }
        return ResultUtil.success(culture);
    }

    @PostMapping("/json")
    public ResultUtil createJson(@RequestBody CultureExperience cultureExperience) {
        cultureExperience.setStatus(cultureExperience.getStatus() != null ? cultureExperience.getStatus() : 1);
        cultureExperience.setSortOrder(cultureExperience.getSortOrder() != null ? cultureExperience.getSortOrder() : 0);
        cultureExperience.setIsRecommended(cultureExperience.getIsRecommended() != null ? cultureExperience.getIsRecommended() : 0);
        cultureExperience.setCreateTime(new Date());
        cultureExperience.setUpdateTime(new Date());
        
        CultureExperience culture = cultureExperienceService.create(cultureExperience);
        return ResultUtil.success("创建成功", culture);
    }

    @PutMapping("/{id}/json")
    public ResultUtil updateJson(@PathVariable Long id, @RequestBody CultureExperience cultureExperience) {
        CultureExperience existing = cultureExperienceService.getById(id);
        if (existing == null) {
            return ResultUtil.error("文化体验不存在");
        }
        
        cultureExperience.setId(id);
        cultureExperience.setUpdateTime(new Date());
        
        CultureExperience culture = cultureExperienceService.update(cultureExperience);
        return ResultUtil.success("更新成功", culture);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResultUtil create(
            @RequestParam("name") String name,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "highlights", required = false) String highlights,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images) {

        CultureExperience cultureExperience = new CultureExperience();
        cultureExperience.setName(name);
        cultureExperience.setRegion(region);
        cultureExperience.setCategory(category);
        cultureExperience.setDuration(duration);
        cultureExperience.setDescription(description);
        cultureExperience.setHighlights(highlights);
        cultureExperience.setTags(tags);
        cultureExperience.setImages(images);
        cultureExperience.setStatus(1);
        cultureExperience.setSortOrder(0);
        cultureExperience.setIsRecommended(0);
        cultureExperience.setCreateTime(new Date());
        cultureExperience.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            cultureExperience.setCoverImage(imageUrl);
        }

        CultureExperience culture = cultureExperienceService.create(cultureExperience);
        return ResultUtil.success("创建成功", culture);
    }

    @PostMapping("/with-image")
    public ResultUtil createWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images) {

        CultureExperience cultureExperience = new CultureExperience();
        cultureExperience.setName(name);
        cultureExperience.setRegion(region);
        cultureExperience.setCategory(category);
        cultureExperience.setDuration(duration);
        cultureExperience.setDescription(description);
        cultureExperience.setImages(images);
        cultureExperience.setStatus(1);
        cultureExperience.setSortOrder(0);
        cultureExperience.setIsRecommended(0);
        cultureExperience.setCreateTime(new Date());
        cultureExperience.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            cultureExperience.setCoverImage(imageUrl);
        }

        CultureExperience culture = cultureExperienceService.create(cultureExperience);
        return ResultUtil.success("创建成功", culture);
    }

    @PutMapping("/{id}/with-image")
    public ResultUtil updateWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images) {

        CultureExperience cultureExperience = cultureExperienceService.getById(id);
        if (cultureExperience == null) {
            return ResultUtil.error("文化体验不存在");
        }

        cultureExperience.setName(name);
        cultureExperience.setRegion(region);
        cultureExperience.setCategory(category);
        cultureExperience.setDuration(duration);
        cultureExperience.setDescription(description);
        if (images != null) {
            cultureExperience.setImages(images);
        }
        cultureExperience.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            cultureExperience.setCoverImage(imageUrl);
        }

        CultureExperience culture = cultureExperienceService.update(cultureExperience);
        return ResultUtil.success("更新成功", culture);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResultUtil update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "highlights", required = false) String highlights,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images,
            @RequestParam(value = "isRecommended", required = false) Integer isRecommended,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            @RequestParam(value = "status", required = false) Integer status) {

        CultureExperience cultureExperience = cultureExperienceService.getById(id);
        if (cultureExperience == null) {
            return ResultUtil.error("文化体验不存在");
        }

        cultureExperience.setName(name);
        cultureExperience.setRegion(region);
        cultureExperience.setCategory(category);
        cultureExperience.setDuration(duration);
        cultureExperience.setDescription(description);
        cultureExperience.setHighlights(highlights);
        cultureExperience.setTags(tags);
        if (images != null) {
            cultureExperience.setImages(images);
        }
        if (isRecommended != null) {
            cultureExperience.setIsRecommended(isRecommended);
        }
        if (sortOrder != null) {
            cultureExperience.setSortOrder(sortOrder);
        }
        if (status != null) {
            cultureExperience.setStatus(status);
        }
        cultureExperience.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            cultureExperience.setCoverImage(imageUrl);
        }

        CultureExperience culture = cultureExperienceService.update(cultureExperience);
        return ResultUtil.success("更新成功", culture);
    }

    private String uploadFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            return "http://localhost:8080/uploads/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        cultureExperienceService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/recommend")
    public ResultUtil updateRecommend(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isRecommended = params.get("isRecommended");
        cultureExperienceService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }

    // 小程序公开接口
    @GetMapping("/public/list")
    public ResultUtil getListForApp(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = cultureExperienceService.findByPage(keyword, region, null, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/{id}")
    public ResultUtil getByIdForApp(@PathVariable Long id) {
        CultureExperience culture = cultureExperienceService.getById(id);
        if (culture == null) {
            return ResultUtil.error("文化体验不存在");
        }
        return ResultUtil.success(culture);
    }
}

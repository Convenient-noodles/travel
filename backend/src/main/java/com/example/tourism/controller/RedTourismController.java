package com.example.tourism.controller;

import com.example.tourism.entity.RedTourismSite;
import com.example.tourism.service.RedTourismSiteService;
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
@RequestMapping("/api/admin/red-tourisms")
@RequiredArgsConstructor
public class RedTourismController {

    private final RedTourismSiteService redTourismSiteService;

    @Value("${upload.path:./uploads}")
    private String uploadDir;

    @GetMapping
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = redTourismSiteService.findByPage(keyword, region, type, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        RedTourismSite site = redTourismSiteService.getById(id);
        if (site == null) {
            return ResultUtil.error("红色旅游站点不存在");
        }
        return ResultUtil.success(site);
    }

    @PostMapping("/json")
    public ResultUtil createJson(@RequestBody RedTourismSite redTourismSite) {
        redTourismSite.setStatus(redTourismSite.getStatus() != null ? redTourismSite.getStatus() : 1);
        redTourismSite.setSortOrder(redTourismSite.getSortOrder() != null ? redTourismSite.getSortOrder() : 0);
        redTourismSite
                .setIsRecommended(redTourismSite.getIsRecommended() != null ? redTourismSite.getIsRecommended() : 0);
        redTourismSite.setCreateTime(new Date());
        redTourismSite.setUpdateTime(new Date());

        RedTourismSite site = redTourismSiteService.create(redTourismSite);
        return ResultUtil.success("创建成功", site);
    }

    @PutMapping("/{id}/json")
    public ResultUtil updateJson(@PathVariable Long id, @RequestBody RedTourismSite redTourismSite) {
        RedTourismSite existing = redTourismSiteService.getById(id);
        if (existing == null) {
            return ResultUtil.error("红色旅游站点不存在");
        }

        redTourismSite.setId(id);
        redTourismSite.setUpdateTime(new Date());

        RedTourismSite site = redTourismSiteService.update(redTourismSite);
        return ResultUtil.success("更新成功", site);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResultUtil create(
            @RequestParam("name") String name,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "openTime", required = false) String openTime,
            @RequestParam(value = "ticketInfo", required = false) String ticketInfo,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "historyBackground", required = false) String historyBackground,
            @RequestParam(value = "historySignificance", required = false) String historySignificance,
            @RequestParam(value = "tips", required = false) String tips,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images) {

        RedTourismSite redTourismSite = new RedTourismSite();
        redTourismSite.setName(name);
        redTourismSite.setType(type);
        redTourismSite.setRegion(region);
        redTourismSite.setOpenTime(openTime);
        redTourismSite.setTicketInfo(ticketInfo);
        redTourismSite.setDescription(description);
        redTourismSite.setHistory(historyBackground);
        redTourismSite.setSignificance(historySignificance);
        redTourismSite.setTips(tips);
        if (latitude != null) {
            redTourismSite.setLatitude(java.math.BigDecimal.valueOf(latitude));
        }
        if (longitude != null) {
            redTourismSite.setLongitude(java.math.BigDecimal.valueOf(longitude));
        }
        redTourismSite.setImages(images);
        redTourismSite.setStatus(1);
        redTourismSite.setSortOrder(0);
        redTourismSite.setIsRecommended(0);
        redTourismSite.setCreateTime(new Date());
        redTourismSite.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            redTourismSite.setCoverImage(imageUrl);
        }

        RedTourismSite site = redTourismSiteService.create(redTourismSite);
        return ResultUtil.success("创建成功", site);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResultUtil update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "openTime", required = false) String openTime,
            @RequestParam(value = "ticketInfo", required = false) String ticketInfo,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "historyBackground", required = false) String historyBackground,
            @RequestParam(value = "historySignificance", required = false) String historySignificance,
            @RequestParam(value = "tips", required = false) String tips,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam(value = "images", required = false) String images,
            @RequestParam(value = "isRecommended", required = false) Integer isRecommended,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            @RequestParam(value = "status", required = false) Integer status) {

        RedTourismSite redTourismSite = redTourismSiteService.getById(id);
        if (redTourismSite == null) {
            return ResultUtil.error("红色旅游站点不存在");
        }

        redTourismSite.setName(name);
        redTourismSite.setType(type);
        redTourismSite.setRegion(region);
        redTourismSite.setOpenTime(openTime);
        redTourismSite.setTicketInfo(ticketInfo);
        redTourismSite.setDescription(description);
        redTourismSite.setHistory(historyBackground);
        redTourismSite.setSignificance(historySignificance);
        redTourismSite.setTips(tips);
        if (latitude != null) {
            redTourismSite.setLatitude(java.math.BigDecimal.valueOf(latitude));
        }
        if (longitude != null) {
            redTourismSite.setLongitude(java.math.BigDecimal.valueOf(longitude));
        }
        if (images != null) {
            redTourismSite.setImages(images);
        }
        if (isRecommended != null) {
            redTourismSite.setIsRecommended(isRecommended);
        }
        if (sortOrder != null) {
            redTourismSite.setSortOrder(sortOrder);
        }
        if (status != null) {
            redTourismSite.setStatus(status);
        }
        redTourismSite.setUpdateTime(new Date());

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = uploadFile(coverImage);
            redTourismSite.setCoverImage(imageUrl);
        }

        RedTourismSite site = redTourismSiteService.update(redTourismSite);
        return ResultUtil.success("更新成功", site);
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
        redTourismSiteService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/{id}/recommend")
    public ResultUtil updateRecommend(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isRecommended = params.get("isRecommended");
        redTourismSiteService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }


    // 小程序公开接口
    @GetMapping("/public/list")
    public ResultUtil getListForApp(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = redTourismSiteService.findByPage(keyword, region, null, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/public/{id}")
    public ResultUtil getByIdForApp(@PathVariable Long id) {
        RedTourismSite site = redTourismSiteService.getById(id);
        if (site == null) {
            return ResultUtil.error("红色旅游站点不存在");
        }
        return ResultUtil.success(site);
    }
}

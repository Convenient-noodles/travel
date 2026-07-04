package com.example.tourism.controller;

import com.example.tourism.entity.Food;
import com.example.tourism.service.FoodService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    // 管理员后台接口
    @GetMapping("/admin/foods")
    public ResultUtil getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = foodService.findByPage(keyword, region, category, status, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/admin/foods/{id}")
    public ResultUtil getById(@PathVariable Long id) {
        Food food = foodService.getById(id);
        if (food == null) {
            return ResultUtil.error("美食不存在");
        }
        return ResultUtil.success(food);
    }

    @PostMapping("/admin/foods")
    public ResultUtil create(@RequestBody Food food) {
        Food f = foodService.create(food);
        return ResultUtil.success("创建成功", f);
    }

    @PutMapping("/admin/foods/{id}")
    public ResultUtil update(@PathVariable Long id, @RequestBody Food food) {
        food.setId(id);
        System.out.println("【改】Controller接收 - highlights=" + food.getHighlights() + ", craft=" + food.getCraft()); //【改】诊断日志
        Food f = foodService.update(food);
        return ResultUtil.success("更新成功", f);
    }

    @DeleteMapping("/admin/foods/{id}")
    public ResultUtil delete(@PathVariable Long id) {
        foodService.delete(id);
        return ResultUtil.success("删除成功");
    }

    @PutMapping("/admin/foods/{id}/recommend")
    public ResultUtil updateRecommend(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer isRecommended = params.get("isRecommended");
        foodService.updateRecommend(id, isRecommended);
        return ResultUtil.success("操作成功");
    }

    // 小程序公开接口
    @GetMapping("/foods")
    public ResultUtil getFoodListForApp(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Map<String, Object> result = foodService.findByPage(keyword, region, category, 1, page, pageSize);
        return ResultUtil.success(result);
    }

    @GetMapping("/foods/{id}")
    public ResultUtil getFoodByIdForApp(@PathVariable Long id) {
        Food food = foodService.getById(id);
        if (food == null) {
            return ResultUtil.error("美食不存在");
        }
        System.out.println("【改】查询结果 - highlights=" + food.getHighlights() + ", craft=" + food.getCraft()); //【改】诊断日志
        ResultUtil result = ResultUtil.success(food);
        System.out.println("【改】返回结果class=" + result.getData().getClass().getName()); //【改】诊断日志
        return result;
    }
}

package com.example.tourism.controller;

import com.example.tourism.entity.Strategy;
import com.example.tourism.service.StrategyService;
import com.example.tourism.util.ResultUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/strategies")
@RequiredArgsConstructor
public class StrategyController {

  private final StrategyService strategyService;

  @GetMapping
  public ResultUtil getList() {
    List<Strategy> list = strategyService.findAll();
    return ResultUtil.success(list);
  }

  @GetMapping("/enabled")
  public ResultUtil getEnabled() {
    List<Strategy> list = strategyService.findEnabled();
    return ResultUtil.success(list);
  }

  @GetMapping("/{id}")
  public ResultUtil getById(@PathVariable Long id) {
    Strategy strategy = strategyService.getById(id);
    if (strategy == null) {
      return ResultUtil.error("攻略不存在");
    }
    return ResultUtil.success(strategy);
  }

  @PostMapping
  public ResultUtil create(@RequestBody Strategy strategy) {
    Strategy s = strategyService.create(strategy);
    return ResultUtil.success("创建成功", s);
  }

  @PutMapping("/{id}")
  public ResultUtil update(@PathVariable Long id, @RequestBody Strategy strategy) {
    strategy.setId(id);
    Strategy s = strategyService.update(strategy);
    return ResultUtil.success("更新成功", s);
  }

  @DeleteMapping("/{id}")
  public ResultUtil delete(@PathVariable Long id) {
    strategyService.delete(id);
    return ResultUtil.success("删除成功");
  }

  @PutMapping("/{id}/enabled")
  public ResultUtil updateEnabled(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
    Integer isEnabled = params.get("isEnabled");
    strategyService.updateEnabled(id, isEnabled);
    return ResultUtil.success("操作成功");
  }

  @PutMapping("/{id}/view")
  public ResultUtil updateViewCount(@PathVariable Long id) {
    strategyService.updateViewCount(id);
    return ResultUtil.success("操作成功");
  }

  @PutMapping("/{id}/like")
  public ResultUtil updateLikeCount(@PathVariable Long id) {
    strategyService.updateLikeCount(id);
    return ResultUtil.success("操作成功");
  }
}
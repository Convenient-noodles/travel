<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-title">{{ stat.title }}</p>
              <p class="stat-value">{{ stat.value }}</p>
            </div>
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="30"><component :is="stat.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { shallowRef, onMounted } from 'vue'
import { Location, Food, House, User } from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard' //【改】导入API

const stats = shallowRef([
  { title: '景点总数', value: '0', icon: Location, color: '#409eff' },
  { title: '美食总数', value: '0', icon: Food, color: '#67c23a' },
  { title: '酒店总数', value: '0', icon: House, color: '#e6a23c' },
  { title: '用户总数', value: '0', icon: User, color: '#f56c6c' }
])

onMounted(() => { //【改】挂载时加载数据
  loadStats()
})

const loadStats = async () => { //【改】加载统计数据
  try {
    const res = await getDashboardStats()
    if (res.code === 200) {
      stats.value = [
        { title: '景点总数', value: res.data.scenicCount.toString(), icon: Location, color: '#409eff' },
        { title: '美食总数', value: res.data.foodCount.toString(), icon: Food, color: '#67c23a' },
        { title: '酒店总数', value: res.data.hotelCount.toString(), icon: House, color: '#e6a23c' },
        { title: '用户总数', value: res.data.userCount.toString(), icon: User, color: '#f56c6c' }
      ]
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    margin-bottom: 20px;

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-info {
        .stat-title {
          font-size: 14px;
          color: #909399;
          margin: 0 0 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
    }
  }
}
</style>

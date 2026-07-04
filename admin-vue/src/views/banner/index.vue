<template>
  <div class="banner-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图列表</span>
          <el-button type="primary" @click="router.push('/banner/edit')">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="排序" width="80">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="999"
              size="small"
              @change="handleSortChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="图片" width="180">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              fit="cover"
              style="width: 150px; height: 80px; border-radius: 4px"
              :preview-src-list="[row.image]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="subtitle" label="副标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTagType(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跳转" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.targetType">{{ row.targetType }}: {{ row.targetId || row.targetUrl }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/banner/edit/${row.id}`)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @update:page-size="loadData"
          @update:current-page="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBannerList, deleteBanner, updateBannerSort, toggleBanner } from '@/api/banner'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getTypeName = (type) => {
  const map = {
    'scenic': '景点',
    'food': '美食',
    'hotel': '酒店',
    'route': '路线',
    'activity': '活动',
    'external': '外部链接'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    'scenic': 'success',
    'food': 'warning',
    'hotel': 'info',
    'route': 'primary',
    'activity': 'danger',
    'external': ''
  }
  return map[type] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBannerList({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleSortChange = async (row) => {
  try {
    await updateBannerSort({ id: row.id, sort: row.sort })
    ElMessage.success('排序已更新')
  } catch (error) {
    ElMessage.error('更新排序失败')
    loadData()
  }
}

const handleToggle = async (row) => {
  try {
    await toggleBanner(row.id, row.enabled)
    ElMessage.success(row.enabled ? '已启用' : '已禁用')
  } catch (error) {
    ElMessage.error('更新状态失败')
    loadData()
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除轮播图"${row.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteBanner(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.banner-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    .el-input-number {
      width: 70px;
    }
  }
}
</style>

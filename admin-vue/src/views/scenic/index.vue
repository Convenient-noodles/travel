<template>
  <div class="scenic-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>景点列表</span>
          <el-button type="primary" @click="router.push('/scenic/edit')">
            <el-icon><Plus /></el-icon>
            新增景点
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索景点名称"
          style="width: 200px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="searchRegion" placeholder="选择地区" clearable style="width: 150px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="贵阳" value="贵阳" />
          <el-option label="遵义" value="遵义" />
          <el-option label="安顺" value="安顺" />
          <el-option label="毕节" value="毕节" />
          <el-option label="铜仁" value="铜仁" />
          <el-option label="黔东南" value="黔东南" />
          <el-option label="黔南" value="黔南" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="主图" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.coverImage"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="景点名称" min-width="150" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="rating" label="评分" width="80" />
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <el-tag v-for="tag in (row.tags ? JSON.parse(row.tags) : []).slice(0, 2)" :key="tag" size="small" style="margin-right: 5px">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐/热门" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.isRecommended"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggleRecommend(row)"
            />
            <span style="margin-left: 5px; font-size: 12px">推荐</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/scenic/edit/${row.id}`)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
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
import { getScenicList, deleteScenic, toggleRecommend } from '@/api/scenic'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const searchRegion = ref('')
const tableData = ref([])
const selectedRows = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getScenicList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      region: searchRegion.value
    })
    if (res.code === 200) {
      // [修复] 兼容不同的数据返回格式：可能是数组直接返回，也可能是 {list, total} 结构
      if (Array.isArray(res.data)) {
        tableData.value = res.data
        pagination.total = res.data.length
      } else {
        tableData.value = res.data?.list || []
        pagination.total = res.data?.total || 0
      }
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleToggleRecommend = async (row) => {
  try {
    await toggleRecommend(row.id, row.isRecommended)
    ElMessage.success('更新成功')
  } catch (error) {
    row.isRecommended = row.isRecommended === 1 ? 0 : 1
    ElMessage.error('更新失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除景点"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteScenic(row.id)
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
.scenic-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
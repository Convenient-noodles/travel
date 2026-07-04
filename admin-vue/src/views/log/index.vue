<template>
  <div class="log-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="searchForm.action" placeholder="操作类型" clearable style="width: 150px">
          <el-option label="登录" value="login" />
          <el-option label="新增" value="create" />
          <el-option label="编辑" value="update" />
          <el-option label="删除" value="delete" />
          <el-option label="其他" value="other" />
        </el-select>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getActionType(row.action)">
              {{ getActionName(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="User-Agent" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])

const searchForm = reactive({
  action: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getActionType = (action) => {
  const map = {
    'login': 'success',
    'create': 'primary',
    'update': 'warning',
    'delete': 'danger',
    'other': 'info'
  }
  return map[action] || 'info'
}

const getActionName = (action) => {
  const map = {
    'login': '登录',
    'create': '新增',
    'update': '编辑',
    'delete': '删除',
    'other': '其他'
  }
  return map[action] || action
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    tableData.value = [
      { id: 1, username: 'admin', action: 'login', module: '系统', description: '管理员登录成功', ip: '192.168.1.100', userAgent: 'Mozilla/5.0...', createdAt: '2024-01-15 10:30:00' },
      { id: 2, username: 'admin', action: 'create', module: '景点管理', description: '新增景点：黄果树瀑布', ip: '192.168.1.100', userAgent: 'Mozilla/5.0...', createdAt: '2024-01-15 11:15:00' },
      { id: 3, username: 'manager', action: 'update', module: '景点管理', description: '编辑景点：黄果树瀑布', ip: '192.168.1.101', userAgent: 'Mozilla/5.0...', createdAt: '2024-01-15 14:20:00' },
      { id: 4, username: 'editor', action: 'create', module: '美食管理', description: '新增美食：酸汤鱼', ip: '192.168.1.102', userAgent: 'Mozilla/5.0...', createdAt: '2024-01-15 15:30:00' },
      { id: 5, username: 'admin', action: 'delete', module: '酒店管理', description: '删除酒店：贵阳宾馆', ip: '192.168.1.100', userAgent: 'Mozilla/5.0...', createdAt: '2024-01-15 16:45:00' }
    ]
    pagination.total = 5
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.action = ''
  searchForm.dateRange = []
  pagination.page = 1
  loadData()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该日志吗？', '提示', { type: 'warning' })
    await new Promise(resolve => setTimeout(resolve, 200))
    ElMessage.success('删除成功')
    loadData()
  } catch {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条日志吗？`, '提示', { type: 'warning' })
    await new Promise(resolve => setTimeout(resolve, 200))
    ElMessage.success('批量删除成功')
    loadData()
  } catch {
    if (e !== 'cancel') ElMessage.error('批量删除失败')
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.log-list {
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

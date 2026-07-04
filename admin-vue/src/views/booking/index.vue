<template>
  <div class="booking-container">
    <div class="page-header">
      <h2>预约管理</h2>
      <p class="subtitle">管理民俗体验预约记录，处理取消请求</p>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="项目名称/预约人/电话"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:140px">
            <el-option label="已确认" value="confirmed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="cultureName" label="体验项目" min-width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="预约人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="bookDate" label="预约日期" width="120" />
        <el-table-column prop="count" label="人数" width="60" align="center" />
        <el-table-column prop="location" label="地点" min-width="140" show-overflow-tooltip />
        <el-table-column prop="duration" label="时长" width="80" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'confirmed' ? 'success' : 'info'" size="small">
              {{ row.status === 'confirmed' ? '已确认' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预约时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              text type="warning" size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="520px" destroy-on-close>
      <template v-if="currentBooking">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="体验项目" :span="2">{{ currentBooking.cultureName }}</el-descriptions-item>
          <el-descriptions-item label="预约人">{{ currentBooking.name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentBooking.phone }}</el-descriptions-item>
          <el-descriptions-item label="预约日期">{{ currentBooking.bookDate }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ currentBooking.count }}人</el-descriptions-item>
          <el-descriptions-item label="地点">{{ currentBooking.location }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ currentBooking.duration }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentBooking.status === 'confirmed' ? 'success' : 'info'" size="small">
              {{ currentBooking.status === 'confirmed' ? '已确认' : '已取消' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预约时间" :span="2">{{ currentBooking.createTime }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getBookingList, getBookingDetail, cancelBooking, deleteBooking } from '@/api/booking'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentBooking = ref(null)

const queryParams = reactive({
  keyword: '',
  status: '',
  page: 1,
  pageSize: 10
})

onMounted(() => fetchData())

function fetchData() {
  loading.value = true
  getBookingList(queryParams)
    .then(res => {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    })
    .catch(() => ElMessage.error('加载预约列表失败'))
    .finally(() => { loading.value = false })
}

function handleSearch() {
  queryParams.page = 1
  fetchData()
}

function handleReset() {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.page = 1
  fetchData()
}

function handleDetail(row) {
  getBookingDetail(row.id)
    .then(res => {
      currentBooking.value = res.data
      detailVisible.value = true
    })
    .catch(() => ElMessage.error('获取详情失败'))
}

function handleCancel(row) {
  ElMessageBox.confirm(
    `确定要取消 ${row.cultureName} 的预约吗？`,
    '取消预约',
    { confirmButtonText: '确认取消', cancelButtonText: '再想想', type: 'warning' }
  ).then(() => {
    cancelBooking(row.id)
      .then(() => { ElMessage.success('已取消'); fetchData() })
      .catch(() => ElMessage.error('取消失败'))
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要删除 ${row.cultureName} 的预约记录吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    deleteBooking(row.id)
      .then(() => { ElMessage.success('删除成功'); fetchData() })
      .catch(() => ElMessage.error('删除失败'))
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.booking-container {
  .page-header { margin-bottom: 20px;
    h2 { margin: 0 0 5px; font-size: 22px; color: #333; }
    .subtitle { margin: 0; font-size: 13px; color: #999; }
  }
  .search-card { margin-bottom: 16px; }
  .table-card { margin-bottom: 16px; }
  .pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
}
</style>

<template>
  <div class="order-container">
    <div class="page-header">
      <h2>订单管理</h2>
      <p class="subtitle">管理酒店预订订单，处理退款申请</p>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="订单号/酒店/入住人"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:140px">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="退款申请中" value="refunding" />
            <el-option label="已退款" value="refunded" />
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
        <el-table-column prop="orderNo" label="订单编号" width="200" show-overflow-tooltip />
        <el-table-column prop="hotelName" label="酒店名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="roomName" label="房型" width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="入住人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="退款原因" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 'refunding'" class="refund-reason">{{ row.refundReason || '用户申请退款' }}</span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'paid' || row.status === 'refunding'"
              text type="warning" size="small"
              @click="handleRefund(row)"
            >
              {{ row.status === 'refunding' ? '审核退款' : '退款' }}
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="560px" destroy-on-close>
      <template v-if="currentOrder">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单编号" :span="2">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="酒店">{{ currentOrder.hotelName }}</el-descriptions-item>
          <el-descriptions-item label="房型">{{ currentOrder.roomName }}</el-descriptions-item>
          <el-descriptions-item label="入住人">{{ currentOrder.name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="入住时间">{{ currentOrder.checkInDate }}</el-descriptions-item>
          <el-descriptions-item label="退房时间">{{ currentOrder.checkOutDate }}</el-descriptions-item>
          <el-descriptions-item label="间/晚">{{ currentOrder.nights }}晚</el-descriptions-item>
          <el-descriptions-item label="金额">
            <span class="amount">¥{{ currentOrder.amount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)" size="small">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="退款时间">{{ currentOrder.refundTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">
            {{ currentOrder.refundAmount ? '¥' + currentOrder.refundAmount : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款原因" :span="2">{{ currentOrder.refundReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentOrder.createTime }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList, getOrderDetail, deleteOrder, refundOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentOrder = ref(null)

const queryParams = reactive({
  keyword: '',
  status: '',
  page: 1,
  pageSize: 10
})

onMounted(() => {
  fetchData()
})

function fetchData() {
  loading.value = true
  getOrderList(queryParams).then(res => {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }).catch(() => {
    ElMessage.error('加载订单列表失败')
  }).finally(() => {
    loading.value = false
  })
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
  getOrderDetail(row.id).then(res => {
    currentOrder.value = res.data
    detailVisible.value = true
  }).catch(() => {
    ElMessage.error('获取订单详情失败')
  })
}

function handleRefund(row) {
  const defaultReason = row.refundReason || '用户申请退款'
  const promptTitle = row.status === 'refunding' ? '审核退款申请' : '退款确认'
  ElMessageBox.prompt('请输入退款原因', promptTitle, {
    confirmButtonText: '确认退款',
    cancelButtonText: '取消',
    inputValue: defaultReason,
    inputValidator: (val) => val && val.trim() ? true : '请输入退款原因',
    inputErrorMessage: '请输入退款原因'
  }).then(({ value }) => {
    refundOrder(row.id, value).then(() => {
      ElMessage.success('退款成功')
      fetchData()
    }).catch(() => {
      ElMessage.error('退款失败')
    })
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除订单 ${row.orderNo} 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteOrder(row.id).then(() => {
      ElMessage.success('删除成功')
      fetchData()
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  }).catch(() => {})
}

function getStatusType(status) {
  const map = { pending: 'warning', paid: 'success', refunding: 'danger', refunded: 'info' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { pending: '待支付', paid: '已支付', refunding: '退款申请中', refunded: '已退款' }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.order-container {
  .page-header {
    margin-bottom: 20px;
    h2 { margin: 0 0 5px; font-size: 22px; color: #333; }
    .subtitle { margin: 0; font-size: 13px; color: #999; }
  }

  .search-card { margin-bottom: 16px; }
  .table-card { margin-bottom: 16px; }
  .pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
  .amount { color: #e74c3c; font-weight: 600; }
  .refund-reason { color: #E65100; font-size: 13px; }
  .no-data { color: #ccc; }
}
</style>

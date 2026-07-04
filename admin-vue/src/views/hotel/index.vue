<template>
  <div class="hotel-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>酒店列表</span>
          <el-button type="primary" @click="router.push('/hotel/edit')">
            <el-icon><Plus /></el-icon>
            新增酒店
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索酒店名称" style="width: 200px" clearable @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <!--【改】字段名mainImage改为coverImage-->
            <el-image :src="row.coverImage" fit="cover" style="width: 60px; height: 60px; border-radius: 4px" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="酒店名称" min-width="150" />
        <el-table-column prop="typeName" label="类型" width="100" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="starLevel" label="星级" width="80">
          <template #default="{ row }">
            <el-rate v-model="row.starLevel" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isRecommended === 1 ? 'success' : 'info'" size="small">
              {{ row.isRecommended === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收款码" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paymentQrCode" type="success" size="small">已配置</el-tag>
            <el-tag v-else type="warning" size="small">未配置</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/hotel/edit/${row.id}`)">编辑</el-button>
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
import { getHotelList, deleteHotel } from '@/api/hotel'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const searchKeyword = ref('')
const tableData = ref([])

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const typeMap = { luxury: '豪华酒店', comfort: '舒适酒店', economy: '经济酒店', boutique: '精品民宿' }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getHotelList({ page: pagination.page, pageSize: pagination.pageSize, keyword: searchKeyword.value })
    if (res.code === 200) {
      tableData.value = res.data.list.map(item => ({ ...item, typeName: typeMap[item.type] || item.type }))
      pagination.total = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' })
    await deleteHotel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.hotel-list {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .search-bar { margin-bottom: 20px; display: flex; gap: 15px; }
  .pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
}
</style>
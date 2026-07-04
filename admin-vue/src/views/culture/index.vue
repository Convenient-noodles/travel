<template>
  <div class="culture-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文化体验列表</span>
          <el-button type="primary" @click="router.push('/culture/edit')"><el-icon><Plus /></el-icon>新增体验</el-button>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="图片" width="100"><!--【改】字段名mainImage改为coverImage--><template #default="{ row }"><el-image :src="row.coverImage" fit="cover" style="width:60px;height:60px;border-radius:4px" /></template></el-table-column>
        <el-table-column prop="name" label="体验名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="duration" label="时长" width="100" />
        <el-table-column label="推荐" width="80"><template #default="{ row }"><el-tag :type="row.isRecommended===1?'success':'info'" size="small">{{ row.isRecommended===1?'是':'否' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/culture/edit/${row.id}`)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @update:page-size="loadData" @update:current-page="loadData" /></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCultureList, deleteCulture } from '@/api/culture'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const categoryMap = { intangible: '非遗体验', performance: '演出表演', craft: '手工艺', custom: '民俗活动' }

const loadData = async () => {
  loading.value = true
  const res = await getCultureList({ page: pagination.page, pageSize: pagination.pageSize })
  if (res.code === 200) {
    tableData.value = res.data.list.map(i => ({ ...i, categoryName: categoryMap[i.category] || i.category }))
    pagination.total = res.data.total
  }
  loading.value = false
}

const handleDelete = async (row) => {
  try { await ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }); await deleteCulture(row.id); ElMessage.success('删除成功'); loadData() }
  catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.culture-list { .card-header { display: flex; justify-content: space-between; align-items: center; } .pagination { margin-top: 20px; display: flex; justify-content: flex-end; } }
</style>
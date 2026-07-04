<template>
  <div class="red-tourism-list">
    <el-card>
      <template #header><div class="card-header"><span>红色旅游列表</span><el-button type="primary" @click="router.push('/red-tourism/edit')"><el-icon><Plus /></el-icon>新增</el-button></div></template>
      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="图片" width="100"><template #default="{row}"><el-image :src="row.coverImage" fit="cover" style="width:60px;height:60px" /></template><!--【改】字段名mainImage改为coverImage--></el-table-column>
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="typeName" label="类型" width="100" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column label="推荐" width="80"><template #default="{row}"><el-tag :type="row.isRecommended===1?'success':'info'">{{ row.isRecommended===1?'是':'否' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{row}">
            <el-button link type="primary" @click="router.push(`/red-tourism/edit/${row.id}`)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total,prev,pager,next" @update:page-size="loadData" @update:current-page="loadData" /></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRedTourismList, deleteRedTourism } from '@/api/red-tourism'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const typeMap = { site: '革命遗址', museum: '纪念馆', memorial: '纪念碑' }

const loadData = async () => {
  loading.value = true
  const res = await getRedTourismList({ page: pagination.page, pageSize: pagination.pageSize })
  if (res.code === 200) { tableData.value = res.data.list.map(i => ({ ...i, typeName: typeMap[i.type] || i.type })); pagination.total = res.data.total }
  loading.value = false
}

const handleDelete = async (row) => {
  try { await ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }); await deleteRedTourism(row.id); ElMessage.success('删除成功'); loadData() }
  catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.red-tourism-list { .card-header { display: flex; justify-content: space-between; } .pagination { margin-top: 20px; display: flex; justify-content: flex-end; } }
</style>
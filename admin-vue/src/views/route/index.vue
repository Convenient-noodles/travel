<template>
  <div class="route-list">
    <el-card>
      <template #header><div class="card-header"><span>旅游路线列表</span><el-button type="primary" @click="router.push('/route/edit')"><el-icon><Plus /></el-icon>新增路线</el-button></div></template>
      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="封面" width="100"><template #default="{row}"><el-image :src="row.coverImage" fit="cover" style="width:60px;height:60px" /></template></el-table-column>
        <el-table-column prop="name" label="路线名称" min-width="150" />
        <el-table-column prop="days" label="天数" width="80"><template #default="{row}">{{ row.days }}天{{ row.nights }}晚</template></el-table-column>
        <el-table-column prop="price" label="价格" width="100"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
        <el-table-column prop="region" label="主要地区" width="100" />
        <el-table-column label="推荐/热门" width="120">
          <template #default="{row}"><el-tag size="small" :type="row.isHot===1?'danger':'info'">{{ row.isHot===1?'热门':'普通' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{row}">
            <el-button link type="primary" @click="router.push(`/route/edit/${row.id}`)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRouteList, deleteRoute } from '@/api/route'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const loadData = async () => {
  loading.value = true
  const res = await getRouteList({ page: pagination.page, pageSize: pagination.pageSize })
  if (res.code === 200) { tableData.value = res.data.list; pagination.total = res.data.total }
  loading.value = false
}

const handleDelete = async (row) => {
  try { await ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }); await deleteRoute(row.id); ElMessage.success('删除成功'); loadData() }
  catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

onMounted(() => loadData())
</script>
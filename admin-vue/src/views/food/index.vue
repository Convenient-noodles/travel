<template>
  <div class="food-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>美食列表</span>
          <el-button type="primary" @click="router.push('/food/edit')">
            <el-icon><Plus /></el-icon>
            新增美食
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索美食名称"
          style="width: 200px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="searchCategory" placeholder="选择分类" clearable style="width: 150px" @change="handleSearch">
          <el-option label="街头小吃" value="street" />
          <el-option label="特色菜肴" value="course" />
          <el-option label="休闲零食" value="snack" />
          <el-option label="特色饮品" value="drink" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <!--【改】字段名mainImage改为coverImage-->
            <el-image
              :src="row.coverImage"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
              @error="(e) => handleImageError(e, row)" <!--【改】添加图片加载错误处理 -->
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="美食名称" min-width="120" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="tag" label="标签" width="100" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="priceRange" label="价格" width="100" />
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/food/edit/${row.id}`)">编辑</el-button>
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
import { getFoodList, deleteFood } from '@/api/food'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const searchCategory = ref('')
const tableData = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const categoryMap = {
  street: '街头小吃',
  course: '特色菜肴',
  snack: '休闲零食',
  drink: '特色饮品'
}

const handleImageError = (e, row) => { //【改】图片加载失败处理
  e.preventDefault()
  row.coverImage = ''
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getFoodList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      category: searchCategory.value
    })
    if (res.code === 200) {
      // [修复] 兼容不同的数据返回格式：可能是数组直接返回，也可能是 {list, total} 结构
      let list = []
      let total = 0
      if (Array.isArray(res.data)) {
        list = res.data
        total = res.data.length
      } else {
        list = res.data?.list || []
        total = res.data?.total || 0
      }
      tableData.value = list.map(item => ({
        ...item,
        categoryName: categoryMap[item.category] || item.category
      }))
      pagination.total = total
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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除美食"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteFood(row.id)
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
.food-list {
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
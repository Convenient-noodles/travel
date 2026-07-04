<template>
  <div class="strategy-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>精选攻略</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增攻略
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="title" label="攻略标题" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="likeCount" label="点赞数" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="封面">
          <template #default="{ row }">
            <el-image v-if="row.coverImage" :src="row.coverImage" fit="cover" style="width: 60px; height: 60px; border-radius: 4px" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑攻略' : '新增攻略'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="攻略标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入攻略标题" style="width: 100%" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名称" style="width: 300px" />
        </el-form-item>
        <el-form-item label="攻略分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 200px">
            <el-option label="攻略" value="攻略" />
            <el-option label="贴士" value="贴士" />
            <el-option label="公告" value="公告" />
            <el-option label="文化" value="文化" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
          <div class="image-upload">
            <el-image
              v-if="form.coverImage"
              :src="form.coverImage"
              fit="cover"
              class="preview-image"
              :preview-src-list="[form.coverImage]"
            />
            <el-upload
              v-else
              class="upload-placeholder"
              :show-file-list="false"
              :http-request="handleUpload"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
              <span>上传图片</span>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="攻略内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入攻略内容" style="width: 100%" />
        </el-form-item>
        <el-form-item label="小贴士">
          <el-input v-model="form.tips" type="textarea" :rows="3" placeholder="请输入小贴士（可选）" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.isEnabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getStrategyList, createStrategy, updateStrategy, deleteStrategy, toggleStrategy } from '@/api/strategy'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref([])
const formRef = ref(null)

const form = reactive({
  id: null,
  title: '',
  content: '',
  coverImage: '',
  author: '',
  category: '攻略', //【新增】分类字段
  tips: '', //【新增】小贴士字段
  viewCount: 0,
  likeCount: 0,
  sortOrder: 0,
  isEnabled: 1
})

const rules = {
  title: [{ required: true, message: '请输入攻略标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入攻略内容', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStrategyList()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error('加载数据失败', error)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', content: '', coverImage: '', author: '', category: '攻略', tips: '', viewCount: 0, likeCount: 0, sortOrder: 0, isEnabled: 1 }) //【改】添加category和tips字段
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleToggle = async (row) => {
  try {
    const res = await toggleStrategy(row.id, row.isEnabled)
    if (res.code === 200) {
      ElMessage.success(row.isEnabled ? '已启用' : '已禁用')
    } else {
      ElMessage.error('更新失败')
      loadData()
    }
  } catch {
    ElMessage.error('更新失败')
    loadData()
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除攻略"${row.title}"吗？`, '提示', { type: 'warning' })
    const res = await deleteStrategy(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleUpload = async (options) => {
  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const result = await res.json()

    if (result.code === 200) {
      form.coverImage = result.data
      onSuccess && onSuccess()
    } else {
      ElMessage.error(result.message || '上传失败')
      onError && onError()
    }
  } catch (error) {
    ElMessage.error('上传失败')
    onError && onError()
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const strategyData = {
      title: form.title,
      content: form.content,
      coverImage: form.coverImage,
      author: form.author,
      category: form.category, //【新增】分类字段
      tips: form.tips, //【新增】小贴士字段
      sortOrder: form.sortOrder,
      isEnabled: form.isEnabled
    }
    let res
    if (isEdit.value) {
      res = await updateStrategy(form.id, strategyData)
    } else {
      res = await createStrategy(strategyData)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error('操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.strategy-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .preview-image {
      width: 300px;
      height: 150px;
      border-radius: 8px;
    }

    .upload-placeholder {
      width: 300px;
      height: 150px;
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409eff;
      }

      .el-icon {
        font-size: 40px;
        color: #8c939d;
      }

      span {
        margin-top: 8px;
        color: #8c939d;
        font-size: 14px;
      }
    }
  }
}
</style>
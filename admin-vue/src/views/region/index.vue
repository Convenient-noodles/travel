<template>
  <div class="region-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>地区列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增地区
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="name" label="地区名称" width="150" />
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="pinyin" label="拼音" width="150" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 1 ? 'success' : 'primary'">
              {{ row.type === 1 ? '市州' : '区县' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="上级地区" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑地区' : '新增地区'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="地区名称" prop="name">
          <el-input v-model="form.name" placeholder="如：贵阳市" />
        </el-form-item>
        <el-form-item label="地区编码" prop="code">
          <el-input v-model="form.code" placeholder="如：5201" />
        </el-form-item>
        <el-form-item label="拼音" prop="pinyin">
          <el-input v-model="form.pinyin" placeholder="如：guiyang" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">市州</el-radio>
            <el-radio :value="2">区县</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级地区" v-if="form.type === 2">
          <el-select v-model="form.parentId" placeholder="请选择" clearable>
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
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
import { getRegionList, createRegion, updateRegion, deleteRegion, toggleRegion } from '@/api/region'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref([])
const parentOptions = ref([])
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  code: '',
  pinyin: '',
  type: 1,
  parentId: null,
  sort: 0,
  enabled: 1
})

const rules = {
  name: [{ required: true, message: '请输入地区名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入地区编码', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRegionList()
    if (res.code === 200) {
      tableData.value = res.data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        pinyin: item.pinyin,
        type: item.level,
        parentName: '-',
        sort: item.sortOrder || 0,
        enabled: item.isEnabled
      }))
      parentOptions.value = tableData.value.filter(item => item.type === 1)
    }
  } catch (error) {
    console.error('加载数据失败', error)
    tableData.value = [
      { id: 1, name: '贵阳市', code: '5201', pinyin: 'guiyang', type: 1, parentName: '-', sort: 1, enabled: 1 },
      { id: 2, name: '遵义市', code: '5203', pinyin: 'zunyi', type: 1, parentName: '-', sort: 2, enabled: 1 },
      { id: 3, name: '安顺市', code: '5204', pinyin: 'anshun', type: 1, parentName: '-', sort: 3, enabled: 1 },
      { id: 4, name: '毕节市', code: '5205', pinyin: 'bijie', type: 1, parentName: '-', sort: 4, enabled: 1 },
      { id: 5, name: '铜仁市', code: '5206', pinyin: 'tongren', type: 1, parentName: '-', sort: 5, enabled: 1 },
      { id: 6, name: '黔东南', code: '5226', pinyin: 'qiandongnan', type: 1, parentName: '-', sort: 6, enabled: 1 },
      { id: 7, name: '黔南州', code: '5227', pinyin: 'qiannan', type: 1, parentName: '-', sort: 7, enabled: 1 }
    ]
    parentOptions.value = tableData.value.filter(item => item.type === 1)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', code: '', pinyin: '', type: 1, parentId: null, sort: 0, enabled: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleToggle = async (row) => {
  try {
    const res = await toggleRegion(row.id, row.enabled)
    if (res.code === 200) {
      ElMessage.success(row.enabled ? '已启用' : '已禁用')
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
    await ElMessageBox.confirm(`确定要删除地区"${row.name}"吗？`, '提示', { type: 'warning' })
    const res = await deleteRegion(row.id)
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

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const regionData = {
      name: form.name,
      code: form.code,
      pinyin: form.pinyin,
      level: form.type,
      sortOrder: form.sort,
      isEnabled: form.enabled
    }
    let res
    if (isEdit.value) {
      res = await updateRegion(form.id, regionData)
    } else {
      res = await createRegion(regionData)
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
.region-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

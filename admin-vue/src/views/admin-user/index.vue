<template>
  <div class="admin-user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增管理员
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'super_admin' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'super_admin' ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)" :disabled="row.id === 1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管理员' : '新增管理员'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="普通管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { Plus, User } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tableData = ref([])
const formRef = ref(null)

const form = reactive({
  id: null,
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  role: 'admin',
  phone: '',
  email: '',
  status: 1
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    tableData.value = [
      { id: 1, username: 'admin', nickname: '超级管理员', role: 'super_admin', phone: '13800138000', email: 'admin@example.com', status: 1, lastLoginTime: '2024-01-15 10:30:00', avatar: '' },
      { id: 2, username: 'manager', nickname: '运营管理员', role: 'admin', phone: '13800138001', email: 'manager@example.com', status: 1, lastLoginTime: '2024-01-15 09:15:00', avatar: '' },
      { id: 3, username: 'editor', nickname: '内容编辑', role: 'admin', phone: '13800138002', email: 'editor@example.com', status: 1, lastLoginTime: '2024-01-14 16:45:00', avatar: '' }
    ]
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, username: '', nickname: '', password: '', confirmPassword: '', role: 'admin', phone: '', email: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row, password: '', confirmPassword: '' })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除管理员"${row.nickname}"吗？`, '提示', { type: 'warning' })
    await new Promise(resolve => setTimeout(resolve, 200))
    ElMessage.success('删除成功')
    loadData()
  } catch {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
    dialogVisible.value = false
    loadData()
  } catch {
    ElMessage.error('操作失败')
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.admin-user-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

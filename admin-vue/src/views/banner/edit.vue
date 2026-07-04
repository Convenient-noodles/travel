<template>
  <div class="banner-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑轮播图' : '新增轮播图' }}</span>
          <el-button @click="router.push('/banner')">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="banner-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" maxlength="50" show-word-limit style="width: 400px" />
        </el-form-item>

        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="请输入副标题" maxlength="100" show-word-limit style="width: 400px" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 200px" @change="handleTypeChange">
            <el-option label="景点" value="scenic" />
            <el-option label="美食" value="food" />
            <el-option label="酒店" value="hotel" />
            <el-option label="旅游路线" value="route" />
            <el-option label="活动" value="activity" />
            <el-option label="外部链接" value="external" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.type !== 'external'" :label="getTargetLabel()" prop="targetId">
          <el-input
            v-if="form.type === 'activity'"
            v-model="form.targetId"
            :placeholder="`请输入活动ID`"
            style="width: 200px"
          />
          <el-select
            v-else
            v-model="form.targetId"
            :placeholder="`请选择${getTargetLabel()}`"
            style="width: 300px"
            clearable
          >
            <el-option
              v-for="item in targetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.type === 'external'" label="跳转链接" prop="targetUrl">
          <el-input v-model="form.targetUrl" placeholder="请输入完整的URL地址" style="width: 400px" />
        </el-form-item>

        <el-form-item label="轮播图片" prop="image">
          <div class="image-upload">
            <el-image
              v-if="form.image"
              :src="form.image"
              fit="cover"
              class="preview-image"
              :preview-src-list="[form.image]"
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
            <div class="upload-tips">
              <span>建议尺寸：750x400 或等比例图片</span>
              <span>支持 JPG、PNG 格式</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
          <span class="tips">数字越小越靠前</span>
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
          <el-button @click="router.push('/banner')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getBannerDetail, createBanner, updateBanner } from '@/api/banner'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const saving = ref(false)
const targetOptions = ref([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  subtitle: '',
  type: 'scenic',
  image: '',
  targetId: '',
  targetUrl: '',
  sort: 0,
  enabled: 1
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  image: [{ required: true, message: '请上传轮播图片', trigger: 'change' }]
}

const getTargetLabel = () => {
  const map = {
    'scenic': '景点',
    'food': '美食',
    'hotel': '酒店',
    'route': '路线',
    'activity': '活动'
  }
  return map[form.type] || '目标'
}

const getTargetOptions = async () => {
  if (form.type === 'external' || form.type === 'activity') {
    targetOptions.value = []
    return
  }

  const apiMap = {
    'scenic': '/api/admin/scenics?pageSize=100',
    'food': '/api/admin/foods?pageSize=100',
    'hotel': '/api/admin/hotels?pageSize=100',
    'route': '/api/admin/routes?pageSize=100'
  }

  try {
    const res = await fetch(apiMap[form.type], {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json())
    if (res.code === 200) {
      targetOptions.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载选项失败', error)
    targetOptions.value = []
  }
}

const handleTypeChange = () => {
  form.targetId = ''
  form.targetUrl = ''
  getTargetOptions()
}

const loadDetail = async () => {
  if (!route.params.id) return
  try {
    const res = await getBannerDetail(route.params.id)
    if (res.code === 200) {
      const data = res.data
      form.type = data.type
      await getTargetOptions() //【改】先加载选项列表再赋值
      Object.assign(form, data)
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
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
      form.image = result.data
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

  saving.value = true
  try {
    const api = isEdit.value ? updateBanner : createBanner
    const data = { ...form }
    const res = await api(isEdit.value ? route.params.id : data, data)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      router.push('/banner')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadDetail()
  } else {
    getTargetOptions()
  }
})
</script>

<style lang="scss" scoped>
.banner-edit {
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
      width: 375px;
      height: 200px;
      border-radius: 8px;
    }

    .upload-placeholder {
      width: 375px;
      height: 200px;
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

    .upload-tips {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
  }

  .tips {
    margin-left: 10px;
    font-size: 12px;
    color: #999;
  }
}
</style>

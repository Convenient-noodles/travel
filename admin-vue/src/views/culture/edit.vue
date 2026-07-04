<template>
  <div class="culture-edit">
    <el-card>
      <template #header><div class="card-header"><span>{{ isEdit?'编辑体验':'新增体验' }}</span><el-button @click="router.push('/culture')">返回</el-button></div></template>
      <el-form ref="formRef" :model="form" label-width="120px" class="form">
        <el-form-item label="体验名称" prop="name"><el-input v-model="form.name" placeholder="请输入名称" maxlength="100" /></el-form-item>
        <el-form-item label="分类" prop="category"><el-select v-model="form.category" style="width:200px"><el-option label="非遗体验" value="intangible" /><el-option label="演出表演" value="performance" /><el-option label="手工艺" value="craft" /><el-option label="民俗活动" value="custom" /></el-select></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tag" placeholder="标签" style="width:200px" /></el-form-item>
        <el-form-item label="地区" prop="region"><el-select v-model="form.region" style="width:200px"><el-option label="贵阳" value="贵阳" /><el-option label="遵义" value="遵义" /><el-option label="安顺" value="安顺" /><el-option label="毕节" value="毕节" /><el-option label="铜仁" value="铜仁" /><el-option label="黔东南" value="黔东南" /><el-option label="黔南" value="黔南" /></el-select></el-form-item>
        <el-form-item label="体验时长"><el-input v-model="form.duration" placeholder="如：2小时" style="width:200px" /></el-form-item>
        <el-form-item label="价格"><el-input v-model="form.price" placeholder="如：200元/人" style="width:200px" /></el-form-item>
        <el-form-item label="体验地点"><el-input v-model="form.location" placeholder="地点" /></el-form-item>
        <el-form-item label="联系方式"><el-input v-model="form.contact" placeholder="电话" style="width:200px" /></el-form-item>
        <el-form-item label="体验介绍"><el-input v-model="form.description" type="textarea" :rows="4" placeholder="介绍内容" /></el-form-item>
        <el-form-item label="特色亮点"><el-input v-model="form.highlights" type="textarea" :rows="3" placeholder="每行一个亮点" /></el-form-item>
        <el-form-item label="主图"><div class="image-upload"><el-image v-if="form.coverImage" :src="form.coverImage" fit="cover" class="preview" /><el-upload v-else class="upload" :show-file-list="false" :http-request="(o)=>handleUpload(o,'main')"><el-icon><Plus /></el-icon></el-upload></div></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="推荐"><el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">上架</el-radio><el-radio :value="0">下架</el-radio></el-radio-group></el-form-item>
        <el-form-item><el-button type="primary" :loading="saving" @click="handleSubmit">{{ saving?'保存中...':'保存' }}</el-button><el-button @click="router.push('/culture')">取消</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCultureDetail, createCulture, updateCulture } from '@/api/culture'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)
const form = reactive({ name: '', category: 'intangible', tag: '', region: '', coverImage: '', description: '', duration: '', price: '', highlights: '', location: '', contact: '', sortOrder: 0, isRecommended: 0, status: 1 })

const loadDetail = async () => { 
  if (route.params.id) { 
    const res = await getCultureDetail(route.params.id); 
    if (res.code === 200) {
      Object.assign(form, res.data)
      if (res.data.coverImage) {
        form.coverImage = res.data.coverImage
      }
    }
  } 
}

const handleUpload = async (options, type) => {
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
      const url = result.data
      if (type === 'main') {
        form.coverImage = url
      }
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
  saving.value = true
  try {
    const data = {
      name: form.name,
      category: form.category,
      region: form.region,
      duration: form.duration || '',
      price: form.price || '',
      description: form.description || '',
      highlights: form.highlights || '',
      tags: form.tag || '',
      address: form.location || '',
      phone: form.contact || '',
      coverImage: form.coverImage || '',
      sortOrder: form.sortOrder,
      isRecommended: form.isRecommended,
      status: form.status
    }
    
    let res
    if (isEdit.value) {
      res = await updateCulture(route.params.id, data)
    } else {
      res = await createCulture(data)
    }
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      router.push('/culture')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => { if (isEdit.value) loadDetail() })
</script>

<style lang="scss" scoped>
.culture-edit { .card-header { display: flex; justify-content: space-between; } .form { max-width: 800px; } .image-upload { display: flex; gap: 15px; .preview { width: 200px; height: 133px; border-radius: 8px; } .upload { width: 200px; height: 133px; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; &:hover { border-color: #409eff; } } } }
</style>
<template>
  <div class="red-tourism-edit">
    <el-card>
      <template #header><div class="card-header"><span>{{ isEdit?'编辑':'新增' }}红色旅游</span><el-button @click="router.push('/red-tourism')">返回</el-button></div></template>
      <el-form ref="formRef" :model="form" label-width="120px" class="form">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" placeholder="景点名称" /></el-form-item>
        <el-form-item label="类型" prop="type"><el-select v-model="form.type" style="width:200px"><el-option label="革命遗址" value="site" /><el-option label="纪念馆" value="museum" /><el-option label="纪念碑" value="memorial" /></el-select></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tag" style="width:200px" /></el-form-item>
        <el-form-item label="地区" prop="region"><el-select v-model="form.region" style="width:200px"><el-option label="贵阳" value="贵阳" /><el-option label="遵义" value="遵义" /><el-option label="毕节" value="毕节" /></el-select></el-form-item>
        <el-form-item label="开放时间"><el-input v-model="form.openTime" style="width:200px" /></el-form-item>
        <el-form-item label="门票信息"><el-input v-model="form.ticketInfo" style="width:200px" /></el-form-item>
        <el-form-item label="景点介绍"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="历史背景"><el-input v-model="form.history" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="历史意义"><el-input v-model="form.significance" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="参观提示"><el-input v-model="form.tips" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="经纬度"><el-input-number v-model="form.latitude" :precision="6" style="width:150px" /> - <el-input-number v-model="form.longitude" :precision="6" style="width:150px" /></el-form-item>
        <el-form-item label="主图"><div class="img-upload"><el-image v-if="form.coverImage" :src="form.coverImage" fit="cover" class="preview" /><el-upload v-else class="upload" :show-file-list="false" :http-request="handleImageUpload"><el-icon><Plus /></el-icon></el-upload></div></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="推荐"><el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">上架</el-radio><el-radio :value="0">下架</el-radio></el-radio-group></el-form-item>
        <el-form-item><el-button type="primary" :loading="saving" @click="handleSubmit">{{ saving?'保存中...':'保存' }}</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getRedTourismDetail, createRedTourism, updateRedTourism } from '@/api/red-tourism'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)
const form = reactive({ name: '', type: 'site', tag: '', region: '', coverImage: '', description: '', history: '', significance: '', tips: '', openTime: '', ticketInfo: '', latitude: null, longitude: null, sortOrder: 0, isRecommended: 0, status: 1 })

const loadDetail = async () => { 
  if (route.params.id) { 
    const res = await getRedTourismDetail(route.params.id); 
    if (res.code === 200) {
      Object.assign(form, res.data)
      if (res.data.coverImage) {
        form.coverImage = res.data.coverImage
      }
    }
  } 
}

const handleImageUpload = async (options) => {
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
  saving.value = true
  try {
    const data = {
      name: form.name,
      type: form.type,
      tags: form.tag || '', //【改】标签字段名修正为tags
      region: form.region,
      openTime: form.openTime || '',
      ticketInfo: form.ticketInfo || '',
      description: form.description || '',
      history: form.history || '', //【改】字段名修正为history，对应历史背景
      significance: form.significance || '', //【改】字段名修正为significance，对应历史意义
      tips: form.tips || '',
      coverImage: form.coverImage || '',
      latitude: form.latitude,
      longitude: form.longitude,
      sortOrder: form.sortOrder,
      isRecommended: form.isRecommended,
      status: form.status
    }
    
    let res
    if (isEdit.value) {
      res = await updateRedTourism(route.params.id, data)
    } else {
      res = await createRedTourism(data)
    }
    
    if (res.code === 200) {
      ElMessage.success('成功')
      router.push('/red-tourism')
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
.red-tourism-edit { .card-header { display: flex; justify-content: space-between; } .form { max-width: 800px; } .img-upload { display: flex; gap: 15px; .preview { width: 200px; height: 133px; border-radius: 8px; } .upload { width: 200px; height: 133px; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; } } }
</style>
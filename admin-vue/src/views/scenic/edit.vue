<template>
  <div class="scenic-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑景点' : '新增景点' }}</span>
          <el-button @click="router.push('/scenic')">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="scenic-form"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="景点名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入景点名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="景点地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" maxlength="500" />
            </el-form-item>

            <el-form-item label="所属地区" prop="region">
              <el-select v-model="form.region" placeholder="请选择地区" style="width: 200px">
                <el-option label="贵阳" value="贵阳" />
                <el-option label="遵义" value="遵义" />
                <el-option label="安顺" value="安顺" />
                <el-option label="毕节" value="毕节" />
                <el-option label="铜仁" value="铜仁" />
                <el-option label="黔东南" value="黔东南" />
                <el-option label="黔南" value="黔南" />
                <el-option label="黔西南" value="黔西南" />
                <el-option label="六盘水" value="六盘水" />
              </el-select>
            </el-form-item>

            <el-form-item label="评分" prop="rating">
              <el-rate v-model="form.rating" allow-half show-text :texts="['1分', '2分', '3分', '4分', '5分']" />
            </el-form-item>

            <el-form-item label="景点简介" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="5"
                placeholder="请输入景点介绍"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="景点标签">
              <div class="tags-input">
                <el-tag
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  closable
                  @close="handleRemoveTag(index)"
                  style="margin-right: 10px; margin-bottom: 10px"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="form.tags.length < 6"
                  v-model="newTag"
                  size="small"
                  style="width: 120px"
                  placeholder="输入标签"
                  @keyup.enter="handleAddTag"
                  @blur="handleAddTag"
                />
              </div>
              <span class="tips">最多添加6个标签</span>
            </el-form-item>

            <el-form-item label="游玩建议" prop="tips">
              <el-input
                v-model="form.tips"
                type="textarea"
                :rows="3"
                placeholder="建议游玩时间、最佳季节、注意事项等"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="交通指南" prop="trafficInfo">
              <el-input
                v-model="form.trafficInfo"
                type="textarea"
                :rows="3"
                placeholder="公共交通、自驾路线等"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="经纬度">
              <el-input-number v-model="form.latitude" :precision="6" :step="0.001" placeholder="纬度" style="width: 150px" />
              <span style="margin: 0 10px">-</span>
              <el-input-number v-model="form.longitude" :precision="6" :step="0.001" placeholder="经度" style="width: 150px" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="图片管理" name="images">
            <el-form-item label="主图" prop="coverImage">
              <div class="image-upload-item">
                <el-image
                  v-if="form.coverImage"
                  :src="form.coverImage"
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="[form.coverImage]"
                  @error="handleImageError('cover')"
                ></el-image>
                <el-upload
                  v-else
                  class="upload-placeholder"
                  :show-file-list="false"
                  :http-request="(options) => handleUpload(options, 'main')"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                  <span>上传主图</span>
                </el-upload>
                <span class="tips">必填，建议尺寸 750x500</span>
              </div>
            </el-form-item>

            <el-form-item label="轮播图">
              <div class="images-grid">
                <div
                  v-for="(img, index) in form.images"
                  :key="index"
                  class="image-item"
                >
                  <el-image :src="img" fit="cover" :preview-src-list="form.images" @error="handleImageError('list', index)"></el-image>
                  <div class="image-actions">
                    <el-icon @click="handleMoveImage(index, -1)" :disabled="index === 0"><ArrowLeft /></el-icon>
                    <el-icon @click="handleMoveImage(index, 1)" :disabled="index === form.images.length - 1"><ArrowRight /></el-icon>
                    <el-icon @click="handleRemoveImage(index)"><Delete /></el-icon>
                  </div>
                </div>

                <el-upload
                  v-if="form.images.length < 9"
                  class="upload-add"
                  :show-file-list="false"
                  :http-request="(options) => handleUpload(options, 'list')"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                  <span>添加图片</span>
                </el-upload>
              </div>
              <span class="tips">最多上传9张图片</span>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-form-item label="景区公告">
              <el-input
                v-model="form.notice"
                type="textarea"
                :rows="3"
                placeholder="输入景区公告信息，将在小程序景点列表中显示"
                maxlength="500"
                show-word-limit
              />
              <span class="tips">公告将在小程序景点列表中以醒目标识展示</span>
            </el-form-item>

            <el-form-item label="开放时间">
              <el-input v-model="form.openTime" placeholder="如：08:00-18:00" style="width: 300px" />
            </el-form-item>

            <el-form-item label="门票价格">
              <el-input v-model="form.ticketPrice" placeholder="如：160元/人" style="width: 300px" />
            </el-form-item>

            <el-form-item label="建议时长">
              <el-input v-model="form.suggestedDuration" placeholder="如：3-4小时" style="width: 300px" />
            </el-form-item>

            <el-form-item label="最佳季节">
              <el-checkbox-group v-model="form.bestSeason">
                <el-checkbox value="春季">春季</el-checkbox>
                <el-checkbox value="夏季">夏季</el-checkbox>
                <el-checkbox value="秋季">秋季</el-checkbox>
                <el-checkbox value="冬季">冬季</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
              <span class="tips">数字越小越靠前</span>
            </el-form-item>

            <el-form-item label="推荐">
              <el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" />
            </el-form-item>

            <el-form-item label="热门">
              <el-switch v-model="form.isHot" :active-value="1" :inactive-value="0" />
            </el-form-item>

            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">上架</el-radio>
                <el-radio :value="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item class="form-actions">
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
          <el-button @click="router.push('/scenic')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getScenicDetail, createScenic, updateScenic } from '@/api/scenic'
import { ElMessage } from 'element-plus'
import { Plus, Delete, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const activeTab = ref('basic')
const saving = ref(false)
const newTag = ref('')

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  address: '',
  region: '',
  rating: 0,
  coverImage: '',
  images: [],
  description: '',
  tags: [],
  tips: '',
  trafficInfo: '',
  latitude: null,
  longitude: null,
  notice: '', //【新增】景区公告
  openTime: '',
  ticketPrice: '',
  suggestedDuration: '',
  bestSeason: [],
  sortOrder: 0,
  isRecommended: 0,
  isHot: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入景点地址', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  coverImage: [{ required: true, message: '请上传主图', trigger: 'change' }],
  description: [{ required: true, message: '请输入景点介绍', trigger: 'blur' }]
}

const loadDetail = async () => {
  if (!route.params.id) return
  try {
    const res = await getScenicDetail(route.params.id)
    if (res.code === 200) {
      const data = res.data
      // 处理数组字段（后端返回的是JSON字符串）
      if (data.images && typeof data.images === 'string') {
        try {
          data.images = JSON.parse(data.images)
        } catch (e) {
          data.images = []
        }
      } else {
        data.images = []
      }
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags)
        } catch (e) {
          data.tags = []
        }
      } else {
        data.tags = []
      }
      
      // 检查并处理Blob URL（旧数据）
      if (data.coverImage && data.coverImage.startsWith('blob:')) {
        data.coverImage = ''
        ElMessage.warning('主图需要重新上传')
      }
      data.images = data.images.filter(img => !img.startsWith('blob:'))
      if (data.images.length === 0) {
        ElMessage.warning('轮播图需要重新上传')
      }
      
      Object.assign(form, data)
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const handleAddTag = () => {
  if (newTag.value && !form.tags.includes(newTag.value)) {
    form.tags.push(newTag.value)
  }
  newTag.value = ''
}

const handleRemoveTag = (index) => {
  form.tags.splice(index, 1)
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
      } else {
        form.images.push(url)
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

const handleMoveImage = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.images.length) return
  const temp = form.images[index]
  form.images[index] = form.images[newIndex]
  form.images[newIndex] = temp
}

const handleRemoveImage = (index) => {
    form.images.splice(index, 1)
  }

  const handleImageError = (type, index) => { //【改】图片加载失败处理
    if (type === 'cover') {
      form.coverImage = ''
      ElMessage.warning('主图加载失败，请重新上传')
    } else if (type === 'list' && index !== undefined) {
      form.images.splice(index, 1)
      ElMessage.warning('第' + (index + 1) + '张轮播图加载失败，已自动移除')
    }
  }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    // 将数组字段转换为JSON字符串
    const now = new Date()
    const data = {
      ...form,
      images: JSON.stringify(form.images),
      tags: JSON.stringify(form.tags),
      noticeTime: form.notice ? now.toISOString() : null //【改】使用ISO 8601格式
    }
    let res
    if (isEdit.value) {
      res = await updateScenic(route.params.id, data)
    } else {
      res = await createScenic(data)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      router.push('/scenic')
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
  }
})
</script>

<style lang="scss" scoped>
.scenic-edit {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .scenic-form {
    max-width: 900px;

    .tags-input {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }

    .tips {
      font-size: 12px;
      color: #909399;
      margin-left: 10px;
    }

    .image-upload-item {
      display: flex;
      align-items: center;
      gap: 15px;

      .preview-image {
        width: 200px;
        height: 133px;
        border-radius: 8px;
      }

      .upload-placeholder {
        width: 200px;
        height: 133px;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
        }

        .el-icon {
          font-size: 30px;
          color: #8c939d;
        }

        span {
          font-size: 12px;
          color: #8c939d;
          margin-top: 5px;
        }
      }
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px;

      .image-item {
        position: relative;
        aspect-ratio: 4/3;
        border-radius: 8px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
        }

        .image-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 8px;
          opacity: 0;
          transition: opacity 0.3s;

          .el-icon {
            color: #fff;
            font-size: 16px;
            cursor: pointer;

            &:hover {
              color: #409eff;
            }

            &[disabled] {
              color: #999;
              cursor: not-allowed;
            }
          }
        }

        &:hover .image-actions {
          opacity: 1;
        }
      }

      .upload-add {
        aspect-ratio: 4/3;
        border: 1px dashed #d9d9d9;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
        }

        .el-icon {
          font-size: 24px;
          color: #8c939d;
        }

        span {
          font-size: 12px;
          color: #8c939d;
          margin-top: 5px;
        }
      }
    }

    .form-actions {
      margin-top: 40px;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  }
}
</style>
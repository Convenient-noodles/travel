<template>
  <div class="food-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑美食' : '新增美食' }}</span>
          <el-button @click="router.push('/food')">返回列表</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="food-form">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="美食名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入美食名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 200px">
                <el-option label="街头小吃" value="street" />
                <el-option label="特色菜肴" value="course" />
                <el-option label="休闲零食" value="snack" />
                <el-option label="特色饮品" value="drink" />
              </el-select>
            </el-form-item>

            <el-form-item label="标签">
              <el-input v-model="form.tags" placeholder="如：贵阳特色、人气推荐" style="width: 300px" />
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
              </el-select>
            </el-form-item>

            <el-form-item label="价格区间">
              <el-input v-model="form.priceRange" placeholder="如：15-25元" style="width: 200px" />
            </el-form-item>

            <el-form-item label="简介" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入美食简介"
                maxlength="300"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="口味特色">
              <el-input
                v-model="form.taste"
                type="textarea"
                :rows="3"
                placeholder="口味描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="历史由来">
              <el-input
                v-model="form.history"
                type="textarea"
                :rows="4"
                placeholder="美食的历史故事"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="详细信息" name="detail">
            <el-form-item label="亮点特色">
              <el-input
                v-model="form.highlights"
                type="textarea"
                :rows="4"
                placeholder="主要特色，每行一个"
              />
            </el-form-item>

            <el-form-item label="店铺地址">
              <el-input v-model="form.address" placeholder="如：贵州省毕节市七星关区..." />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="经度">
                  <el-input-number v-model="form.longitude" :precision="6" :step="0.001" :min="-180" :max="180" controls-position="right" style="width:100%" placeholder="如：105.818275" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纬度">
                  <el-input-number v-model="form.latitude" :precision="6" :step="0.001" :min="-90" :max="90" controls-position="right" style="width:100%" placeholder="如：27.302618" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="制作工艺">
              <el-input
                v-model="form.craft"
                type="textarea"
                :rows="3"
                placeholder="制作方法介绍"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="推荐店铺">
              <div class="shops-list">
                <div v-for="(shop, index) in form.recommendedDishes" :key="index" class="shop-item">
                  <el-input v-model="shop.name" placeholder="店铺名称" style="width: 180px" />
                  <el-input v-model="shop.address" placeholder="店铺地址" style="flex: 1" />
                  <el-input v-model="shop.phone" placeholder="电话" style="width: 130px" />
                  <el-input-number v-model="shop.longitude" :precision="6" :step="0.001" placeholder="经度" style="width: 130px" size="small" />
                  <el-input-number v-model="shop.latitude" :precision="6" :step="0.001" placeholder="纬度" style="width: 130px" size="small" />
                  <el-button type="danger" @click="form.recommendedDishes.splice(index, 1)">删除</el-button>
                </div>
                <el-button type="primary" plain @click="addShop()">
                  添加店铺
                </el-button>
              </div>
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
                  @error="(e) => handleCoverImageError(e)" <!--【改】添加图片加载错误处理 -->
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
              </div>
            </el-form-item>

            <el-form-item label="图片集">
              <div class="images-grid">
                <div v-for="(img, index) in form.images" :key="index" class="image-item">
                  <el-image :src="img" fit="cover" @error="(e) => handleImageListError(e, index)"></el-image>
                  <div class="image-actions">
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
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
            </el-form-item>
            <el-form-item label="推荐">
              <el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" />
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
          <el-button @click="router.push('/food')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFoodDetail, createFood, updateFood } from '@/api/food'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const activeTab = ref('basic')
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  category: 'street',
  tags: '',
  region: '',
  priceRange: '',
  coverImage: '',
  images: [],
  description: '',
  taste: '',
  history: '',
  highlights: '',
  craft: '',
  address: '',
  latitude: null,
  longitude: null,
  recommendedDishes: [],
  sortOrder: 0,
  isRecommended: 0,
  status: 1
})

const addShop = () => {
  form.recommendedDishes.push({ name: '', address: '', phone: '', longitude: null, latitude: null })
}

const rules = {
  name: [{ required: true, message: '请输入美食名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }]
}

const loadDetail = async () => {
  if (!route.params.id) return
  try {
    const res = await getFoodDetail(route.params.id)
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
      if (data.recommendedDishes && typeof data.recommendedDishes === 'string') {
        try {
          data.recommendedDishes = JSON.parse(data.recommendedDishes)
        } catch (e) {
          data.recommendedDishes = []
        }
      } else {
        data.recommendedDishes = []
      }
      Object.assign(form, data)
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
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

const handleCoverImageError = (e) => { //【改】主图加载失败处理
  e.preventDefault()
  form.coverImage = ''
  ElMessage.warning('主图加载失败，请重新上传')
}

const handleImageListError = (e, index) => { //【改】图片集加载失败处理
  e.preventDefault()
  form.images.splice(index, 1)
  ElMessage.warning('图片加载失败，已自动移除')
}

const handleRemoveImage = (index) => {
  form.images.splice(index, 1)
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    // 将数组字段转换为JSON字符串
    const data = {
      ...form,
      images: JSON.stringify(form.images),
      recommendedDishes: JSON.stringify(form.recommendedDishes)
    }
    let res
    if (isEdit.value) {
      res = await updateFood(route.params.id, data)
    } else {
      res = await createFood(data)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      router.push('/food')
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
.food-edit {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .food-form {
    max-width: 900px;

    .shops-list {
      .shop-item {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
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
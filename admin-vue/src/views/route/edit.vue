<template>
  <div class="route-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑' : '新增' }}旅游路线</span>
          <el-button @click="router.push('/route')">返回列表</el-button>
        </div>
      </template>

      <!-- ==================== 基本信息 ==================== -->
      <el-form ref="formRef" :model="form" label-width="100px" class="edit-form">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路线名称" prop="name">
              <el-input v-model="form.name" placeholder="如：毕节一周游" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标签" prop="tag">
              <el-input v-model="form.tag" placeholder="如：7日深度游" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="地区" prop="region">
              <el-select v-model="form.region">
                <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="行程天数">
              <el-input-number v-model="form.days" :min="1" :max="30" @change="onDaysChange" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="住宿晚数">
              <el-input-number v-model="form.nights" :min="0" :max="30" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="价格(元)">
              <el-input-number v-model="form.price" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最佳季节">
              <el-input v-model="form.bestSeason" placeholder="如：3-10月" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="适合人群">
              <el-input v-model="form.suitableFor" placeholder="如：家庭游、摄影爱好者" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="推荐">
              <el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="热门">
              <el-switch v-model="form.isHot" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="路线描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="路线总体介绍" />
        </el-form-item>

        <el-form-item label="路线亮点">
          <el-input v-model="form.highlights" type="textarea" :rows="3" placeholder="每行一个亮点" />
        </el-form-item>

        <el-form-item label="费用包含">
          <el-input v-model="form.includes" type="textarea" :rows="2" placeholder="每行一项" />
        </el-form-item>

        <el-form-item label="温馨提示">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="每行一条" />
        </el-form-item>

        <el-form-item label="封面图">
          <div class="img-upload">
            <el-image v-if="form.coverImage" :src="form.coverImage" fit="cover" class="cover-preview" />
            <el-upload v-else class="cover-upload-box" :show-file-list="false" :http-request="handleCoverUpload">
              <el-icon><Plus /></el-icon>
            </el-upload>
            <el-button v-if="form.coverImage" type="danger" size="small" plain @click="form.coverImage = ''">移除</el-button>
          </div>
        </el-form-item>

        <!-- ==================== 每日行程编辑 ==================== -->
        <el-divider content-position="left">每日行程安排</el-divider>
        <div class="itinerary-editor" v-if="itineraryDays.length > 0">
          <el-collapse v-model="activeDays" accordion>
            <el-collapse-item
              v-for="(day, dayIdx) in itineraryDays"
              :key="day.day"
              :name="day.day"
            >
              <template #title>
                <div class="day-collapse-title">
                  <el-tag type="success" size="small">第{{ day.day }}天</el-tag>
                  <el-input
                    v-model="day.title"
                    placeholder="当日标题（如：百里杜鹃花海漫游）"
                    size="small"
                    class="day-title-input"
                    @click.stop
                  />
                </div>
              </template>

              <!-- 餐饮住宿 -->
              <el-row :gutter="12" class="day-meta-row">
                <el-col :span="12">
                  <el-input v-model="day.meals" placeholder="餐饮安排（如：含早中晚餐）" size="small">
                    <template #prepend>🍽️ 餐饮</template>
                  </el-input>
                </el-col>
                <el-col :span="12">
                  <el-input v-model="day.hotel" placeholder="住宿（如：毕节洪山国际酒店）" size="small">
                    <template #prepend>🏨 住宿</template>
                  </el-input>
                </el-col>
              </el-row>

              <!-- 景点列表 -->
              <div class="spots-section">
                <div class="spots-header">
                  <span class="spots-label">景点安排 ({{ day.spots.length }})</span>
                  <el-button type="primary" size="small" plain @click="addSpot(dayIdx)">
                    <el-icon><Plus /></el-icon> 添加景点
                  </el-button>
                </div>

                <div class="spot-editor-card" v-for="(spot, spotIdx) in day.spots" :key="spotIdx">
                  <div class="spot-header-row">
                    <span class="spot-index">景点 {{ spotIdx + 1 }}</span>
                    <el-button type="danger" size="small" plain @click="removeSpot(dayIdx, spotIdx)">删除</el-button>
                  </div>

                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-input v-model="spot.name" placeholder="景点名称" size="small">
                        <template #prepend>名称</template>
                      </el-input>
                    </el-col>
                    <el-col :span="12">
                      <el-input v-model="spot.duration" placeholder="游玩时长（如：3-4小时）" size="small">
                        <template #prepend>时长</template>
                      </el-input>
                    </el-col>
                  </el-row>

                  <el-input
                    v-model="spot.description"
                    type="textarea"
                    :rows="2"
                    placeholder="景点描述（如：世界地质公园，中国最美溶洞之一）"
                    class="spot-desc-input"
                  />

                  <el-input
                    v-model="spot.travelFrom"
                    placeholder="车程衔接信息（如：从毕节市区出发，车程约1小时）"
                    size="small"
                    class="spot-travel-input"
                  >
                    <template #prepend>🚗 交通</template>
                  </el-input>

                  <div class="spot-image-area">
                    <el-image
                      v-if="spot.image"
                      :src="spot.image"
                      fit="cover"
                      class="spot-thumb"
                    />
                    <el-upload
                      v-else
                      class="spot-upload"
                      :show-file-list="false"
                      :http-request="(opts) => handleSpotImageUpload(opts, dayIdx, spotIdx)"
                    >
                      <div class="spot-upload-trigger">
                        <el-icon><Plus /></el-icon>
                        <span>上传景点配图</span>
                      </div>
                    </el-upload>
                    <el-button v-if="spot.image" type="danger" size="small" plain @click="spot.image = ''">移除图片</el-button>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-empty v-else description="请先设置行程天数" :image-size="80" />

        <!-- 保存 -->
        <el-form-item class="submit-row">
          <el-button type="primary" size="large" :loading="saving" @click="handleSubmit">
            {{ saving ? '保存中...' : '保存路线' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getRouteDetail, createRoute, updateRoute } from '@/api/route'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)
const activeDays = ref([])

const regions = ['贵阳', '遵义', '安顺', '毕节', '铜仁', '黔东南', '黔南', '黔西南', '六盘水']

const form = reactive({
  name: '', tag: '', region: '', days: 3, nights: 2,
  price: 0, coverImage: '', description: '', highlights: '',
  includes: '', suitableFor: '', bestSeason: '', notes: '',
  isRecommended: 0, isHot: 0, status: 1
})

const itineraryDays = reactive([])

// ==================== 行程数据管理 ====================
const createEmptyDay = (dayNum) => ({
  day: dayNum,
  title: '',
  spots: [{ name: '', image: '', duration: '', description: '', travelFrom: '' }],
  meals: '',
  hotel: ''
})

const initItinerary = () => {
  itineraryDays.splice(0, itineraryDays.length)
  for (let i = 0; i < form.days; i++) {
    itineraryDays.push(createEmptyDay(i + 1))
  }
}

const onDaysChange = () => {
  const currentLength = itineraryDays.length
  if (form.days > currentLength) {
    for (let i = currentLength; i < form.days; i++) {
      itineraryDays.push(createEmptyDay(i + 1))
    }
  } else if (form.days < currentLength) {
    itineraryDays.splice(form.days, currentLength - form.days)
  }
  form.nights = Math.max(0, form.days - 1)
}

const loadItinerary = (jsonStr) => {
  if (!jsonStr) { initItinerary(); return }
  try {
    const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    if (!Array.isArray(parsed) || parsed.length === 0) { initItinerary(); return }
    itineraryDays.splice(0, itineraryDays.length)
    parsed.forEach(day => {
      const spots = Array.isArray(day.spots) ? day.spots.map(s => ({
        name: s.name || '', image: s.image || '', duration: s.duration || '',
        description: s.description || '', travelFrom: s.travelFrom || ''
      })) : [{ name: '', image: '', duration: '', description: '', travelFrom: '' }]
      itineraryDays.push({ day: day.day, title: day.title || '', spots, meals: day.meals || '', hotel: day.hotel || '' })
    })
  } catch (e) {
    console.error('解析行程数据失败:', e)
    initItinerary()
  }
}

// ==================== 景点操作 ====================
const addSpot = (dayIdx) => {
  itineraryDays[dayIdx].spots.push({ name: '', image: '', duration: '', description: '', travelFrom: '' })
}

const removeSpot = (dayIdx, spotIdx) => {
  const spots = itineraryDays[dayIdx].spots
  if (spots.length > 1) {
    spots.splice(spotIdx, 1)
  } else {
    ElMessage.warning('每天至少保留一个景点')
  }
}

// ==================== 图片上传 ====================
const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  return await res.json()
}

const handleCoverUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    const result = await uploadFile(file)
    if (result.code === 200) { form.coverImage = result.data; onSuccess?.() }
    else { ElMessage.error(result.message || '上传失败'); onError?.() }
  } catch { ElMessage.error('上传失败'); onError?.() }
}

const handleSpotImageUpload = async (options, dayIdx, spotIdx) => {
  const { file, onSuccess, onError } = options
  try {
    const result = await uploadFile(file)
    if (result.code === 200) { itineraryDays[dayIdx].spots[spotIdx].image = result.data; onSuccess?.() }
    else { ElMessage.error(result.message || '上传失败'); onError?.() }
  } catch { ElMessage.error('上传失败'); onError?.() }
}

// ==================== 保存 ====================
const buildSubmitData = () => {
  const itinerary = itineraryDays.map(day => ({
    day: day.day,
    title: day.title,
    spots: day.spots.map(s => ({
      name: s.name, image: s.image, duration: s.duration,
      description: s.description, travelFrom: s.travelFrom
    })),
    meals: day.meals,
    hotel: day.hotel
  }))
  return { ...form, itinerary: JSON.stringify(itinerary) }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const data = buildSubmitData()
    const api = isEdit.value ? updateRoute : createRoute
    const params = isEdit.value ? [route.params.id, data] : [data]
    const res = await api(...params)
    if (res.code === 200) { ElMessage.success('保存成功'); router.push('/route') }
    else { ElMessage.error(res.message || '保存失败') }
  } catch { ElMessage.error('操作失败') }
  finally { saving.value = false }
}

// ==================== 加载详情 ====================
const loadDetail = async () => {
  if (!route.params.id) { initItinerary(); return }
  const res = await getRouteDetail(route.params.id)
  if (res.code !== 200) return
  const data = res.data
  ;['name','tag','region','days','nights','price','coverImage','description','highlights','includes','suitableFor','bestSeason','notes','isRecommended','isHot'].forEach(k => {
    if (data[k] !== undefined) form[k] = data[k]
  })
  loadItinerary(data.itinerary)
}

onMounted(() => loadDetail())
</script>

<style lang="scss" scoped>
.route-edit {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .edit-form { max-width: 1000px; }

  .img-upload {
    display: flex; align-items: center; gap: 12px;
    .cover-preview { width: 200px; height: 133px; border-radius: 8px; }
    .cover-upload-box {
      width: 200px; height: 133px; border: 1px dashed #d9d9d9;
      border-radius: 8px; display: flex; align-items: center;
      justify-content: center; cursor: pointer;
      &:hover { border-color: #27AE60; }
    }
  }

  .itinerary-editor { margin-top: 16px; }

  .day-collapse-title {
    display: flex; align-items: center; gap: 12px; width: 100%;
    .day-title-input { flex: 1; }
  }

  .day-meta-row { margin-bottom: 16px; padding: 0 12px; }

  .spots-section {
    padding: 0 12px;
    .spots-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
      .spots-label { font-weight: 500; color: #666; font-size: 13px; }
    }
  }

  .spot-editor-card {
    padding: 14px; margin-bottom: 14px;
    background: #fafafa; border: 1px solid #eee; border-radius: 10px;
    display: flex; flex-direction: column; gap: 10px;

    .spot-header-row {
      display: flex; justify-content: space-between; align-items: center;
      .spot-index { font-size: 13px; font-weight: 600; color: #27AE60; }
    }

    .spot-desc-input, .spot-travel-input { margin: 0; }

    .spot-image-area {
      display: flex; align-items: center; gap: 10px;
      .spot-thumb { width: 120px; height: 80px; border-radius: 6px; }
      .spot-upload {
        .spot-upload-trigger {
          width: 120px; height: 80px; border: 1px dashed #d9d9d9;
          border-radius: 6px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; cursor: pointer;
          font-size: 12px; color: #999; gap: 4px;
          &:hover { border-color: #27AE60; color: #27AE60; }
        }
      }
    }
  }

  .submit-row {
    margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;
  }
}
</style>

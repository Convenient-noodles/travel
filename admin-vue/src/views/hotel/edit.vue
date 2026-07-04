<template>
  <div class="hotel-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑酒店' : '新增酒店' }}</span>
          <el-button @click="router.push('/hotel')">返回列表</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="hotel-form">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="酒店名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入酒店名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="酒店类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 200px">
                <el-option v-for="t in HOTEL_TYPE_OPTIONS" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="星级">
              <el-rate v-model="form.starLevel" />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="form.tag" placeholder="如：靠近景区、温泉酒店" style="width: 300px" />
            </el-form-item>
            <el-form-item label="地区" prop="region">
              <el-select v-model="form.region" placeholder="请选择地区" style="width: 200px">
                <el-option v-for="r in GUIZHOU_REGIONS" :key="r" :label="r" :value="r" />
              </el-select>
            </el-form-item>
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="经度 (Longitude)">
                  <el-input-number v-model="form.longitude" :precision="6" :step="0.001" :min="-180" :max="180" controls-position="right" style="width:100%" placeholder="如：106.719997" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纬度 (Latitude)">
                  <el-input-number v-model="form.latitude" :precision="6" :step="0.001" :min="-90" :max="90" controls-position="right" style="width:100%" placeholder="如：26.599999" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-text type="info" size="small">💡 提示：可在腾讯地图或百度地图搜索酒店地址后，右键点击位置获取坐标（需使用GCJ02坐标系）</el-text>
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="酒店前台电话，小程序用户可直接拨打" style="width:260px">
                <template #prepend>📞</template>
              </el-input>
            </el-form-item>

            <el-form-item label="酒店介绍">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="酒店介绍" />
            </el-form-item>
            <el-form-item label="设施服务">
              <el-checkbox-group v-model="form.facilities">
                <el-checkbox value="免费WiFi">免费WiFi</el-checkbox>
                <el-checkbox value="停车场">停车场</el-checkbox>
                <el-checkbox value="游泳池">游泳池</el-checkbox>
                <el-checkbox value="健身房">健身房</el-checkbox>
                <el-checkbox value="餐厅">餐厅</el-checkbox>
                <el-checkbox value="会议室">会议室</el-checkbox>
                <el-checkbox value="接机服务">接机服务</el-checkbox>
                <el-checkbox value="行李寄存">行李寄存</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="房型价格" name="rooms">
            <div class="rooms-list">
              <div v-for="(room, index) in form.roomTypes" :key="index" class="room-item">
                <el-input v-model="room.name" placeholder="房型名称" style="width: 150px" />
                <el-input v-model="room.price" placeholder="价格" style="width: 120px" />
                <el-input v-model="room.bed" placeholder="床型" style="width: 120px" />
                <el-input v-model="room.capacity" placeholder="可住人数" style="width: 100px" />
                <el-button type="danger" @click="form.roomTypes.splice(index, 1)">删除</el-button>
              </div>
              <el-button type="primary" plain @click="form.roomTypes.push({ name: '', price: '', bed: '', capacity: '' })">
                添加房型
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="图片管理" name="images">
            <el-form-item label="主图" prop="mainImage">
              <div class="image-upload">
                <el-image v-if="form.mainImage" :src="form.mainImage" fit="cover" class="preview" :preview-src-list="[form.mainImage]" />
                <el-upload v-else class="upload-placeholder" :show-file-list="false" :http-request="(o) => handleUpload(o, 'main')" accept="image/*">
                  <el-icon><Plus /></el-icon><span>上传主图</span>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="图片集">
              <div class="images-grid">
                <div v-for="(img, i) in form.images" :key="i" class="image-item">
                  <el-image :src="img" fit="cover" />
                  <div class="image-actions"><el-icon @click="form.images.splice(i, 1)"><Delete /></el-icon></div>
                </div>
                <el-upload v-if="form.images.length < 9" class="upload-add" :show-file-list="false" :http-request="(o) => handleUpload(o, 'list')" accept="image/*">
                  <el-icon><Plus /></el-icon><span>添加</span>
                </el-upload>
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="支付配置" name="payment">
            <el-alert
              title="上传微信收款码，用户预订时扫码支付"
              type="success"
              :closable="false"
              show-icon
              style="margin-bottom:20px"
            >
              <template #default>
                <p style="margin:0;font-size:13px;line-height:1.8">
                  请将微信收款码保存到手机后上传。建议在微信「我」→「服务」→「收付款」→「二维码收款」→「保存收款码」。<br/>
                  上传后，用户在小程序预订房间时将展示该二维码，保存后可扫码支付。
                </p>
              </template>
            </el-alert>
            <el-form-item label="收款码图片">
              <div class="qr-upload">
                <el-image
                  v-if="form.paymentQrCode"
                  :src="form.paymentQrCode"
                  fit="contain"
                  class="qr-preview"
                  :preview-src-list="[form.paymentQrCode]"
                >
                  <template #error>
                    <div class="qr-placeholder"><el-icon><Picture /></el-icon></div>
                  </template>
                </el-image>
                <div v-else class="qr-empty-hint">
                  <el-icon><Picture /></el-icon>
                  <span>尚未上传收款码</span>
                </div>
                <div class="qr-actions">
                  <el-upload
                    class="qr-upload-btn"
                    :show-file-list="false"
                    :http-request="(o) => handleQrUpload(o)"
                    accept="image/*"
                  >
                    <el-button type="primary">
                      <el-icon><Upload /></el-icon> {{ form.paymentQrCode ? '重新上传' : '上传收款码' }}
                    </el-button>
                  </el-upload>
                  <el-button
                    v-if="form.paymentQrCode"
                    type="danger"
                    plain
                    @click="form.paymentQrCode = ''"
                  >
                    移除收款码
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-form-item label="入住时间">
              <el-input v-model="form.checkInTime" placeholder="如：14:00" style="width: 150px" />
            </el-form-item>
            <el-form-item label="退房时间">
              <el-input v-model="form.checkOutTime" placeholder="如：12:00" style="width: 150px" />
            </el-form-item>
            <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
            <el-form-item label="推荐"><el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" /></el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">上架</el-radio>
                <el-radio :value="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item class="form-actions">
          <el-button type="primary" :loading="saving" @click="handleSubmit">{{ saving ? '保存中...' : '保存' }}</el-button>
          <el-button @click="router.push('/hotel')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getHotelDetail, createHotel, updateHotel } from '@/api/hotel'
import request from '@/api/axios'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Picture, Upload } from '@element-plus/icons-vue'
import {
  GUIZHOU_REGIONS, HOTEL_TYPE_OPTIONS,
  UPLOAD_LIMITS
} from '@/constants'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const activeTab = ref('basic')
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)

/** 🔒 通用文件校验：检查类型和大小 */
const validateFile = (file, maxSize, label) => {
  if (!file) return false
  if (!UPLOAD_LIMITS.validImageTypes.includes(file.type)) {
    ElMessage.error(`${label}仅支持 JPG、PNG、GIF、WebP 格式`)
    return false
  }
  if (file.size > maxSize) {
    const sizeMB = (maxSize / 1024 / 1024).toFixed(0)
    ElMessage.error(`${label}大小不能超过 ${sizeMB}MB`)
    return false
  }
  return true
}

const form = reactive({
  name: '', type: 'comfort', starLevel: 3, tag: '', region: '', address: '', mainImage: '', images: [],
  description: '', facilities: [], roomTypes: [], checkInTime: '', checkOutTime: '',
  contactPhone: '', paymentQrCode: '', latitude: null, longitude: null, sortOrder: 0, isRecommended: 0, status: 1
})

const rules = {
  name: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

const loadDetail = async () => {
  if (!route.params.id) return
  const res = await getHotelDetail(route.params.id)
  if (res.code === 200) {
    const data = res.data
    // 字段反向映射
    data.mainImage = data.coverImage
    delete data.coverImage
    data.tag = data.tags
    delete data.tags
    data.contactPhone = data.phone
    delete data.phone
    data.type = data.hotelType
    delete data.hotelType
    data.paymentQrCode = data.paymentQrCode || ''
    
    // 处理数组字段（后端返回的是JSON字符串）
    if (data.facilities && typeof data.facilities === 'string') {
      try {
        data.facilities = JSON.parse(data.facilities)
      } catch (e) {
        data.facilities = []
      }
    } else {
      data.facilities = []
    }
    if (data.roomTypes && typeof data.roomTypes === 'string') {
      try {
        data.roomTypes = JSON.parse(data.roomTypes)
      } catch (e) {
        data.roomTypes = []
      }
    } else {
      data.roomTypes = []
    }
    if (data.images && typeof data.images === 'string') {
      try {
        data.images = JSON.parse(data.images)
      } catch (e) {
        data.images = []
      }
    } else {
      data.images = []
    }
    Object.assign(form, data)
  }
}

const handleUpload = async (options, type) => {
  const { file, onSuccess, onError } = options
  if (!validateFile(file, UPLOAD_LIMITS.maxImageSize, '酒店图片')) {
    onError && onError()
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code === 200) {
      const url = res.data
      if (type === 'main') form.mainImage = url
      else form.images.push(url)
      onSuccess && onSuccess()
    } else {
      ElMessage.error(res.message || '上传失败')
      onError && onError()
    }
  } catch {
    // axios 拦截器已处理全局错误提示
    onError && onError()
  }
}

const handleQrUpload = async (options) => {
  const { file, onSuccess, onError } = options
  if (!validateFile(file, UPLOAD_LIMITS.maxQrSize, '收款码图片')) {
    onError && onError()
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code === 200) {
      form.paymentQrCode = res.data
      ElMessage.success('收款码上传成功')
      onSuccess && onSuccess()
    } else {
      ElMessage.error(res.message || '上传失败')
      onError && onError()
    }
  } catch {
    onError && onError()
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    // 将数组字段转换为JSON字符串，并映射字段名到后端期望的名称
    const submitData = { ...form }
    // 字段映射
    submitData.coverImage = submitData.mainImage
    delete submitData.mainImage
    submitData.tags = submitData.tag
    delete submitData.tag
    submitData.phone = submitData.contactPhone
    delete submitData.contactPhone
    submitData.hotelType = submitData.type
    delete submitData.type
    
    if (submitData.facilities && Array.isArray(submitData.facilities)) {
      submitData.facilities = JSON.stringify(submitData.facilities)
    }
    if (submitData.roomTypes && Array.isArray(submitData.roomTypes)) {
      submitData.roomTypes = JSON.stringify(submitData.roomTypes)
    }
    if (submitData.images && Array.isArray(submitData.images)) {
      submitData.images = JSON.stringify(submitData.images)
    }
    
    const api = isEdit.value ? updateHotel : createHotel
    const res = await api(isEdit.value ? route.params.id : submitData, submitData)
    if (res.code === 200) { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); router.push('/hotel') }
    else ElMessage.error(res.message || '操作失败')
  } catch { ElMessage.error('操作失败') }
  finally { saving.value = false }
}

onMounted(() => { if (isEdit.value) loadDetail() })
</script>

<style lang="scss" scoped>
.hotel-edit {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .hotel-form { max-width: 900px; }
  .rooms-list .room-item { display: flex; gap: 10px; margin-bottom: 15px; }
  .qr-upload { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;
    .qr-preview { width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px; }
    .qr-placeholder { width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 8px; font-size: 40px; color: #ccc; }
    .qr-empty-hint { width: 200px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa; border: 2px dashed #e0e0e0; border-radius: 8px; color: #bbb;
      .el-icon { font-size: 48px; margin-bottom: 10px; }
      span { font-size: 13px; }
    }
    .qr-actions { display: flex; flex-direction: column; gap: 10px; align-self: center; }
    .qr-upload-btn { display: flex; align-items: center; }
  }
  .image-upload { display: flex; align-items: center; gap: 15px;
    .preview { width: 200px; height: 133px; border-radius: 8px; }
    .upload-placeholder { width: 200px; height: 133px; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; &:hover { border-color: #409eff; } .el-icon { font-size: 30px; color: #8c939d; } span { font-size: 12px; color: #8c939d; margin-top: 5px; } }
  }
  .images-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;
    .image-item { position: relative; aspect-ratio: 4/3; border-radius: 8px; overflow: hidden;
      .el-image { width: 100%; height: 100%; }
      .image-actions { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; padding: 8px; opacity: 0; transition: opacity 0.3s;
        .el-icon { color: #fff; font-size: 16px; cursor: pointer; &:hover { color: #409eff; } }
      }
      &:hover .image-actions { opacity: 1; }
    }
    .upload-add { aspect-ratio: 4/3; border: 1px dashed #d9d9d9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; &:hover { border-color: #409eff; } .el-icon { font-size: 24px; color: #8c939d; } span { font-size: 12px; color: #8c939d; margin-top: 5px; } }
  }
  .form-actions { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
}
</style>
<template>
  <div class="config-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" :loading="saving" @click="handleSave">
            保存配置
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicConfig" label-width="140px" class="config-form">
            <el-form-item label="系统名称">
              <el-input v-model="basicConfig.systemName" placeholder="带你黔游" style="width: 300px" />
            </el-form-item>

            <el-form-item label="系统Logo">
              <div class="logo-upload">
                <el-image
                  v-if="basicConfig.logo"
                  :src="basicConfig.logo"
                  fit="contain"
                  class="logo-preview"
                />
                <el-upload
                  :show-file-list="false"
                  :http-request="handleLogoUpload"
                  accept="image/*"
                >
                  <el-button>上传Logo</el-button>
                </el-upload>
              </div>
            </el-form-item>

            <el-form-item label="系统描述">
              <el-input
                v-model="basicConfig.description"
                type="textarea"
                :rows="3"
                placeholder="贵州旅游服务小程序"
                style="width: 400px"
              />
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="basicConfig.keywords"
                placeholder="贵州旅游,黔东南,黄果树瀑布"
                style="width: 400px"
              />
              <span class="tips">多个关键词用英文逗号分隔</span>
            </el-form-item>

            <el-form-item label="版权信息">
              <el-input
                v-model="basicConfig.copyright"
                placeholder="© 2024 带你黔游"
                style="width: 400px"
              />
            </el-form-item>

            <el-form-item label="备案号">
              <el-input
                v-model="basicConfig.icp"
                placeholder="黔ICP备XXXXXXXX号"
                style="width: 300px"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="联系方式" name="contact">
          <el-form :model="contactConfig" label-width="140px" class="config-form">
            <el-form-item label="客服电话">
              <el-input v-model="contactConfig.hotline" placeholder="400-xxxx-xxxx" style="width: 250px" />
            </el-form-item>

            <el-form-item label="客服邮箱">
              <el-input v-model="contactConfig.email" placeholder="support@example.com" style="width: 250px" />
            </el-form-item>

            <el-form-item label="客服微信">
              <el-input v-model="contactConfig.wechat" placeholder="wx_xxxxx" style="width: 250px" />
            </el-form-item>

            <el-form-item label="公司地址">
              <el-input
                v-model="contactConfig.address"
                type="textarea"
                :rows="2"
                placeholder="贵州省贵阳市南明区..."
                style="width: 400px"
              />
            </el-form-item>

            <el-form-item label="工作时间">
              <el-input v-model="contactConfig.workTime" placeholder="周一至周五 9:00-18:00" style="width: 250px" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="小程序设置" name="miniapp">
          <el-form :model="miniappConfig" label-width="140px" class="config-form">
            <el-form-item label="AppID">
              <el-input v-model="miniappConfig.appId" placeholder="wx..." style="width: 300px" />
            </el-form-item>

            <el-form-item label="原始ID">
              <el-input v-model="miniappConfig.originalId" placeholder="gh_..." style="width: 300px" />
            </el-form-item>

            <el-form-item label="小程序版本">
              <el-input v-model="miniappConfig.version" placeholder="1.0.0" style="width: 150px" />
            </el-form-item>

            <el-form-item label="首页标题">
              <el-input v-model="miniappConfig.homeTitle" placeholder="带你黔游" style="width: 200px" />
            </el-form-item>

            <el-form-item label="分享标题">
              <el-input v-model="miniappConfig.shareTitle" placeholder="带你黔游" style="width: 300px" />
            </el-form-item>

            <el-form-item label="分享封面">
              <div class="image-upload-small">
                <el-image
                  v-if="miniappConfig.shareImage"
                  :src="miniappConfig.shareImage"
                  fit="cover"
                  class="preview"
                />
                <el-upload
                  :show-file-list="false"
                  :http-request="handleShareImageUpload"
                  accept="image/*"
                >
                  <el-button size="small">上传图片</el-button>
                </el-upload>
              </div>
              <span class="tips">建议尺寸：500x400</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="首页设置" name="home">
          <el-form :model="homeConfig" label-width="140px" class="config-form">
            <el-form-item label="热门景点数量">
              <el-input-number v-model="homeConfig.hotScenicCount" :min="3" :max="10" />
              <span class="tips">首页热门景点展示数量</span>
            </el-form-item>

            <el-form-item label="热门美食数量">
              <el-input-number v-model="homeConfig.hotFoodCount" :min="3" :max="10" />
              <span class="tips">首页热门美食展示数量</span>
            </el-form-item>

            <el-form-item label="推荐酒店数量">
              <el-input-number v-model="homeConfig.recommendHotelCount" :min="2" :max="6" />
              <span class="tips">首页推荐酒店展示数量</span>
            </el-form-item>

            <el-form-item label="攻略文章数量">
              <el-input-number v-model="homeConfig.articleCount" :min="3" :max="10" />
              <span class="tips">首页攻略文章展示数量</span>
            </el-form-item>

            <el-form-item label="轮播图自动播放">
              <el-switch v-model="homeConfig.bannerAutoPlay" :active-value="1" :inactive-value="0" />
            </el-form-item>

            <el-form-item label="轮播间隔">
              <el-input-number v-model="homeConfig.bannerInterval" :min="2000" :max="10000" :step="500" />
              <span class="tips">单位：毫秒</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="地图设置" name="map">
          <el-form :model="mapConfig" label-width="140px" class="config-form">
            <el-form-item label="地图类型">
              <el-radio-group v-model="mapConfig.type">
                <el-radio value="tencent">腾讯地图</el-radio>
                <el-radio value="baidu">百度地图</el-radio>
                <el-radio value="amap">高德地图</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="腾讯地图Key">
              <el-input v-model="mapConfig.tencentKey" placeholder="腾讯地图Key" style="width: 400px" />
            </el-form-item>

            <el-form-item label="百度地图Key">
              <el-input v-model="mapConfig.baiduKey" placeholder="百度地图Key" style="width: 400px" />
            </el-form-item>

            <el-form-item label="高德地图Key">
              <el-input v-model="mapConfig.amapKey" placeholder="高德地图Key" style="width: 400px" />
            </el-form-item>

            <el-form-item label="默认中心点">
              <div class="location-inputs">
                <el-input v-model="mapConfig.defaultLat" placeholder="纬度" style="width: 150px" />
                <span style="margin: 0 10px">-</span>
                <el-input v-model="mapConfig.defaultLng" placeholder="经度" style="width: 150px" />
              </div>
            </el-form-item>

            <el-form-item label="默认缩放级别">
              <el-input-number v-model="mapConfig.defaultZoom" :min="1" :max="18" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="其他设置" name="other">
          <el-form :model="otherConfig" label-width="140px" class="config-form">
            <el-form-item label="景点评分开启">
              <el-switch v-model="otherConfig.enableRating" :active-value="1" :inactive-value="0" />
              <span class="tips">是否允许用户对景点进行评分</span>
            </el-form-item>

            <el-form-item label="评论审核">
              <el-switch v-model="otherConfig.commentAudit" :active-value="1" :inactive-value="0" />
              <span class="tips">用户评论是否需要审核后显示</span>
            </el-form-item>

            <el-form-item label="用户注册">
              <el-switch v-model="otherConfig.allowRegister" :active-value="1" :inactive-value="0" />
              <span class="tips">是否允许新用户注册</span>
            </el-form-item>

            <el-form-item label="维护模式">
              <el-switch v-model="otherConfig.maintenanceMode" :active-value="1" :inactive-value="0" />
              <span class="tips">开启后用户将看到维护提示</span>
            </el-form-item>

            <el-form-item label="维护提示">
              <el-input
                v-model="otherConfig.maintenanceMessage"
                type="textarea"
                :rows="2"
                placeholder="系统正在维护中，请稍后再试..."
                style="width: 400px"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)

const basicConfig = reactive({
  systemName: '带你黔游',
  logo: '',
  description: '贵州旅游服务小程序',
  keywords: '贵州旅游,黔东南,黄果树瀑布,梵净山',
  copyright: '© 2024 带你黔游',
  icp: ''
})

const contactConfig = reactive({
  hotline: '400-888-8888',
  email: 'support@daiqian.com',
  wechat: 'daiqian_8888',
  address: '贵州省贵阳市南明区花果园',
  workTime: '周一至周五 9:00-18:00'
})

const miniappConfig = reactive({
  appId: '',
  originalId: '',
  version: '1.0.0',
  homeTitle: '带你黔游',
  shareTitle: '带你黔游 - 探索贵州之美',
  shareImage: ''
})

const homeConfig = reactive({
  hotScenicCount: 5,
  hotFoodCount: 4,
  recommendHotelCount: 3,
  articleCount: 5,
  bannerAutoPlay: 1,
  bannerInterval: 3000
})

const mapConfig = reactive({
  type: 'tencent',
  tencentKey: '',
  baiduKey: '',
  amapKey: '',
  defaultLat: '26.598',
  defaultLng: '106.707',
  defaultZoom: 10
})

const otherConfig = reactive({
  enableRating: 1,
  commentAudit: 1,
  allowRegister: 1,
  maintenanceMode: 0,
  maintenanceMessage: '系统正在维护中，请稍后再试...'
})

const handleLogoUpload = async (options) => {
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
      basicConfig.logo = result.data
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

const handleShareImageUpload = async (options) => {
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
      miniappConfig.shareImage = result.data
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

const handleSave = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.config-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .config-form {
    max-width: 600px;

    .tips {
      margin-left: 10px;
      font-size: 12px;
      color: #999;
    }

    .logo-upload {
      display: flex;
      align-items: center;
      gap: 20px;

      .logo-preview {
        width: 120px;
        height: 60px;
        border-radius: 4px;
        background: #f5f5f5;
      }
    }

    .image-upload-small {
      display: flex;
      align-items: center;
      gap: 15px;

      .preview {
        width: 100px;
        height: 80px;
        border-radius: 4px;
        background: #f5f5f5;
      }
    }

    .location-inputs {
      display: flex;
      align-items: center;
    }
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }
}
</style>

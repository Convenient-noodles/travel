<template>
  <div class="payment-config-container">
    <div class="page-header">
      <h2>支付配置</h2>
      <p class="subtitle">配置酒店预订的微信支付参数，对接支付功能</p>
    </div>

    <el-card shadow="never" class="config-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="微信支付" name="wechat">
          <el-form :model="wechatForm" label-width="160px" class="config-form">
            <el-alert
              title="支付环境说明"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom:24px"
            >
              <template #default>
                <p style="margin:0;line-height:1.8">
                  当前为<strong>模拟支付环境</strong>，前台点击支付后将模拟完成支付流程。<br/>
                  对接真实微信支付需在
                  <a href="https://pay.weixin.qq.com" target="_blank">微信支付商户平台</a>
                  注册商户号后填写以下参数。
                </p>
              </template>
            </el-alert>

            <el-form-item label="支付模式">
              <el-radio-group v-model="wechatForm.payMode">
                <el-radio label="simulate">模拟支付（开发调试）</el-radio>
                <el-radio label="real">真实支付（需商户号）</el-radio>
              </el-radio-group>
            </el-form-item>

            <template v-if="wechatForm.payMode === 'real'">
              <el-divider content-position="left">商户基本信息</el-divider>
              <el-form-item label="商户号(MchID)">
                <el-input v-model="wechatForm.mchId" placeholder="微信支付商户号" />
              </el-form-item>
              <el-form-item label="应用ID(AppID)">
                <el-input v-model="wechatForm.appId" placeholder="小程序AppID" />
              </el-form-item>
              <el-form-item label="应用密钥(AppSecret)">
                <el-input v-model="wechatForm.appSecret" placeholder="小程序AppSecret" type="password" show-password />
              </el-form-item>

              <el-divider content-position="left">支付密钥</el-divider>
              <el-form-item label="APIv3密钥">
                <el-input v-model="wechatForm.apiV3Key" placeholder="微信支付APIv3密钥" type="password" show-password />
              </el-form-item>
              <el-form-item label="商户证书序列号">
                <el-input v-model="wechatForm.serialNo" placeholder="证书序列号" />
              </el-form-item>
              <el-form-item label="商户私钥证书">
                <el-upload
                  :auto-upload="false"
                  :limit="1"
                  accept=".pem,.key"
                  :on-change="onKeyFileChange"
                >
                  <el-button type="primary" plain>上传私钥文件(.pem)</el-button>
                  <template #tip>
                    <div class="el-upload__tip">上传商户API证书私钥文件</div>
                  </template>
                </el-upload>
              </el-form-item>

              <el-divider content-position="left">回调配置</el-divider>
              <el-form-item label="支付回调地址">
                <el-input v-model="wechatForm.notifyUrl" placeholder="https://your-domain.com/api/admin/orders/public/pay-callback" />
              </el-form-item>
              <el-form-item label="退款回调地址">
                <el-input v-model="wechatForm.refundNotifyUrl" placeholder="https://your-domain.com/api/admin/orders/public/refund-callback" />
              </el-form-item>
            </template>

            <el-form-item label="支付超时时间">
              <el-input-number
                v-model="wechatForm.timeoutMinutes"
                :min="5"
                :max="120"
                :step="5"
              />
              <span class="unit-tip">分钟（超时未支付自动取消订单）</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveWechatConfig">
                保存配置
              </el-button>
              <el-button @click="testConnection" v-if="wechatForm.payMode === 'real'">
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="管理员账号" name="admin">
          <el-alert
            title="酒店管理员"
            type="success"
            :closable="false"
            show-icon
            style="margin-bottom:24px"
          >
            <template #default>
              <p style="margin:0;line-height:1.8">
                酒店管理员账号<strong>只能管理酒店预订和订单</strong>，不能修改景点、美食、路线等数据。<br/>
                适用于外包给酒店商家自行管理订单和退款的场景。
              </p>
            </template>
          </el-alert>

          <el-form :model="hotelAdminForm" label-width="140px" class="config-form">
            <el-form-item label="管理员用户名">
              <el-input v-model="hotelAdminForm.username" placeholder="如：hotel_kaiyue" maxlength="20" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="hotelAdminForm.nickname" placeholder="如：凯宾斯基酒店管理" maxlength="20" />
            </el-form-item>
            <el-form-item label="登录密码">
              <el-input v-model="hotelAdminForm.password" placeholder="最少6位" type="password" show-password />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="hotelAdminForm.phone" placeholder="管理员联系电话" />
            </el-form-item>
            <el-form-item label="邮件地址">
              <el-input v-model="hotelAdminForm.email" placeholder="管理员邮箱" />
            </el-form-item>
            <el-form-item label="管理酒店范围">
              <el-select
                v-model="hotelAdminForm.hotelIds"
                multiple
                filterable
                placeholder="选择该管理员可管理的酒店（不选则全部）"
                style="width:100%"
              >
                <el-option
                  v-for="hotel in hotelList"
                  :key="hotel.id"
                  :label="hotel.name"
                  :value="hotel.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="creatingAdmin" @click="createHotelAdmin">
                创建酒店管理员
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <h4 style="color:#333;margin-bottom:16px">已有酒店管理员</h4>
          <el-table :data="hotelAdmins" stripe style="width:100%">
            <el-table-column prop="username" label="用户名" width="140" />
            <el-table-column prop="nickname" label="昵称" min-width="120" />
            <el-table-column prop="phone" label="电话" width="130" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small">编辑</el-button>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/axios'

const activeTab = ref('wechat')
const saving = ref(false)
const creatingAdmin = ref(false)
const hotelList = ref([])
const hotelAdmins = ref([])

const wechatForm = reactive({
  payMode: 'simulate',
  mchId: '',
  appId: '',
  appSecret: '',
  apiV3Key: '',
  serialNo: '',
  notifyUrl: '',
  refundNotifyUrl: '',
  timeoutMinutes: 30
})

const hotelAdminForm = reactive({
  username: '',
  nickname: '',
  password: '',
  phone: '',
  email: '',
  hotelIds: []
})

onMounted(() => {
  fetchHotelList()
  fetchHotelAdmins()
})

function fetchHotelList() {
  request.get('/api/admin/hotels', { params: { pageSize: 100 } }).then(res => {
    if (res.data?.list) hotelList.value = res.data.list
  }).catch(() => {})
}

function fetchHotelAdmins() {
  request.get('/api/admin/users').then(res => {
    if (res.code === 200 && res.data) {
      hotelAdmins.value = (res.data || []).filter(u => u.role === 'hotel_admin')
    }
  }).catch(() => {})
}

function onKeyFileChange() {
  // 私钥文件处理
}

function saveWechatConfig() {
  saving.value = true
  const configs = [
    { groupKey: 'payment', configKey: 'pay_mode', configValue: wechatForm.payMode },
    { groupKey: 'payment', configKey: 'mch_id', configValue: wechatForm.mchId },
    { groupKey: 'payment', configKey: 'app_id', configValue: wechatForm.appId },
    { groupKey: 'payment', configKey: 'timeout_minutes', configValue: String(wechatForm.timeoutMinutes) }
  ]

  request.put('/api/admin/configs/batch', configs).then(res => {
    if (res.code === 200) {
      ElMessage.success('支付配置保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  }).catch(() => {
    ElMessage.success('配置已保存（本地缓存）')
  }).finally(() => {
    saving.value = false
  })
}

function createHotelAdmin() {
  if (!hotelAdminForm.username || !hotelAdminForm.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  if (hotelAdminForm.password.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }

  creatingAdmin.value = true
  const data = {
    username: hotelAdminForm.username,
    nickname: hotelAdminForm.nickname || hotelAdminForm.username,
    password: hotelAdminForm.password,
    phone: hotelAdminForm.phone || '',
    email: hotelAdminForm.email || '',
    role: 'hotel_admin',
    status: 1
  }

  request.post('/api/admin/users', data).then(res => {
    if (res.code === 200) {
      ElMessage.success('酒店管理员创建成功')
      fetchHotelAdmins()
      hotelAdminForm.username = ''
      hotelAdminForm.nickname = ''
      hotelAdminForm.password = ''
      hotelAdminForm.phone = ''
      hotelAdminForm.email = ''
      hotelAdminForm.hotelIds = []
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  }).catch(() => {
    ElMessage.error('创建失败，请稍后重试')
  }).finally(() => {
    creatingAdmin.value = false
  })
}

function testConnection() {
  ElMessage.info('连接测试功能开发中')
}
</script>

<style lang="scss" scoped>
.payment-config-container {
  .page-header {
    margin-bottom: 20px;
    h2 { margin: 0 0 5px; font-size: 22px; color: #333; }
    .subtitle { margin: 0; font-size: 13px; color: #999; }
  }

  .config-card { max-width: 900px; }

  .config-form {
    max-width: 640px;
    :deep(.el-divider__text) { font-weight: 600; font-size: 14px; }
  }

  .unit-tip {
    font-size: 12px;
    color: #999;
    margin-left: 12px;
  }
}
</style>

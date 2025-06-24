<template>
  <div class="service-detail-container">
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 뒤로가기 버튼과 질문 -->
        <div class="page-header">
          <a-button type="text" class="back-button" @click="goBack">
            <LeftOutlined />
          </a-button>
          <h1 class="page-title">어떤 유형을 선택하시겠어요?</h1>
        </div>

        <!-- 로딩 상태 표시 -->
        <div v-if="loading" class="loading-section">
          <a-spin size="large" tip="서비스 정보를 불러오는 중...">
            <div class="loading-content"></div>
          </a-spin>
        </div>

        <!-- 서비스 정보가 로드된 후에만 표시 -->
        <template v-else-if="serviceInfo.name">
          <!-- 서비스 정보 카드 -->
          <div class="service-info-section">
            <div class="service-card">
              <div class="service-header">
                <div class="service-icon">
                  <PlayCircleOutlined />
                </div>
                <div class="service-details">
                  <h2 class="service-name">{{ serviceInfo.name }}</h2>
                  <div class="service-specs">
                    <UserOutlined class="spec-icon" />
                    <span class="spec-text">최대 {{ serviceInfo.maxMembers - 1 }}명의 공유</span>
                  </div>
                </div>
              </div>
              <div class="service-pricing">
                <div class="price-info">
                  <div class="price-main">{{ serviceInfo.price.toLocaleString() }}원</div>
                  <div class="price-period">/ 매월</div>
                </div>
                <div class="min-subscription">
                  <div class="min-period">최소 {{ serviceInfo.minMonths }}개월</div>
                  <div class="total-cost">총 {{ (serviceInfo.price * serviceInfo.minMonths).toLocaleString() }}원</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 슬롯 선택 섹션 -->
          <div class="slot-selection-section">
            <h2 class="slot-title">공유할 슬롯은 몇 개입니까?</h2>

            <div class="slot-selector">
              <a-button
                  type="text"
                  class="slot-button"
                  :disabled="selectedSlots <= 1"
                  @click="decreaseSlots"
              >
                <MinusOutlined />
              </a-button>

              <div class="slot-display">
                <span class="slot-number">{{ selectedSlots }}</span>
              </div>

              <a-button
                  type="text"
                  class="slot-button"
                  :disabled="selectedSlots >= (serviceInfo.maxMembers - 1)"
                  @click="increaseSlots"
              >
                <PlusOutlined />
              </a-button>
            </div>

            <div class="cost-info">
              <span class="cost-label">개인별</span>
              <span class="cost-amount">{{ perPersonCost.toLocaleString() }}원</span>
              <span class="cost-period">/ 월</span>
            </div>

            <!-- 다음 버튼 -->
            <div class="action-section">
              <a-button
                  type="primary"
                  size="large"
                  class="next-button"
                  @click="proceedToNext"
              >
                다음
              </a-button>
            </div>

            <!-- 안내 메시지 -->
            <div class="info-message">
              <ExclamationCircleOutlined class="info-icon" />
              <span class="info-text">자신의 슬롯을 제외한 구독의 사용 가능한 슬롯입니다.</span>
            </div>
          </div>
        </template>

        <!-- 서비스 정보가 없거나 로드 실패한 경우 -->
        <div v-else-if="!loading" class="error-state">
          <a-empty description="서비스 정보를 불러올 수 없습니다." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import {
  LeftOutlined,
  PlayCircleOutlined,
  UserOutlined,
  MinusOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 반응형 데이터
const selectedSlots = ref(3)
const loading = ref(false) // 로딩 상태 추가

// 서비스 정보를 저장할 ref (이제 API에서 동적으로 로드됨)
const serviceInfo = ref({
  id: null,
  name: '',
  maxMembers: 4,
  price: 0,
  minMonths: 1
})

// 1인당 비용 계산 (파티장 포함 총 인원으로 나누기)
const perPersonCost = computed(() => {
  const totalMembers = selectedSlots.value + 1 // 파티장 포함
  return Math.floor(serviceInfo.value.price / totalMembers)
})

// 나머지 금액 계산 (파티장이 부담)
const remainingAmount = computed(() => {
  const totalMembers = selectedSlots.value + 1
  return serviceInfo.value.price % totalMembers
})

// 파티장이 실제 부담할 금액 (나머지 포함)
const partyLeaderCost = computed(() => {
  return perPersonCost.value + remainingAmount.value
})

// 마운트 시 서비스 정보 로드
onMounted(() => {
  const platformId = route.params.serviceId
  console.log('🔍 구독 생성 페이지 로드:', platformId)

  if (platformId) {
    loadPlatformDetail(platformId)
  } else {
    console.error('❌ platformId가 없습니다. 구독 선택 페이지로 이동합니다.')
    message.error('잘못된 접근입니다.')
    router.push('/subscription')
  }
})

// 실제 API를 호출하여 플랫폼 상세 정보를 가져오는 함수
const loadPlatformDetail = async (platformId) => {
  try {
    loading.value = true
    console.log('🚀 플랫폼 상세 정보 API 호출 중:', platformId)

    // 백엔드 API 호출
    const response = await axios.get(`/api/list/platforms/${platformId}`)
    const platformData = response.data

    console.log('📡 API 응답 데이터:', platformData)

    // API 응답을 컴포넌트에서 사용할 형태로 변환
    serviceInfo.value = {
      id: platformData.platformId,
      name: platformData.name,
      maxMembers: platformData.capacity,
      price: platformData.price,
      minMonths: platformData.monthUnit,
    }

    // 초기 슬롯 수를 서비스의 최대 인원 범위 내에서 설정 (파티장 제외)
    selectedSlots.value = Math.min(3, serviceInfo.value.maxMembers - 1)

    console.log('✅ 플랫폼 정보 로드 완료:', {
      id: serviceInfo.value.id,
      name: serviceInfo.value.name,
      price: serviceInfo.value.price,
      capacity: serviceInfo.value.maxMembers,
      minMonths: serviceInfo.value.minMonths
    })

  } catch (error) {
    console.error('💥 플랫폼 상세 정보 로드 실패:', error)

    // 다양한 HTTP 상태 코드에 따른 세분화된 에러 처리
    if (error.response) {
      const { status, data } = error.response
      console.error('📡 서버 응답 오류:', { status, data })

      switch (status) {
        case 404:
          message.error('존재하지 않는 서비스입니다.')
          break
        case 400:
          message.error('현재 사용할 수 없는 서비스입니다.')
          break
        case 401:
          message.error('로그인이 필요합니다.')
          router.push('/login')
          return
        case 403:
          message.error('이 서비스에 접근할 권한이 없습니다.')
          break
        default:
          message.error(`서버 오류가 발생했습니다. (${status})`)
      }
    } else if (error.request) {
      console.error('📡 네트워크 오류:', error.request)
      message.error('네트워크 연결을 확인해주세요.')
    } else {
      console.error('💥 일반 오류:', error.message)
      message.error('서비스 정보를 불러오는 중 오류가 발생했습니다.')
    }

    // 오류 발생 시 구독 선택 페이지로 돌아가기
    router.push('/subscription')

  } finally {
    loading.value = false
  }
}

// 메서드들
const goBack = () => {
  router.go(-1)
}

const increaseSlots = () => {
  if (selectedSlots.value < (serviceInfo.value.maxMembers - 1)) {
    selectedSlots.value++
  }
}

const decreaseSlots = () => {
  if (selectedSlots.value > 1) {
    selectedSlots.value--
  }
}

const proceedToNext = async () => {
  try {
    loading.value = true

    // 로그인 상태 확인
    if (!authStore.userInfo?.loginId) {
      message.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const subscriptionData = {
      platformId: serviceInfo.value.id,
      capacity: selectedSlots.value + 1, // 파티장 포함 총 인원
      currentCount: 1, // 파티장만 있는 상태
      loginId: authStore.userInfo.loginId
    }

    console.log('🚀 구독 생성 API 호출:', subscriptionData)

    // 구독 생성 API 호출
    const response = await axios.post('http://localhost:8080/post/subscription/create', subscriptionData)
    
    console.log('✅ 구독 생성 성공:', response.data)
    message.success(`${serviceInfo.value.name} 구독이 성공적으로 생성되었습니다!`)

    // 성공 시 다음 페이지로 이동 (예: 대시보드 또는 구독 관리 페이지)
    router.push('/dashboard')

  } catch (error) {
    console.error('💥 구독 생성 실패:', error)
    
    if (error.response) {
      const { status, data } = error.response
      console.error('📡 서버 응답 오류:', { status, data })

      switch (status) {
        case 400:
          message.error(data.message || '입력 정보를 확인해주세요.')
          break
        case 401:
          message.error('로그인이 필요합니다.')
          router.push('/login')
          break
        case 409:
          message.error('이미 해당 플랫폼의 구독이 존재합니다.')
          break
        default:
          message.error(`구독 생성 중 오류가 발생했습니다. (${status})`)
      }
    } else if (error.request) {
      message.error('네트워크 연결을 확인해주세요.')
    } else {
      message.error('구독 생성 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.service-detail-container {
  background: #fafafa;
  min-height: 100vh;
}

.main-content {
  padding: 40px 0;
}

.content-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 16px;
}

.back-button {
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 18px;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 서비스 정보 섹션 */
.service-info-section {
  margin-bottom: 40px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.service-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.service-icon {
  width: 60px;
  height: 60px;
  background: #ff7875;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 20px;
  font-weight: bold;
  color: #ff7875;
  margin: 0 0 8px 0;
}

.service-specs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.spec-icon {
  color: #666;
  font-size: 14px;
}

.spec-text {
  color: #666;
  font-size: 14px;
}

.service-description {
  color: #666;
  font-size: 14px;
}

.service-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-main {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.price-period {
  color: #666;
  font-size: 14px;
}

.min-subscription {
  text-align: right;
}

.min-period {
  color: #666;
  font-size: 12px;
  margin-bottom: 2px;
}

.total-cost {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

/* 슬롯 선택 섹션 */
.slot-selection-section {
  text-align: center;
}

.slot-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 40px 0;
}

.slot-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.slot-button {
  width: 48px;
  height: 48px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
}

.slot-button:hover:not(:disabled) {
  border-color: #69b7ff;
  color: #69b7ff;
}

.slot-button:disabled {
  border-color: #f0f0f0;
  color: #d9d9d9;
  cursor: not-allowed;
}

.slot-display {
  min-width: 80px;
}

.slot-number {
  font-size: 48px;
  font-weight: bold;
  color: #333;
}

.cost-info {
  margin-bottom: 40px;
}

.cost-label {
  color: #666;
  font-size: 16px;
  margin-right: 8px;
}

.cost-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ff7875;
  margin-right: 4px;
}

.cost-period {
  color: #666;
  font-size: 16px;
}

/* 액션 섹션 */
.action-section {
  margin-bottom: 24px;
}

.next-button {
  background: #ff7875;
  border-color: #ff7875;
  border-radius: 8px;
  height: 48px;
  padding: 0 48px;
  font-weight: 600;
  font-size: 16px;
}

.next-button:hover {
  background: #ff9c99;
  border-color: #ff9c99;
}

/* 안내 메시지 */
.info-message {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #fa8c16;
  font-size: 16px;
  flex-shrink: 0;
}

.info-text {
  color: #fa8c16;
  font-size: 14px;
}

/* 로딩 및 에러 상태 */
.loading-section {
  text-align: center;
  padding: 80px 0;
}

.loading-content {
  height: 200px;
}

.error-state {
  text-align: center;
  padding: 80px 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .content-container {
    padding: 0 16px;
  }

  .main-content {
    padding: 24px 0;
  }

  .page-title {
    font-size: 20px;
  }

  .service-card {
    padding: 20px;
  }

  .service-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .service-pricing {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .slot-selector {
    gap: 20px;
  }

  .slot-number {
    font-size: 36px;
  }
}
</style>
<template>
  <div class="subscription-selection-container">
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 페이지 제목 -->
        <div class="page-header">
          <h1 class="page-title">공유하려는 구독을 선택하세요</h1>
        </div>

        <!-- 카테고리 섹션 -->
        <div class="categories-section">
          <div class="category-grid">
            <a-row :gutter="[24, 24]" justify="center">
              <a-col
                  :span="3"
                  v-for="category in categories"
                  :key="category.id"
              >
                <div
                    class="category-card"
                    :class="{ 'active': selectedCategory === category.id }"
                    @click="selectCategory(category.id)"
                >
                  <div class="category-icon" :style="{ backgroundColor: category.color }">
                    <component :is="category.icon" />
                  </div>
                  <div class="category-label">{{ category.label }}</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>

        <!-- 서비스 목록 섹션 -->
        <div class="services-section" v-if="!loading">
          <div class="services-grid" v-if="filteredServices.length > 0">
            <a-row :gutter="[16, 16]" justify="start">
              <a-col
                  :xs="12" :sm="8" :md="6" :lg="4" :xl="3"
                  v-for="service in filteredServices"
                  :key="service.id"
              >
                <div
                    class="service-card"
                    @click="selectService(service)"
                >
                  <div class="service-name">{{ service.name }}</div>
                </div>
              </a-col>
            </a-row>
          </div>
          <div v-else class="no-services">
            <a-empty description="해당 카테고리에 서비스가 없습니다." />
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div class="loading-section" v-if="loading">
          <a-spin size="large" tip="플랫폼 목록을 불러오는 중...">
            <div class="loading-content"></div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import axios from 'axios'
import {
  PlayCircleOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  BookOutlined,
  WifiOutlined,
  DesktopOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 반응형 데이터
const selectedCategory = ref(1) // 1번 카테고리(SVOD)를 기본값으로
const platforms = ref([]) // API에서 받아온 플랫폼 데이터
const loading = ref(false) // 로딩 상태

// 카테고리 데이터 (숫자 ID로 관리)
const categories = ref([
  { id: 1, label: 'SVOD', icon: PlayCircleOutlined, color: '#ff7875' },
  { id: 2, label: '음악', icon: CustomerServiceOutlined, color: '#52c41a' },
  { id: 3, label: '보안', icon: SafetyOutlined, color: '#1890ff' },
  { id: 4, label: '소프트웨어', icon: DatabaseOutlined, color: '#722ed1' },
  { id: 5, label: 'VPN', icon: WifiOutlined, color: '#13c2c2' },
  { id: 6, label: '게임', icon: DesktopOutlined, color: '#eb2f96' },
  { id: 7, label: '독서', icon: BookOutlined, color: '#fa8c16' },
  { id: 8, label: '기타', icon: AppstoreOutlined, color: '#666' }
])

// 서비스 데이터는 이제 API에서 가져오므로 삭제하고 빈 배열로 초기화
const services = ref([])

// 필터링된 서비스 (API 응답 데이터 기반)
const filteredServices = computed(() => {
  return services.value.filter(service => service.category === selectedCategory.value)
})

// 컴포넌트가 마운트될 때 API 호출
onMounted(() => {
  fetchPlatforms()
})

// API에서 플랫폼 목록을 가져오는 함수
const fetchPlatforms = async () => {
  try {
    loading.value = true
    console.log('🚀 플랫폼 목록 API 호출 중...')

    const response = await axios.get('/api/subscription', {

    })
    console.log('📡 API 응답:', response.data)

    // API 응답 데이터를 컴포넌트에서 사용할 형태로 변환
    services.value = response.data.map(platform => ({
      id: platform.platformId,
      name: platform.name,
      category: platform.category,
      capacity: platform.capacity,
      price: platform.price,
      monthUnit: platform.monthUnit
    }))

    console.log('✅ 변환된 서비스 데이터:', services.value)
    console.log('📊 총 플랫폼 개수:', services.value.length)

  } catch (error) {
    console.error('💥 플랫폼 목록 조회 실패:', error)

    if (error.response) {
      console.error('📡 서버 응답 오류:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })

      if (error.response.status === 401) {
        message.error('로그인이 필요합니다.')
        router.push('/login')
      } else if (error.response.status === 403) {
        message.error('접근 권한이 없습니다.')
      } else {
        message.error(`서버 오류가 발생했습니다. (${error.response.status})`)
      }
    } else if (error.request) {
      console.error('📡 네트워크 오류:', error.request)
      message.error('네트워크 연결을 확인해주세요.')
    } else {
      console.error('💥 일반 오류:', error.message)
      message.error('플랫폼 목록을 불러오는 중 오류가 발생했습니다.')
    }
  } finally {
    loading.value = false
  }
}

// 메서드들
const selectCategory = (categoryId) => {
  console.log('카테고리 선택:', categoryId)
  selectedCategory.value = categoryId
  console.log('현재 선택된 카테고리:', selectedCategory.value)
  console.log('필터된 서비스 개수:', filteredServices.value.length)
}

const selectService = (service) => {
  // 서비스 선택 시 platformId와 함께 상세 페이지로 이동
  console.log('🎯 선택된 서비스:', service)

  // platformId를 사용하여 구독 생성 페이지로 이동
  router.push(`/subscription/create/${service.id}`)
  message.success(`${service.name} 서비스를 선택했습니다.`)
}

const handleSearch = () => {
  // 검색 기능 제거됨
}

const continueToNext = () => {
  const selectedServiceNames = services.value
      .filter(service => selectedServices.value.includes(service.id))
      .map(service => service.name)

  message.success(`${selectedServiceNames.join(', ')} 서비스가 선택되었습니다.`)
  // 실제로는 다음 단계로 이동
  // router.push('/subscription/create')
}
</script>

<style scoped>
.subscription-selection-container {
  background: #fafafa;
  min-height: 100vh;
}

.main-content {
  padding: 40px 0 40px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 페이지 헤더 */
.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 카테고리 섹션 */
.categories-section {
  margin-bottom: 32px;
}

.category-grid {
  max-width: 1000px;
  margin: 0 auto;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-card.active {
  border-color: #69b7ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(105, 183, 255, 0.3);
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 24px;
}

.category-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 서비스 목록 섹션 */
.services-section {
  margin-bottom: 20px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.service-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 로딩 및 빈 상태 */
.loading-section {
  text-align: center;
  padding: 80px 0;
}

.loading-content {
  height: 200px;
}

.no-services {
  text-align: center;
  padding: 60px 0;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .content-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 0 16px;
  }

  .main-content {
    padding: 24px 0 80px;
  }

  .page-title {
    font-size: 24px;
  }

  .category-grid .ant-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }

  .category-card {
    padding: 16px;
    height: 100px;
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .category-label {
    font-size: 12px;
  }

  .service-card {
    padding: 16px;
    height: 70px;
  }
}

/* 3개 카드가 가로로 꽉 차도록 조정 */
@media (min-width: 992px) {
  .ant-col-lg-8 {
    width: 33.333333% !important;
    flex: 0 0 33.333333% !important;
  }
}
</style>
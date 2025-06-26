<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="content-container">
        <!-- 메인 탭 섹션 -->
        <div class="main-tab-section">
          <div class="main-tab-container">
            <div class="main-tabs">
              <a-button
                :class="{ 'active-main-tab': activeMainTab === 'all' }"
                @click="setMainTab('all')"
                class="main-tab"
              >
                전부
              </a-button>
              <a-button
                :class="{ 'active-main-tab': activeMainTab === 'sharing' }"
                @click="setMainTab('sharing')"
                class="main-tab"
              >
                공유
              </a-button>
              <a-button
                :class="{ 'active-main-tab': activeMainTab === 'my' }"
                @click="setMainTab('my')"
                class="main-tab"
              >
                나의 구독
              </a-button>
            </div>
          </div>
        </div>

        <!-- 서브 필터 섹션 -->
        <div class="filter-section">
          <div class="filter-container">
            <div class="filter-tabs">
              <a-button
                :class="{ 'active-filter': activeFilter === 'activity' }"
                @click="setFilter('activity')"
                class="filter-tab"
              >
                활동적인({{ totalActiveCount }})
              </a-button>
              <a-button
                :class="{ 'active-filter': activeFilter === 'expired' }"
                @click="setFilter('expired')"
                class="filter-tab"
              >
                만료된({{ getExpiredCount() }})
              </a-button>
            </div>
          </div>
        </div>

        <!-- 서비스 카드들 -->
        <div class="services-section">
          <div class="services-container">
            <a-row :gutter="[32, 32]" justify="start">
              <a-col :xs="24" :sm="12" :lg="8" v-for="service in filteredServices" :key="service.id">
                <div class="service-card">
                  <div class="service-header">
                    <div class="service-icon">
                      <img :src="service.icon" :alt="service.name" />
                    </div>
                    <div class="service-info">
                      <h3 class="service-name">{{ service.name }}</h3>
                      <p class="service-price">
                        {{ service.price.toLocaleString() }}원
                        <span class="price-period">/ {{ service.period }}</span>
                      </p>
                      <p class="service-description">{{ service.description }}</p>
                    </div>
                  </div>

                  <div class="service-progress">
                    <div class="progress-info">
                      <span class="progress-text">{{ service.current }}/{{ service.total }}</span>
                      <span class="status-badge">{{ service.status }}</span>
                    </div>
                    <a-progress
                      :percent="(service.current / service.total) * 100"
                      :show-info="false"
                      stroke-color="#ff7875"
                      class="progress-bar"
                    />
                    <div class="time-remaining">
                      <a-avatar size="small" style="background-color: #69b7ff;">
                        <template #icon>
                          <ClockCircleOutlined />
                        </template>
                      </a-avatar>
                    </div>
                  </div>

                  <div class="service-actions">
                    <a-button
                      type="primary"
                      block
                      class="join-button"
                      @click="joinService(service)"
                      :disabled="service.expired === 'expired'"
                    >
                      구독 관리 >
                    </a-button>
                  </div>
                </div>
              </a-col>
            </a-row>
            <!-- 페이징 네비게이션 -->
            <div class="pagination">
              <a-button
                v-for="pageNum in totalPages"
                :key="pageNum"
                @click="changePage(pageNum-1)"
                :class="{ 'active-page': currentPage === pageNum-1 }"
              >
                {{ pageNum }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import axios from 'axios'

// 탭 및 필터 상태
const activeMainTab = ref('all')
const activeFilter = ref('activity')
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const services = ref([])
const currentPage = ref(0) // 현재 페이지 번호(0부터)
const totalPages = ref(0)  // 전체 페이지 수
const loginId = computed(() => authStore.userInfo?.loginId)
console.log('loginId:', loginId.value)
const totalActiveCount = ref(0);

// 데이터 조회 함수
const fetchMyPost = async (pageNum) => {
  try {
    const response = await axios.get('http://localhost:8080/post/myPost', {
      params: {
        loginId: loginId.value,
        page: pageNum // 파라미터 이름을 page로!
      }
    })
    totalPages.value = response.data.totalPages
    const dataContent = response.data.content
    services.value = dataContent.map((item) => ({
      id: item.postId,
      name: item.platformName,
      price: item.price,
      period: '월',
      description: item.description || '',
      current: item.currentCount,
      total: item.partySize,
      status: item.isExpired === 'true' ? '만료됨' : (item.isOwner === 'Y' ? '파티장' : '파티원'),
      icon: item.iconUrl || '',
      expired: item.isExpired === 'true' ? 'expired' : 'activity',
      type: item.isOwner === 'Y' ? 'sharing' : 'my'
    }))
    console.log('구독 데이터 불러옴', services.value)
  } catch (error) {
    console.error('구독 데이터 요청 실패:', error)
  }
}

// 페이지 변경 핸들러
const changePage = (newPage) => {
  currentPage.value = newPage
  router.replace({ query: { ...route.query, page: newPage + 1 } })
  fetchMyPost(newPage)
}

// 쿼리 변경 감지
watch(
  () => route.query.page,
  async (newPage) => {
    if (newPage != null) {
      currentPage.value = Number(newPage) - 1
      await fetchMyPost(currentPage.value)
    }
  },
  { immediate: true }
)

// 최초 마운트 시 쿼리 반영
onMounted(async () => {
  const page = route.query.page ? Number(route.query.page) - 1 : 0
  currentPage.value = page
  await fetchMyPost(page)
  await getActiveCount()
})

// 필터링된 서비스
const filteredServices = computed(() => {
  let filtered = services.value

  // 메인 탭 필터링
  if (activeMainTab.value === 'sharing') {
    filtered = filtered.filter(service => service.type === 'sharing')
  } else if (activeMainTab.value === 'my') {
    filtered = filtered.filter(service => service.type === 'my')
  }
  // 'all'인 경우 모든 타입 포함

  // 서브 필터링
  filtered = filtered.filter(service => service.expired === activeFilter.value)

  return filtered
})

// 카운트 함수
const getActiveCount = async () => {
  try {
    const response = await axios.get('http://localhost:8080/post/myPost/active', {
    });
    totalActiveCount.value = response.data;
  } catch (error) {
    console.error('활성 개수 조회 실패:', error);
    totalActiveCount.value = 0;
  }
}

const getExpiredCount = () => {
  let filtered = services.value
  if (activeMainTab.value === 'sharing') {
    filtered = filtered.filter(service => service.type === 'sharing')
  } else if (activeMainTab.value === 'my') {
    filtered = filtered.filter(service => service.type === 'my')
  }
  return filtered.filter(service => service.expired === 'expired').length
}

// 탭 변경
const setMainTab = (tab) => {
  activeMainTab.value = tab
}

// 필터 변경
const setFilter = (filter) => {
  activeFilter.value = filter
}

// 서비스 참여
const joinService = (service) => {
  if (service.current >= service.total) {
    message.warning('이미 마감된 서비스입니다.')
    return
  }
  router.push(`/dashboard/${service.id}`)
  message.success(`${service.name} 구독에 참여했습니다!`)
}
</script>


<style scoped>
.dashboard-container {
  background: #fafafa;
}

.dashboard-content {
  background: #fafafa;
  padding: 0;
}

.content-container {
  /* 헤더와 푸터는 상위 레이아웃에서 처리 */
}

/* 메인 탭 섹션 */
.main-tab-section {
  background: white;
  padding: 20px 0 16px;
  /* border-bottom: 1px solid #f0f0f0; */
}

.main-tab-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.main-tabs {
  display: flex;
  gap: 8px;
}

.main-tab {
  border: none;
  background: transparent;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding: 8px 16px;
  height: auto;
  transition: all 0.3s ease;
}

.main-tab:hover {
  color: #ff7875;
}

.active-main-tab {
  color: #ff7875 !important;
  /* border-bottom: 2px solid #ff7875 !important; */
}

/* 서브 필터 섹션 */
.filter-section {
  background: white;
  padding: 16px 0 24px;
  /* border-bottom: 1px solid #f0f0f0; */
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 6px 16px;
  height: auto;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #666;
}

.filter-tab:hover {
  border-color: #ff7875;
  color: #ff7875;
}

.active-filter {
  background: #ff7875 !important;
  border-color: #ff7875 !important;
  color: white !important;
}

.services-section {
  padding: 32px 0 64px;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.service-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.service-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-info {
  flex: 1;
}

.service-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.service-price {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.price-period {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.service-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.service-progress {
  margin-bottom: 20px;
  flex: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 18px;
  font-weight: bold;
  color: #ff7875;
}

.status-badge {
  background: #f6f6f6;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.progress-bar {
  margin-bottom: 12px;
}

.time-remaining {
  display: flex;
  justify-content: flex-end;
}

.service-actions {
  margin-top: auto;
}

.join-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  background: #ff7875;
  border-color: #ff7875;
  color: white;
}

.join-button:hover:not(:disabled) {
  background: #ff9c99;
  border-color: #ff9c99;
  transform: translateY(-1px);
}

.join-button:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
}
.pagination button {
  min-width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
}
.pagination button.active-page {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .main-tab-container,
  .filter-container,
  .services-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .main-tab-container,
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 0 16px;
  }

  .services-container {
    padding: 0 16px;
  }

  .service-card {
    padding: 20px;
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

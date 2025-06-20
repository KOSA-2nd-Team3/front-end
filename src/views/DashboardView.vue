<template>
  <div class="dashboard-container">
    <!-- 메인 대시보드 콘텐츠 -->
    <div class="dashboard-content">
      <div class="content-container">
        <!-- 대시보드 필터 섹션 -->
        <div class="filter-section">
          <div class="filter-container">
            <h2 class="filter-title">전부</h2>
            <div class="filter-tabs">
              <a-button
                  :class="{ 'active-filter': activeFilter === 'activity' }"
                  @click="setFilter('activity')"
                  class="filter-tab"
              >
                활동적인(6)
              </a-button>
              <a-button
                  :class="{ 'active-filter': activeFilter === 'recruiting' }"
                  @click="setFilter('recruiting')"
                  class="filter-tab"
              >
                인원모집(5)
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
                        :disabled="service.current >= service.total"
                    >
                      {{ service.current >= service.total ? '마감됨' : '구독을 공유하기 >' }}
                    </a-button>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { ClockCircleOutlined } from '@ant-design/icons-vue'

// 필터 상태
const activeFilter = ref('activity')

// 서비스 데이터 (레퍼런스 이미지와 동일하게)
const services = ref([
  {
    id: 1,
    name: 'Apple TV+ 가족',
    price: 2000,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 1,
    total: 6,
    status: '파티장',
    icon: 'https://logos-world.net/wp-content/uploads/2021/08/Apple-TV-Logo.png',
    category: 'activity'
  },
  {
    id: 2,
    name: 'Ridibooks(리디북스) 월간',
    price: 1495,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 1,
    total: 5,
    status: '파티장',
    icon: 'https://play-lh.googleusercontent.com/Y8Rn-oa_h2w8LT1zYfDQ1Z8X6dHVZLKfXUoHgSQTFWjBdQl3l7s_VoQ9H8b4Q8oGqQ',
    category: 'activity'
  },
  {
    id: 3,
    name: 'MAX 광고 없음',
    price: 7059,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 1,
    total: 3,
    status: '파티장',
    icon: 'https://logos-world.net/wp-content/uploads/2022/01/HBO-Max-Logo.png',
    category: 'activity'
  },
  {
    id: 4,
    name: 'Netflix 프리미엄',
    price: 4500,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 1,
    total: 5,
    status: '파티장',
    icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2023.ico',
    category: 'recruiting'
  },
  {
    id: 5,
    name: 'Disney+ Premium',
    price: 3200,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 2,
    total: 4,
    status: '모집중',
    icon: 'https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67281dbd9353990c0f2b8fe874/original',
    category: 'recruiting'
  },
  {
    id: 6,
    name: 'Spotify Premium',
    price: 2800,
    period: '개월',
    description: '구독이 승자가 있습니다.',
    current: 3,
    total: 6,
    status: '모집중',
    icon: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
    category: 'recruiting'
  }
])

// 필터링된 서비스
const filteredServices = computed(() => {
  if (activeFilter.value === 'activity') {
    return services.value.filter(service => service.category === 'activity')
  } else {
    return services.value.filter(service => service.category === 'recruiting')
  }
})

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

.filter-section {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.filter-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #ff7875;
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

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .filter-container,
  .services-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
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
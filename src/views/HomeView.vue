<template>
  <div class="homepage-container">
    <!-- 헤더 컴포넌트 -->
    <AppHeader :current-page="'home'" />

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 히어로 섹션 -->
      <div class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <h1 class="hero-title">구독 서비스를 함께 나누어 보세요</h1>
            <p class="hero-subtitle">OTTMOA와 함께 스마트한 구독 생활을 시작하세요</p>
            <div class="hero-buttons">
              <a-button type="primary" size="large" class="cta-button" @click="navigateToSubscribe">
                구독 공유 시작하기
              </a-button>
              <a-button size="large" class="outline-button" @click="navigateToGuide">
                서비스 가이드
              </a-button>
            </div>
          </div>
          <div class="hero-image">
            <div class="hero-graphic">
              <div class="graphic-circle circle-1"></div>
              <div class="graphic-circle circle-2"></div>
              <div class="graphic-circle circle-3"></div>
              <div class="graphic-text">OTTMOA</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 인기 서비스 섹션 -->
      <div class="popular-services-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">인기 구독 서비스</h2>
            <p class="section-subtitle">지금 가장 많이 공유되고 있는 서비스들을 확인해보세요</p>
          </div>

          <div class="services-grid">
            <a-row :gutter="[24, 24]">
              <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="service in popularServices" :key="service.id">
                <div class="service-card" @click="joinService(service)">
                  <div class="service-icon">
                    <div class="service-initials">{{ service.initials }}</div>
                  </div>
                  <div class="service-info">
                    <h4 class="service-name">{{ service.name }}</h4>
                    <div class="service-price">{{ service.price.toLocaleString() }}원</div>
                    <div class="service-members">{{ service.current }}/{{ service.total }}명</div>
                  </div>
                  <div class="service-tag" :class="service.status">
                    {{ service.status === 'recruiting' ? '모집중' : '인기' }}
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>

      <!-- 특징 섹션 -->
      <div class="features-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">왜 OTTMOA인가요?</h2>
            <p class="section-subtitle">안전하고 편리한 구독 공유 서비스</p>
          </div>

          <div class="features-grid">
            <a-row :gutter="[32, 32]">
              <a-col :xs="24" :md="8" v-for="feature in features" :key="feature.id">
                <div class="feature-card">
                  <div class="feature-icon">
                    <component :is="feature.icon" />
                  </div>
                  <h3 class="feature-title">{{ feature.title }}</h3>
                  <p class="feature-description">{{ feature.description }}</p>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>

      <!-- 통계 섹션 -->
      <div class="stats-section">
        <div class="section-container">
          <div class="stats-grid">
            <a-row :gutter="[32, 32]">
              <a-col :xs="12" :md="6" v-for="stat in stats" :key="stat.id">
                <div class="stat-item">
                  <div class="stat-number">{{ stat.number }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>

      <!-- CTA 섹션 -->
      <div class="cta-section">
        <div class="section-container">
          <div class="cta-content">
            <h2 class="cta-title">지금 바로 시작해보세요!</h2>
            <p class="cta-subtitle">구독료를 절약하고 더 많은 서비스를 즐겨보세요</p>
            <a-button type="primary" size="large" class="cta-button" @click="navigateToSubscribe">
              무료로 시작하기
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 푸터 컴포넌트 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SafetyOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

// 인기 서비스 데이터
const popularServices = ref([
  {
    id: 1,
    name: 'Netflix',
    price: 4500,
    current: 3,
    total: 4,
    status: 'recruiting',
    icon: null,
    initials: 'N'
  },
  {
    id: 2,
    name: 'Disney+',
    price: 3200,
    current: 4,
    total: 4,
    status: 'popular',
    icon: null,
    initials: 'D+'
  },
  {
    id: 3,
    name: 'Apple TV+',
    price: 2000,
    current: 2,
    total: 6,
    status: 'recruiting',
    icon: null,
    initials: 'ATV'
  },
  {
    id: 4,
    name: 'Spotify',
    price: 2800,
    current: 5,
    total: 6,
    status: 'popular',
    icon: null,
    initials: 'SP'
  },
  {
    id: 5,
    name: 'YouTube Premium',
    price: 3500,
    current: 1,
    total: 4,
    status: 'recruiting',
    icon: null,
    initials: 'YT'
  },
  {
    id: 6,
    name: 'Wavve',
    price: 2900,
    current: 3,
    total: 4,
    status: 'recruiting',
    icon: null,
    initials: 'W'
  },
  {
    id: 7,
    name: 'MAX',
    price: 7059,
    current: 2,
    total: 3,
    status: 'recruiting',
    icon: null,
    initials: 'MAX'
  },
  {
    id: 8,
    name: 'Ridibooks',
    price: 1495,
    current: 4,
    total: 5,
    status: 'popular',
    icon: null,
    initials: 'R'
  }
])

// 특징 데이터
const features = ref([
  {
    id: 1,
    icon: SafetyOutlined,
    title: '안전한 결제',
    description: '검증된 시스템으로 안전하게 구독료를 정산합니다'
  },
  {
    id: 2,
    icon: DollarOutlined,
    title: '비용 절약',
    description: '구독료를 나누어 월 평균 50% 이상 절약하세요'
  },
  {
    id: 3,
    icon: TeamOutlined,
    title: '신뢰할 수 있는 멤버',
    description: '인증된 회원들과 함께 안전한 구독 공유를 경험하세요'
  }
])

// 통계 데이터
const stats = ref([
  {
    id: 1,
    number: '10K+',
    label: '활성 사용자'
  },
  {
    id: 2,
    number: '50+',
    label: '지원 서비스'
  },
  {
    id: 3,
    number: '98%',
    label: '만족도'
  },
  {
    id: 4,
    number: '₹2M+',
    label: '절약 금액'
  }
])

// 네비게이션 함수들
const navigateToSubscribe = () => {
  router.push('/subscribe')
}

const navigateToGuide = () => {
  router.push('/guide')
}

const joinService = (service) => {
  if (service.current >= service.total) {
    message.warning('이미 마감된 서비스입니다.')
    return
  }
  message.success(`${service.name} 구독 공유에 관심을 표시했습니다!`)
  router.push('/subscribe')
}
</script>

<style scoped>
.homepage-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* 히어로 섹션 */
.hero-section {
  background: linear-gradient(135deg, #69b7ff 0%, #91caff 100%);
  color: white;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-content {
  z-index: 2;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.cta-button {
  background: white;
  border-color: white;
  color: #69b7ff;
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 16px;
}

.cta-button:hover {
  background: #f0f0f0;
  border-color: #f0f0f0;
  color: #69b7ff;
  transform: translateY(-2px);
}

.outline-button {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  border: 2px solid white;
  color: white;
  background: transparent;
  font-weight: 600;
  font-size: 16px;
}

.outline-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  color: white;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-graphic {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphic-circle {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.circle-1 {
  width: 300px;
  height: 300px;
}

.circle-2 {
  width: 200px;
  height: 200px;
}

.circle-3 {
  width: 100px;
  height: 100px;
}

.graphic-text {
  font-size: 32px;
  font-weight: bold;
  color: white;
  z-index: 5;
}

/* 공통 섹션 스타일 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* 인기 서비스 섹션 */
.popular-services-section {
  padding: 100px 0;
  background: white;
}

.services-grid {

}

.service-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  height: 100%;
}

.service-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.service-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f5f5f5;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.service-initials {
  font-size: 16px;
  font-weight: 600;
  color: #69b7ff;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.service-price {
  font-size: 18px;
  font-weight: bold;
  color: #69b7ff;
  margin-bottom: 4px;
}

.service-members {
  font-size: 14px;
  color: #666;
}

.service-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.service-tag.recruiting {
  background: #e6fffb;
  color: #00b96b;
}

.service-tag.popular {
  background: #fff1f0;
  color: #ff4d4f;
}

/* 특징 섹션 */
.features-section {
  padding: 100px 0;
  background: #fafafa;
}

.features-grid {

}

.feature-card {
  text-align: center;
  padding: 40px 20px;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #69b7ff, #91caff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

.feature-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.feature-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 통계 섹션 */
.stats-section {
  padding: 80px 0;
  background: white;
}

.stats-grid {

}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: bold;
  color: #69b7ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #666;
}

/* CTA 섹션 */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #69b7ff 0%, #91caff 100%);
  color: white;
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 16px 0;
}

.cta-subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  color: rgba(255, 255, 255, 0.9);
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .hero-container,
  .section-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
    padding: 0 16px;
  }

  .section-container {
    padding: 0 16px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .section-title {
    font-size: 28px;
  }

  .features-section,
  .popular-services-section {
    padding: 60px 0;
  }

  .cta-section {
    padding: 60px 0;
  }

  .cta-title {
    font-size: 28px;
  }
}
</style>
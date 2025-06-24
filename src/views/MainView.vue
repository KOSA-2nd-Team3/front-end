<template>
  <div class="main-view">
    <!-- 카테고리 필터 섹션 -->
    <div class="category-section">
      <div class="category-container">
        <div class="category-filters">
          <a-button v-for="category in categories" :key="category.key"
            :type="activeCategory === category.key ? 'primary' : 'default'"
            :class="{ 'active-category': activeCategory === category.key }" @click="setActiveCategory(category.key)"
            class="category-button">
            <component :is="category.icon" />
            {{ category.label }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 서비스 카드 섹션 -->
    <div class="services-section">
      <div class="services-container">
        <div class="services-grid">
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="service in filteredServices" :key="service.platformId">
              <div class="service-card" @click="handleServiceClick(service)">
                <!-- 로고 및 인센티브 배지 -->
                <div class="card-top">
                  <div class="service-logo">
                    <img :src="getPlatformLogo(service.platformName)" alt="logo" class="logo-img" />
                  </div>
                 </div>

                <!-- 아바타들 -->
                <div class="service-members" v-if="service.showMembers && service.members">
                  <div class="member-avatars">
                    <a-avatar v-for="(member, index) in service.members" :key="index" :size="32"
                      :style="{ backgroundColor: member.color }" class="member-avatar">
                      {{ member.initial }}
                    </a-avatar>
                    <div class="member-count" v-if="service.capacity > service.members.length">
                      +{{ service.capacity - service.members.length }}
                    </div>
                  </div>
                </div>

                <!-- 이름 + 카테고리 -->
                <div class="service-info">
                  <h3 class="service-name">{{ service.platformName }}</h3>
                  <div class="service-category">{{ service.categoryName }}</div>
                </div>

                <!-- 가격 -->
                <div class="service-pricing">
                  <div class="price-main">{{ Math.round(service.price / service.capacity).toLocaleString() }}원</div>
                  <div class="price-period">/ 월 최소</div>
                </div>

                <!-- 태그 -->
                <div class="service-tags" v-if="service.tags && service.tags.length > 0">
                  <a-tag v-for="tag in service.tags" :key="tag" :color="getTagColor(tag)" class="service-tag">
                    {{ tag }}
                  </a-tag>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  PlayCircleOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  WifiOutlined,
  DesktopOutlined,
  BookOutlined
} from '@ant-design/icons-vue'

// 반응형 데이터
const activeCategory = ref('all')
const router = useRouter()

// 카테고리 데이터
const categories = ref([
  { key: 'all', label: '전체', icon: AppstoreOutlined },
  { key: '1', label: 'SVOD', icon: PlayCircleOutlined },
  { key: '2', label: '음악', icon: CustomerServiceOutlined },
  { key: '3', label: '보안', icon: SafetyOutlined },
  { key: '4', label: '소프트웨어', icon: DatabaseOutlined },
  { key: '5', label: 'VPN', icon: WifiOutlined },
  { key: '6', label: '게임', icon: DesktopOutlined },
  { key: '7', label: '도서', icon: BookOutlined }
])

// 서비스 데이터
const services = ref([])
 
// API로 서비스 목록 가져오기
const fetchServices = async () => {
  try {
    let url = '/api/list/main'
    if (activeCategory.value !== 'all') {
      url = `/api/list/category/${activeCategory.value}`
    }

    const res = await axios.get(url)
    services.value = res.data
  } catch (error) {
    message.error('서비스 데이터를 불러오는 데 실패했습니다.')
    console.error(error)
  }
}


// 필터링된 서비스
const filteredServices = computed(() => {
  if (activeCategory.value === 'all') {
    return services.value
  }
  return services.value.filter(
    service => service.category === Number(activeCategory.value)
  )
})


// 메서드들
const setActiveCategory = (category) => {
  activeCategory.value = category
}

const handleServiceClick = (service) => {
  // 플랫폼 이름을 URL에 맞게 변환 (한글 -> 영문 또는 ID)
  const platformId = service.platformId || service.platformName.toLowerCase().replace(/\s+/g, '-')
  router.push(`/platform/${platformId}`)
}

const getTagColor = (tag) => {
  const colors = ['blue', 'green', 'orange', 'purple', 'cyan']
  return colors[Math.floor(Math.random() * colors.length)]
}

const logoMap = {
  '넷플릭스': 'http://localhost:8080/netflix.png',
  '디즈니플러스': 'http://localhost:8080/disney.png',
  '티빙': 'http://localhost:8080/tving.png',
  '웨이브': 'http://localhost:8080/wavve.png',
  '왓챠': 'http://localhost:8080/watcha.png',
  '라프텔': 'http://localhost:8080/laftel.png',
  'Apple TV+': 'http://localhost:8080/appletv.png',
  'GPT': 'http://localhost:8080/chatgpt.png',
  'Office 365': 'http://localhost:8080/office365.png',
  '밀리의 서재': 'http://localhost:8080/millie.png',
  '닌텐도 패밀리': 'http://localhost:8080/nintendo.png'
}

const getPlatformLogo = (platformName) => {
  return logoMap[platformName] || '/default.png'
}


// 마운트 시 데이터 요청
onMounted(() => {
  fetchServices()
  console.log('서비스 로드됨:', services.value)
})
</script>

<style scoped>
.main-view {
  background: #fafafa;
  min-height: 100vh;
}

/* 카테고리 섹션 */
.category-section {
  background: white;
  padding: 32px 0;
  border-bottom: 1px solid #f0f0f0;
}

.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.category-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-button {
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
  background: white;
}

.category-button:hover {
  border-color: #69b7ff;
  color: #69b7ff;
}

.active-category {
  background: #69b7ff !important;
  border-color: #69b7ff !important;
  color: white !important;
}

/* 서비스 섹션 */
.services-section {
  padding: 32px 0;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.service-card {
  background: #f0f8ff;
  border-radius: 20px;
  padding: 20px;
  border: none;
  box-shadow: none;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 상단 로고만 */
.card-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.service-logo {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  overflow: hidden;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 아바타 줄 */
.member-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.member-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-count {
  background: orange;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 이름 + 카테고리 */
.service-info {
  margin-top: 4px;
}

.service-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #222;
}

.service-category {
  font-size: 13px;
  color: #999;
}

/* 가격 영역 */
.service-pricing {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-main {
  font-size: 24px;
  font-weight: 700;
  color: #69b7ff;
}

.price-period {
  font-size: 14px;
  color: #999;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .category-container,
  .services-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .category-container,
  .services-container {
    padding: 0 16px;
  }

  .category-filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .category-button {
    flex-shrink: 0;
  }

  .services-section {
    padding: 24px 0 40px;
  }
}
</style>
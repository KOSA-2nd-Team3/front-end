<template>
  <div class="main-view">
    <!-- 카테고리 필터 섹션 -->
    <div class="category-section">
      <div class="category-container">
        <div class="category-filters">
          <a-button
              v-for="category in categories"
              :key="category.key"
              :type="activeCategory === category.key ? 'primary' : 'default'"
              :class="{ 'active-category': activeCategory === category.key }"
              @click="setActiveCategory(category.key)"
              class="category-button"
          >
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
            <a-col
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
                v-for="service in filteredServices"
                :key="service.id"
            >
              <div class="service-card" @click="handleServiceClick(service)">
                <div class="service-header">
                  <div class="service-logo" :style="{ backgroundColor: service.bgColor }">
                    <span class="service-logo-text">{{ service.logoText }}</span>
                  </div>
                  <div class="service-info">
                    <h3 class="service-name">{{ service.name }}</h3>
                    <div class="service-category">{{ service.categoryName }}</div>
                  </div>
                </div>

                <div class="service-pricing">
                  <div class="price-main">{{ service.price.toLocaleString() }}원</div>
                  <div class="price-period">/ {{ service.period }}</div>
                </div>

                <div class="service-members" v-if="service.showMembers">
                  <div class="member-avatars">
                    <a-avatar
                        v-for="(member, index) in service.members"
                        :key="index"
                        :size="32"
                        :style="{ backgroundColor: member.color }"
                        class="member-avatar"
                    >
                      {{ member.initial }}
                    </a-avatar>
                    <div class="member-count" v-if="service.totalMembers > service.members.length">
                      +{{ service.totalMembers - service.members.length }}
                    </div>
                  </div>
                </div>

                <div class="service-tags" v-if="service.tags && service.tags.length > 0">
                  <a-tag
                      v-for="tag in service.tags"
                      :key="tag"
                      :color="getTagColor(tag)"
                      class="service-tag"
                  >
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
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
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

// 카테고리 데이터
const categories = ref([
  { key: 'all', label: '전체', icon: AppstoreOutlined },
  { key: 'svod', label: 'SVOD', icon: PlayCircleOutlined },
  { key: 'music', label: '음악', icon: CustomerServiceOutlined },
  { key: 'security', label: '보안', icon: SafetyOutlined },
  { key: 'software', label: '소프트웨어', icon: DatabaseOutlined },
  { key: 'vpn', label: 'VPN', icon: WifiOutlined },
  { key: 'game', label: '게임', icon: DesktopOutlined },
  { key: 'book', label: '도서', icon: BookOutlined }
])

// 서비스 데이터
const services = ref([
  {
    id: 1,
    name: 'Spotify',
    categoryName: '음악',
    category: 'music',
    price: 9306,
    period: '월',
    logoText: 'SP',
    bgColor: '#1DB954',
    showMembers: true,
    members: [
      { initial: 'A', color: '#69b7ff' },
      { initial: 'B', color: '#52c41a' },
      { initial: 'C', color: '#ff7875' },
      { initial: 'D', color: '#ffc53d' }
    ],
    totalMembers: 6
  },
  {
    id: 2,
    name: 'APPLE ONE',
    categoryName: '음악',
    category: 'music',
    price: 5425,
    period: '월',
    logoText: 'AO',
    bgColor: '#000000',
    showMembers: true,
    members: [
      { initial: 'E', color: '#722ed1' },
      { initial: 'F', color: '#13c2c2' },
      { initial: 'G', color: '#fa8c16' },
      { initial: 'H', color: '#eb2f96' }
    ],
    totalMembers: 6
  },
  {
    id: 3,
    name: 'Apple Music',
    categoryName: '음악',
    category: 'music',
    price: 3850,
    period: '월',
    logoText: 'AM',
    bgColor: '#FA233B',
    showMembers: true,
    members: [
      { initial: 'I', color: '#1890ff' },
      { initial: 'J', color: '#f5222d' },
      { initial: 'K', color: '#52c41a' }
    ],
    totalMembers: 4
  },
  {
    id: 4,
    name: 'FIT Radio',
    categoryName: '음악',
    category: 'music',
    price: 7000,
    period: '월',
    logoText: 'FR',
    bgColor: '#FF6B35',
    showMembers: true,
    members: [
      { initial: 'L', color: '#722ed1' },
      { initial: 'M', color: '#13c2c2' },
      { initial: 'N', color: '#fa8c16' }
    ],
    totalMembers: 4,
    tags: ['건강한라이프 받을 수 있음']
  },
  // SVOD 서비스들
  {
    id: 5,
    name: 'Netflix',
    categoryName: 'SVOD',
    category: 'svod',
    price: 4500,
    period: '월',
    logoText: 'N',
    bgColor: '#E50914',
    showMembers: true,
    members: [
      { initial: 'O', color: '#1890ff' },
      { initial: 'P', color: '#52c41a' }
    ],
    totalMembers: 4
  },
  {
    id: 6,
    name: 'Disney+',
    categoryName: 'SVOD',
    category: 'svod',
    price: 3200,
    period: '월',
    logoText: 'D+',
    bgColor: '#113CCF',
    showMembers: true,
    members: [
      { initial: 'Q', color: '#ff7875' },
      { initial: 'R', color: '#ffc53d' }
    ],
    totalMembers: 4
  },
  // 소프트웨어 서비스들
  {
    id: 7,
    name: 'Microsoft 365',
    categoryName: '소프트웨어',
    category: 'software',
    price: 2784,
    period: '월',
    logoText: 'M365',
    bgColor: '#0078D4',
    showMembers: false
  },
  {
    id: 8,
    name: 'Adobe Creative',
    categoryName: '소프트웨어',
    category: 'software',
    price: 13825,
    period: '월',
    logoText: 'Adobe',
    bgColor: '#FF0000',
    showMembers: false
  }
])

// 필터링된 서비스
const filteredServices = computed(() => {
  let filtered = services.value

  // 카테고리 필터
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(service => service.category === activeCategory.value)
  }

  return filtered
})

// 메서드들
const setActiveCategory = (category) => {
  activeCategory.value = category
}

const handleServiceClick = (service) => {
  message.success(`${service.name} 서비스 상세페이지로 이동합니다.`)
}

const getTagColor = (tag) => {
  const colors = ['blue', 'green', 'orange', 'purple', 'cyan']
  return colors[Math.floor(Math.random() * colors.length)]
}
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
  padding: 32px 0 64px;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.services-grid {

}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-logo {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-logo-text {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #333;
}

.service-category {
  font-size: 12px;
  color: #666;
}

.service-pricing {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-main {
  font-size: 20px;
  font-weight: bold;
  color: #ff7875;
}

.price-period {
  font-size: 14px;
  color: #666;
}

.service-members {

}

.member-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-count {
  background: #f0f0f0;
  color: #666;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.service-tag {
  font-size: 11px;
  margin: 0;
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
<template>
  <div class="platform-list-container">
    <div class="platform-content">
      <div class="content-container">
        
        <!-- 플랫폼 헤더 섹션 -->
        <div class="platform-header-section">
          <div class="platform-header-container">
            <div class="back-button">
              <a-button @click="goBack" type="text" size="large">
                <template #icon>
                  <LeftOutlined />
                </template>
              </a-button>
            </div>
            <div class="platform-title">
              <h1>{{ platformName }}</h1>
            </div>
            <div class="platform-actions">
              <a-button type="text" size="large">
                <template #icon>
                  <ShareAltOutlined />
                </template>
                공유
              </a-button>
              <a-button type="text" size="large">
                <template #icon>
                  <HeartOutlined />
                </template>
                찜목록
              </a-button>
              <a-button type="text" size="large">
                <template #icon>
                  <QuestionCircleOutlined />
                </template>
                FAQ
              </a-button>
            </div>
          </div>
        </div>

        <!-- 플랫폼 정보 배너 -->
        <div class="platform-banner-section">
          <div class="platform-banner">
            <div class="banner-content">
              <div class="banner-text">
                <h2>{{ platformName }}을 직접 공유하세요</h2>
              </div>
              <div class="banner-price">
                <div class="price-info">
                  <span class="price">{{ platformPrice.toLocaleString() }}원</span>
                  <span class="period">/월</span>
                </div>
              </div>
              <div class="banner-cta">
                <a-button type="primary" size="large" class="join-button">
                  가입하기
                </a-button>
              </div>
            </div>
          </div>
        </div>


        <!-- 사용자 카드 섹션 -->
        <div class="users-section">
          <div class="users-container">
            <a-row :gutter="[24, 24]" justify="start">
              <a-col :xs="24" :sm="12" :lg="8" v-for="party in parties" :key="party.postId">
                <div class="user-card">
                  <div class="user-header">
                    <div class="user-avatar">
                      <a-avatar :size="48">
                        {{ party.leaderName.charAt(0) }}
                      </a-avatar>
                    </div>
                    <div class="user-info">
                      <h3 class="user-name">{{ party.leaderName }}</h3>
                      <p class="user-plan">{{ party.platformName }} {{ party.monthUnit }}개월</p>
                    </div>
                  </div>

                  <div class="user-stats">
                    <div class="stat-row">
                      <span class="stat-label">가격</span>
                      <span class="stat-value">{{ calculateMemberPrice(party).toLocaleString() }}원 /월</span>
                    </div>
                    <div class="member-row">
                      <div class="member-icons">
                        <UserOutlined 
                          v-for="n in party.partySize" 
                          :key="n" 
                          :class="n <= party.currentCount ? 'member-icon-filled' : 'member-icon-empty'"
                        />
                      </div>
                      <span class="member-text">{{ party.currentCount }}/{{ party.partySize }}명</span>
                    </div>
                  </div>

                  <div class="user-actions">
                    <a-button
                      :type="party.isExpired === 'false' && party.currentCount < party.partySize ? 'primary' : 'default'"
                      block
                      class="action-button"
                      :disabled="party.isExpired === 'true' || party.currentCount >= party.partySize"
                      @click="joinParty(party)"
                    >
                      {{ getButtonText(party) }}
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { 
  LeftOutlined, 
  ShareAltOutlined, 
  HeartOutlined, 
  QuestionCircleOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loginId = computed(() => authStore.userInfo?.loginId)
// 플랫폼 정보
const platformName = ref('Wave(웨이브)')
const platformPrice = ref(13500)


// 파티 데이터
const parties = ref([])


// 뒤로가기
const goBack = () => {
  router.go(-1)
}

// 파티원 1인당 가격 계산 (파티장이 나머지 부담)
const calculateMemberPrice = (party) => {
  const totalPrice = party.platformPrice
  const partySize = party.partySize
  
  // 파티원들이 내는 금액 (내림으로 계산)
  const memberPrice = Math.floor(totalPrice / partySize)
  
  return memberPrice
}

// API로 파티 리스트 가져오기
const fetchParties = async () => {
  try {
    const platformId = route.params.id
    const response = await axios.get(`http://localhost:8080/post/platform/${platformId}`)
    parties.value = response.data
    
    // 첫 번째 파티의 정보로 플랫폼 정보 업데이트
    if (parties.value.length > 0) {
      const firstParty = parties.value[0]
      platformName.value = firstParty.platformName
      platformPrice.value = firstParty.platformPrice
    }
    
    console.log('파티 리스트 불러옴:', parties.value)
  } catch (error) {
    console.error('파티 리스트 요청 실패:', error)
    message.error('파티 리스트를 불러오는데 실패했습니다.')
  }
}

// 파티 참여
const joinParty = async (party) => {
  if (party.isExpired === 'true') {
    message.warning('만료된 파티입니다.')
    return
  }
  if (party.currentCount >= party.partySize) {
    message.warning('이미 마감된 파티입니다.')
    return
  }

  await axios.post('http://localhost:8080/post/joinParty', {
      postId: party.postId,
      loginId: loginId.value,
      isOwner: "N"
    });
  message.success(`${party.leaderName}님의 파티에 참여했습니다!`)
  // TODO: 실제 참여 API 호출
}

// 버튼 텍스트
const getButtonText = (party) => {
  if (party.isExpired === 'true') {
    return '만료됨'
  }
  if (party.currentCount >= party.partySize) {
    return '마감됨'
  }
  return '가입하기'
}

onMounted(() => {
  fetchParties()
})
</script>

<style scoped>
.platform-list-container {
  background: #fafafa;
  min-height: 100vh;
}

.platform-content {
  background: #fafafa;
  padding: 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 플랫폼 헤더 섹션 */
.platform-header-section {
  background: white;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.platform-header-container {
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.platform-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.platform-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.platform-actions .ant-btn {
  color: #666;
  font-size: 14px;
}

.platform-actions .ant-btn:hover {
  color: #ff7875;
}

/* 플랫폼 배너 섹션 */
.platform-banner-section {
  background: white;
  padding: 24px 0;
}

.platform-banner {
  padding: 0 40px;
}

.banner-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
  overflow: hidden;
}

.banner-content::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.banner-text {
  flex: 1;
}

.banner-text h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.banner-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.banner-price {
  text-align: center;
}

.price-info {
  margin-bottom: 8px;
}

.price {
  font-size: 32px;
  font-weight: bold;
}

.period {
  font-size: 16px;
  opacity: 0.8;
}

.member-info {
  font-size: 14px;
  opacity: 0.9;
}

.banner-cta {
  z-index: 1;
}

.join-button {
  height: 48px;
  padding: 0 32px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 16px;
  background: white;
  border: none;
  color: #667eea;
}

.join-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}


/* 사용자 섹션 */
.users-section {
  padding: 32px 0 64px;
}

.users-container {
  padding: 0 40px;
}

.user-card {
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

.user-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.user-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-plan {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.user-stats {
  margin-bottom: 20px;
  flex: 1;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #ff7875;
}

.member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-icons {
  display: flex;
  gap: 4px;
}

.member-icon-filled {
  color: #69b7ff;
  font-size: 16px;
}

.member-icon-empty {
  color: #d9d9d9;
  font-size: 16px;
}

.member-text {
  font-size: 14px;
  color: #69b7ff;
  font-weight: 500;
}

.user-actions {
  margin-top: auto;
}

.action-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
}

.action-button[type="primary"] {
  background: #ff7875;
  border-color: #ff7875;
}

.action-button[type="primary"]:hover:not(:disabled) {
  background: #ff9c99;
  border-color: #ff9c99;
  transform: translateY(-1px);
}

.action-button:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .platform-header-container,
  .platform-banner,
  .users-container {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 768px) {
  .platform-header-container,
  .platform-banner,
  .users-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .platform-header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .platform-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 24px;
  }

  .user-card {
    padding: 20px;
  }
}

@media (min-width: 992px) {
  .ant-col-lg-8 {
    width: 33.333333% !important;
    flex: 0 0 33.333333% !important;
  }
}
</style>
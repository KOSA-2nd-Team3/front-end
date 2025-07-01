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
                  <LeftOutlined/>
                </template>
              </a-button>
            </div>
            <div class="platform-title">
              <h1>{{ platformName }}</h1>
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
                <a-button type="primary" size="large" class="join-button" @click="handleSubscribeShare">
                  가입하기
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 필터 섹션 추가 -->
        <div class="filter-section">
          <div class="filter-button" :class="filter === 'newest' ? 'selected' : ''" @click="setFilter('newest')">
            최신순
          </div>

          <div class="filter-button" :class="filter === 'oldest' ? 'selected' : ''" @click="setFilter('oldest')">
            오랜된순
          </div>
        </div>

        <!-- 사용자 카드 섹션 -->
        <div class="users-section">
          <div class="users-container" ref="scrollContainer">
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
                      <p class="user-plan">{{ party.platformName }} {{ party.durationMonth }}개월</p>
                      <p class="registration-time">{{ getTimeAgo(party.createdAt) }}</p>
                    </div>
                  </div>

                  <div class="user-stats">
                    <div class="stat-row">
                      <span class="stat-label">가격</span>
                      <span class="stat-value">{{ calculateMemberPrice(party).toLocaleString() }}원 /월</span>
                    </div>
                    <div class="member-row">
                      <div class="member-icons">
                        <UserOutlined v-for="n in party.partySize" :key="n"
                                      :class="n <= party.currentCount ? 'member-icon-filled' : 'member-icon-empty'"/>
                      </div>
                      <span class="member-text">{{ party.currentCount }}/{{ party.partySize }}명</span>
                    </div>
                  </div>

                  <div class="user-actions">
                    <a-button
                        :type="party.isExpired === 'false' && party.currentCount < party.partySize ? 'primary' : 'default'"
                        block class="action-button"
                        :disabled="party.isExpired === 'true' || party.currentCount >= party.partySize"
                        @click="handleJoinParty(party)">
                      {{ getButtonText(party) }}
                    </a-button>
                  </div>
                </div>
              </a-col>
            </a-row>
            <div v-if="!isLoading && !hasMore && sortedParties.length === 0" class="no-initial-parties">
              <p>현재 이 플랫폼에 등록된 파티가 없습니다.</p>
              <p>새 파티를 직접 생성해보세요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {message} from 'ant-design-vue'
import axios from 'axios'
import {
  HeartOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loginId = computed(() => authStore.userInfo?.loginId)
const filteredParties = computed(() => {
  return allParties.value.filter(party => !party.startDate);
})
// 플랫폼 정보
const platformName = ref('0')
const platformPrice = ref(0)
const serviceId = route.params.id

// 파티 데이터
const allParties = ref([])
const parties = ref([])
const page = ref(0)
const itemsPerPage = 10

const isLoading = ref(false)
const hasMore = ref(true)
const scrollContainer = ref(null)

let loadingMessageHandle = null

// 파티 정렬
const filter = ref('newest')

// computed로 필터링된 파티 목록 정렬
const sortedParties = computed(() => {
  if (!filteredParties.value || filteredParties.value.length === 0) {
    return []
  }
  const sorted = [...filteredParties.value].sort((a, b) => {
    if (filter.value === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt) // 최신순
    } else if (filter.value === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt) // 오랜된순
    }
    return 0
  })
  return sorted
})

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

// 로딩 메세지 표시
const showLoadingMessage = () => {
  return message.loading('파티 정보를 불러오는 중입니다...', 0)
}

const hideLoadingMessage = (handle) => {
  if (handle) {
    handle()
  }
}

// 초기 데이터를 모두 로드
const loadInitialData = async () => {
  isLoading.value = true
  loadingMessageHandle = showLoadingMessage()

  try {
    const platformId = route.params.id;
    const response = await axios.get(`/api/list/platform/${platformId}`)
    allParties.value = response.data // 모든 원본 데이터 저장

    if (allParties.value.length > 0) {
      const firstParty = allParties.value[0]
      platformName.value = firstParty.platformName
      platformPrice.value = firstParty.platformPrice
    } else {
      const null_response = await axios.get(`/api/list/platform/${platformId}/`)
      platformName.value = null_response.data.platformName
      platformPrice.value = null_response.data.platformPrice
      hasMore.value = false
    }
  } catch (error) {
    console.error('초기 파티 리스트 로드 실패:', error)
    message.error('초기 파티 리스트를 불러오는데 실패했습니다.')
    hasMore.value = false
  } finally {
    isLoading.value = false
    hideLoadingMessage(loadingMessageHandle)
    loadingMessageHandle = null
  }
}

// 정렬된 데이터에 parties를 추가
const appendPartiesFromSortedData = () => {
  if (isLoading.value || !hasMore.value) return // 로딩 중이거나 더 이상 데이터 없으면 중복 호출 방지

  isLoading.value = true
  loadingMessageHandle = showLoadingMessage()

  try {
    const startIndex = page.value * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const newPartiesChunk = sortedParties.value.slice(startIndex, endIndex)

    parties.value = [...parties.value, ...newPartiesChunk]

    if (parties.value.length >= sortedParties.value.length) {
      hasMore.value = false;
      if (allParties.value.length > 0) {
        message.info('모든 파티를 불러왔습니다.', 5)
      }
    } else {
      hasMore.value = true
    }
    page.value++

  } catch (error) {
    console.error('파티 데이터 추가 실패:', error)
    message.error('파티 데이터를 추가하는데 실패했습니다.')
    hasMore.value = false
  } finally {
    isLoading.value = false
    hideLoadingMessage(loadingMessageHandle)
    loadingMessageHandle = null
  }
}

// 파티 참여
// const joinParty = async (party) => {
const handleJoinParty = async (party) => {
  if (party.isExpired === 'true') {
    message.warning('만료된 파티입니다.')
    return
  }
  if (party.currentCount >= party.partySize) {
    message.warning('이미 마감된 파티입니다.')
    return
  }
  try {
    await axios.post('http://localhost:8080/post/joinParty', {
      postId: party.postId,
      loginId: loginId.value,
      isOwner: "N"
    });

    party.currentCount += 1
    message.success(`${party.leaderName}님의 파티에 참여했습니다!`)

    try {
      await axios.post(`http://localhost:8080/room/group/${party.postId}/join`)
      message.success('채팅방에 참여했습니다.')
    } catch (error) {
      console.error('채팅방 참여 실패: ', error)
      message.error('채팅방 참여에 실패했습니다.')
    }
  } catch (partyError) {
    console.error('파티 참여 실패:', partyError)
    message.error('파티 참여에 실패했습니다.')
    return
  }

  if (party.currentCount == party.partySize) {
    const postId = party.postId
    try {
      await axios.get(`http://localhost:8080/post/mailSend/${postId}`);
    } catch (error) {
      console.error('메일 전송 실패:', error);
      if (error.code === 'ECONNABORTED') {
        message.error('메일 전송 요청이 너무 오래 걸립니다. 서버 상태를 확인하세요.');
      } else if (!error.response) {
        message.error('메일 전송 서버에 연결할 수 없습니다.');
      } else {
        message.error(error.response.data?.message || '메일 전송 중 알 수 없는 오류가 발생했습니다.');
      }
    }
    message.success(`${party.leaderName}님이 파티를 참여!`)
  }

  // 대시보드 상세 페이지로 이동
  router.push(`/dashboard/${party.postId}`)
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

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  if (scrollContainer.value) {
    const {scrollTop, scrollHeight, clientHeight} = scrollContainer.value

    // 스크롤이 하단에 도달했는지 확인
    const atBottom = scrollTop + clientHeight >= scrollHeight - 50

    if (atBottom && !isLoading.value && hasMore.value) {
      appendPartiesFromSortedData()
    }
  }
}

const handleSubscribeShare = () => {
  router.push(`/subscription/create/${serviceId}`)
}

// 필터 상태를 변경
const setFilter = (filterType) => {
  if (filter.value === filterType) return
  filter.value = filterType

  parties.value = []
  page.value = 0
  hasMore.value = true

  appendPartiesFromSortedData()

  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// 날짜 차이를 계산
const getTimeAgo = (createdAt) => {
  const createdDate = new Date(createdAt)
  const currentDate = new Date()
  const timeDiff = currentDate - createdDate // 밀리초 단위 차이

  // 개월
  const monthsAgo = currentDate.getMonth() - createdDate.getMonth() + (12 * (currentDate.getFullYear() - createdDate.getFullYear()));
  if (monthsAgo > 0) {
    return `${monthsAgo}개월 전`;
  }

  // 일
  const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24)) // 밀리초를 일 단위로 변환
  if (daysAgo > 0) {
    return `${daysAgo}일 전`
  }

  // 시간
  const hoursAgo = Math.floor(timeDiff / (1000 * 3600))  // 밀리초를 시간 단위로 변환
  if (hoursAgo > 0) {
    return `${hoursAgo}시간 전`
  }

  // 분
  const minutesAgo = Math.floor(timeDiff / (1000 * 60)); // 밀리초를 분 단위로 변환
  if (minutesAgo > 0) {
    return `${minutesAgo}분 전`;
  }

  return "방금 전"
}

onMounted(async () => {
  await loadInitialData()
  appendPartiesFromSortedData()

  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  } else {
    console.warn('scrollContainer를 찾을 수 없습니다. Ref가 올바른 요소에 연결되었는지 확인하세요.');
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
  // 컴포넌트 언마운트 시 혹시 남아있는 로딩 메시지가 있다면 제거
  if (loadingMessageHandle) {
    hideLoadingMessage(loadingMessageHandle)
    loadingMessageHandle = null
  }
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
  padding: 10px 0 64px;
}

.users-container {
  padding: 0 40px;
  overflow-y: auto;
  max-height: 600px;
}

.user-card {
  position: relative;
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

.registration-time {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 14px;
  color: #888;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 8px;
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

.no-initial-parties {
  text-align: center;
  padding: 30px 20px;
  font-style: italic;
  color: #888;
  border-top: 1px dashed #e0e0e0;
  margin-top: 20px;
  font-size: 1.2em;
  line-height: 1.6;
  background: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: visible;
  box-sizing: border-box;
  padding-bottom: 40px;
  margin-bottom: 20px;
  max-height: none;
}

.no-initial-parties p {
  margin-bottom: 10px;
  font-weight: bold;
  color: #888;
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 0px;
  padding: 20px 40px;
}

.filter-button {
  width: 120px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #f0f0f0;
  color: #333333;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f0f0f0;
}

.filter-button.selected {
  background-color: #69b7ff;
  color: white;
  border-color: #69b7ff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.filter-button:hover {
  background-color: #69b7ff;
  border-color: #69b7ff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.filter-button.selected:hover {
  background-color: #69b7ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: row;
    align-items: center;
  }

  .filter-button {
    width: 120px;
    margin-bottom: 10px;
  }
}
</style>
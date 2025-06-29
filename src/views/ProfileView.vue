<template>
  <div class="profile-container">
    <!-- 메인 프로필 콘텐츠 -->
    <div class="profile-content">
      <div class="content-container">
        <!-- 프로필 헤더 -->
        <div class="profile-header">
          <h1 class="page-title">프로필</h1>
        </div>

        <!-- 개인정보 섹션 -->
        <div class="profile-section">
          <h3 class="section-title">개인정보</h3>
          <div class="info-card">
            <!-- 로딩 상태 -->
            <div v-if="loading" class="loading-container">
              <div class="loading-text">정보를 불러오는 중...</div>
            </div>

            <!-- 에러 상태 -->
            <div v-else-if="error" class="error-container">
              <div class="error-text">{{ error }}</div>
              <button @click="fetchProfile" class="retry-button">다시 시도</button>
            </div>

            <!-- 프로필 정보 테이블 -->
            <div v-else class="profile-table">
              <div class="table-row">
                <div class="table-label">이름</div>
                <div class="table-value">{{ profileData.name || '-' }}</div>
              </div>
              <div class="table-row">
                <div class="table-label">닉네임</div>
                <div class="table-value">{{ profileData.nickname || '-' }}</div>
              </div>
              <div class="table-row">
                <div class="table-label">이메일</div>
                <div class="table-value">{{ profileData.email || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// 반응형 데이터
const profileData = ref({
  name: '',
  nickname: '',
  email: ''
})
const loading = ref(false)
const error = ref('')

// 프로필 정보 가져오기
const fetchProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('http://localhost:8080/member/profile')

    profileData.value = response.data
  } catch (err) {
    console.error('프로필 정보 조회 실패:', err)

    if (err.response?.status === 401) {
      error.value = '인증이 만료되었습니다. 다시 로그인해주세요.'
      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (err.response?.status === 404) {
      error.value = '사용자 정보를 찾을 수 없습니다.'
    } else {
      error.value = '프로필 정보를 불러오는데 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 프로필 정보 가져오기
onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-container {
  background: #fafafa;
}

.profile-content {
  background: #fafafa;
  padding: 32px 0 64px;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 40px;
}

.profile-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 프로필 섹션 */
.profile-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

/* 정보 카드 */
.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

/* 로딩 및 에러 상태 */
.loading-container, .error-container {
  text-align: center;
  padding: 40px 20px;
}

.loading-text {
  font-size: 16px;
  color: #666;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-text {
  font-size: 16px;
  color: #ff4d4f;
}

.retry-button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background: #40a9ff;
}

/* 프로필 테이블 */
.profile-table {
  width: 100%;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.table-row:last-child {
  border-bottom: none;
}

.table-label {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  min-width: 80px;
}

.table-value {
  font-size: 16px;
  color: #666;
  text-align: right;
  flex: 1;
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

  .profile-content {
    padding: 24px 0 40px;
  }

  .page-title {
    font-size: 24px;
  }

  .info-card {
    padding: 20px;
  }

  .table-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .table-value {
    text-align: left;
  }
}
</style>
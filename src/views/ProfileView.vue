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
                <div class="table-value-with-action">
                  <!-- 닉네임 편집 모드가 아닐 때 -->
                  <div v-if="!isEditingNickname" class="value-display">
                    <span class="value-text">{{ profileData.nickname || '-' }}</span>
                    <button @click="startEditNickname" class="edit-button">변경</button>
                  </div>

                  <!-- 닉네임 편집 모드일 때 -->
                  <div v-else class="value-edit">
                    <input
                      v-model="newNickname"
                      type="text"
                      class="nickname-input"
                      :class="{ 'error': nicknameError }"
                      placeholder="새 닉네임을 입력하세요"
                      @input="clearNicknameError"
                      @keyup.enter="updateNickname"
                      @keyup.escape="cancelEditNickname"
                    />
                    <div class="edit-actions">
                      <button
                        @click="updateNickname"
                        :disabled="nicknameLoading || !newNickname.trim()"
                        class="save-button"
                      >
                        {{ nicknameLoading ? '확인 중...' : '저장' }}
                      </button>
                      <button @click="cancelEditNickname" class="cancel-button">취소</button>
                    </div>
                    <div v-if="nicknameError" class="error-message">{{ nicknameError }}</div>
                  </div>
                </div>
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

// 닉네임 편집 관련 상태
const isEditingNickname = ref(false)
const newNickname = ref('')
const nicknameLoading = ref(false)
const nicknameError = ref('')

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

// 닉네임 편집 시작
const startEditNickname = () => {
  isEditingNickname.value = true
  newNickname.value = profileData.value.nickname || ''
  nicknameError.value = ''
}

// 닉네임 편집 취소
const cancelEditNickname = () => {
  isEditingNickname.value = false
  newNickname.value = ''
  nicknameError.value = ''
}

// 닉네임 에러 메시지 클리어
const clearNicknameError = () => {
  nicknameError.value = ''
}

// 닉네임 중복 체크
const checkNickname = async (nickname) => {
  try {
    const response = await axios.post('http://localhost:8080/member/nickname', {
      nickname: nickname
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data // true면 사용 가능, false면 중복
  } catch (err) {
    console.error('닉네임 중복 체크 실패:', err)
    throw new Error('닉네임 중복 체크에 실패했습니다.')
  }
}

// 닉네임 업데이트
const updateNickname = async () => {
  if (!newNickname.value.trim()) {
    nicknameError.value = '닉네임을 입력해주세요.'
    return
  }

  if (newNickname.value.trim() === profileData.value.nickname) {
    nicknameError.value = '현재 닉네임과 동일합니다.'
    return
  }

  nicknameLoading.value = true
  nicknameError.value = ''

  try {
    // 1. 닉네임 중복 체크
    const isAvailable = await checkNickname(newNickname.value.trim())

    if (!isAvailable) {
      nicknameError.value = '이미 사용 중인 닉네임입니다.'
      return
    }

    // 2. 닉네임 업데이트
    const response = await axios.put('http://localhost:8080/member/nickname', {
      nickname: newNickname.value.trim(),
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 3. 성공 시 프로필 데이터 업데이트
    profileData.value.nickname = response.data
    isEditingNickname.value = false
    newNickname.value = ''

    message.success('닉네임이 성공적으로 변경되었습니다.')

  } catch (err) {
    console.error('닉네임 변경 실패:', err)

    if (err.response?.status === 401) {
      nicknameError.value = '인증이 만료되었습니다. 다시 로그인해주세요.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (err.response?.status === 404) {
      nicknameError.value = '사용자 정보를 찾을 수 없습니다.'
    } else {
      nicknameError.value = err.message || '닉네임 변경에 실패했습니다.'
    }
  } finally {
    nicknameLoading.value = false
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

/* 닉네임 관련 스타일 */
.table-value-with-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.value-display {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

.value-text {
  font-size: 16px;
  color: #666;
}

.edit-button {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background: #40a9ff;
}

.value-edit {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.nickname-input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.nickname-input:focus {
  outline: none;
  border-color: #1890ff;
}

.nickname-input.error {
  border-color: #ff4d4f;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-button {
  padding: 6px 12px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #73d13d;
}

.save-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.cancel-button {
  padding: 6px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background: #ff7875;
}

.error-message {
  font-size: 12px;
  color: #ff4d4f;
  text-align: right;
  width: 100%;
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

  .table-value, .table-value-with-action {
    text-align: left;
    align-items: flex-start;
  }

  .value-display {
    justify-content: flex-start;
  }

  .value-edit {
    align-items: flex-start;
  }

  .nickname-input {
    width: 100%;
    max-width: 250px;
  }

  .error-message {
    text-align: left;
  }
}
</style>
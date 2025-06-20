<template>
  <div class="profile-container">
    <!-- 메인 프로필 콘텐츠 -->
    <div class="profile-content">
      <div class="content-container">
        <!-- 프로필 헤더 -->
        <div class="profile-header">
          <h1 class="page-title">프로필</h1>
        </div>

        <!-- 프로필 카드 -->
        <div class="profile-main-card">
          <div class="profile-avatar-section">
            <a-avatar :size="80" class="profile-avatar">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
            <div class="profile-basic-info">
              <h2 class="profile-name">{{ userInfo.name || '사용자' }}</h2>
              <p class="profile-status">프로필 사진 설정</p>
            </div>
          </div>
        </div>

        <!-- 개인정보 섹션 -->
        <div class="profile-section">
          <h3 class="section-title">개인정보</h3>
          <div class="info-card">
            <div class="info-row" v-for="info in personalInfo" :key="info.key">
              <div class="info-label">{{ info.label }}</div>
              <div class="info-value">
                <span v-if="!info.editable">{{ info.value }}</span>
                <a-button
                    v-if="info.editable"
                    type="link"
                    class="edit-button"
                    @click="editInfo(info.key)"
                >
                  편집
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 연락처 정보 섹션 -->
        <div class="profile-section">
          <h3 class="section-title">연락처 정보</h3>
          <div class="info-card">
            <div class="info-row" v-for="contact in contactInfo" :key="contact.key">
              <div class="info-label">{{ contact.label }}</div>
              <div class="info-value">
                <span class="contact-value">{{ contact.value }}</span>
                <a-button type="link" class="edit-button" @click="editContact(contact.key)">
                  <RightOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 암호 재설정 섹션 -->
        <div class="profile-section full-width">
          <div class="password-reset-card" @click="handlePasswordReset">
            <div class="password-reset-content">
              <div class="password-reset-info">
                <h4 class="password-reset-title">암호를 재설정</h4>
                <p class="password-reset-desc">비밀번호 수정</p>
              </div>
              <div class="password-reset-date">
                <span>수정</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { UserOutlined, RightOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 사용자 정보
const userInfo = computed(() => authStore.userInfo || {})

// 개인정보 데이터
const personalInfo = ref([
  {
    key: 'name',
    label: '성명',
    value: '유',
    editable: true
  },
  {
    key: 'username',
    label: '유저명',
    value: '편집',
    editable: true
  },
  {
    key: 'birthdate',
    label: 'Dec.04,1995',
    value: '편집',
    editable: true
  },
  {
    key: 'gender',
    label: '남성',
    value: '편집',
    editable: true
  }
])

// 연락처 정보 데이터
const contactInfo = ref([
  {
    key: 'email',
    label: 'test1@gmail.com',
    value: '공동 구독자에게 내 이메일 표시',
    description: '전화 번호'
  }
])

// 메서드들
const editInfo = (key) => {
  message.info(`${key} 정보를 편집합니다.`)
  // 실제로는 편집 모달이나 페이지로 이동
}

const editContact = (key) => {
  message.info(`${key} 연락처 정보를 편집합니다.`)
  // 실제로는 연락처 편집 페이지로 이동
}

const handlePasswordReset = () => {
  message.info('암호 재설정 페이지로 이동합니다.')
  // 실제로는 암호 재설정 페이지로 이동
  // router.push('/password-reset')
}
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

/* 프로필 메인 카드 */
.profile-main-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  background: #69b7ff;
  flex-shrink: 0;
}

.profile-basic-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.profile-status {
  color: #666;
  margin: 0;
  font-size: 14px;
}

/* 프로필 섹션 */
.profile-section {
  margin-bottom: 24px;
}

.profile-section.full-width {
  width: 100%;
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

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.contact-value {
  font-size: 14px;
  max-width: 300px;
  text-align: right;
}

.edit-button {
  color: #69b7ff;
  padding: 0;
  height: auto;
  font-size: 14px;
}

.edit-button:hover {
  color: #40a9ff;
}

/* 암호 재설정 카드 */
.password-reset-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.password-reset-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.password-reset-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-reset-info {
  flex: 1;
}

.password-reset-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.password-reset-desc {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.password-reset-date {
  color: #69b7ff;
  font-size: 14px;
  font-weight: 500;
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

  .profile-main-card {
    padding: 24px 20px;
  }

  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .info-card {
    padding: 20px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-value {
    width: 100%;
    justify-content: space-between;
  }

  .contact-value {
    text-align: left;
    max-width: none;
  }

  .password-reset-card {
    padding: 20px;
  }

  .password-reset-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
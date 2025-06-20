<template>
  <div class="container">
    <div class="main-content">
      <div class="left-section">
        <div class="left-content">
          <div class="logo">OttMoa</div>
          <div class="welcome-title">안녕하세요!</div>
          <div class="welcome-subtitle">OttMoa에 오신것을 환영합니다!</div>
        </div>
      </div>

      <div class="right-section">
        <div class="login-title">로그인</div>

        <a-form
            :model="loginForm"
            @finish="handleLogin"
            class="login-form"
            layout="vertical"
        >
          <a-form-item
              name="username"
              :rules="[{ required: true, message: '아이디를 입력해주세요!' }]"
          >
            <a-input
                v-model:value="loginForm.username"
                placeholder="아이디를 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              name="password"
              :rules="[{ required: true, message: '비밀번호를 입력해주세요!' }]"
          >
            <a-input-password
                v-model:value="loginForm.password"
                placeholder="비밀번호를 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item>
            <a-button
                type="primary"
                html-type="submit"
                class="login-button"
                :loading="loading"
                size="large"
                block
            >
              로그인
            </a-button>
          </a-form-item>
        </a-form>

        <div class="signup-link">
          <span style="color: #666;">계정이 없으신가요? </span>
          <a-button type="link" @click="handleSignup" class="signup-button">
            회원가입
          </a-button>
        </div>

        <a-divider>또는 간편 로그인</a-divider>

        <div class="social-login">
          <a-button
              class="social-button kakao"
              @click="handleSocialLogin('kakao')"
              size="large"
              block
          >
            카카오
          </a-button>
          <a-button
              class="social-button naver"
              @click="handleSocialLogin('naver')"
              size="large"
              block
          >
            네이버
          </a-button>
          <a-button
              class="social-button google"
              @click="handleSocialLogin('google')"
              size="large"
              block
          >
            구글
          </a-button>
        </div>

        <!-- 서버 연결 테스트 버튼 -->
        <div style="margin-top: 20px;">
          <a-button
              @click="testServerConnection"
              type="dashed"
              size="small"
              block
              :disabled="loading"
          >
            🔍 서버 연결 테스트
          </a-button>
        </div>
      </div>
    </div>

    <div class="footer">
      Copyright © 2025 OttMoa. All Rights Reserved.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

// 반응형 데이터
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const authStore = useAuthStore()
const router = useRouter()

// 서버 연결 테스트 함수
const testServerConnection = async () => {
  try {
    console.log('🔍 서버 연결 테스트 시작...')

    // 1. 프록시를 통한 요청 테스트
    console.log('1️⃣ 프록시를 통한 /api/auth/status 요청...')
    const proxyResponse = await axios.get('/api/auth/status')
    console.log('✅ 프록시 요청 성공:', proxyResponse.data)

    message.success('✅ 서버 연결 성공! 콘솔을 확인하세요.')
  } catch (error) {
    console.error('❌ 서버 연결 실패:', error)
    if (axios.isAxiosError(error)) {
      console.error('상태:', error.response?.status)
      console.error('메시지:', error.response?.data)
      message.error(`❌ 서버 연결 실패 (상태: ${error.response?.status})`)
    } else {
      message.error('❌ 네트워크 오류 발생')
    }
  }
}

// 로그인 처리
const handleLogin = async (values) => {
  loading.value = true
  try {
    // 스토어의 login 함수 호출 후 성공 여부를 받음
    const success = await authStore.login({
      loginId: values.username,
      password: values.password,
    })

    // 로그인 성공 시, 컴포넌트에서 직접 페이지 이동
    if (success) {
      message.success('로그인 성공!')
      router.push('/chat') // 또는 '/dashboard'
    }
  } finally {
    loading.value = false
  }
}

// 회원가입 처리
const handleSignup = () => {
  console.log('회원가입 클릭')
  message.info('회원가입 페이지로 이동합니다.')
  router.push('/signup')
}

// 소셜 로그인 처리
const handleSocialLogin = (provider) => {
  console.log(`${provider} 로그인 클릭`)
  message.info(`${provider} 로그인을 진행합니다.`)

  // 실제 소셜 로그인 로직
  // window.location.href = `/auth/${provider}`
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.main-content {
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  min-height: 600px;
}

.left-section {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  position: relative;
}

.left-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.left-content {
  position: relative;
  z-index: 1;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 40px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-title {
  font-size: 42px;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.3;
  opacity: 0.95;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.right-section {
  flex: 0 0 400px;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.login-form {
  width: 100%;
}

/* Ant Design 컴포넌트 커스터마이징 */
:deep(.ant-input) {
  height: 50px;
  border-radius: 10px;
  border: 2px solid #e8e8e8;
  font-size: 16px;
  transition: all 0.3s ease;
}

:deep(.ant-input:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 비밀번호 입력 필드 스타일링 개선 */
:deep(.ant-input-password) {
  height: 50px;
  border-radius: 10px;
  border: 2px solid #e8e8e8;
  background: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

:deep(.ant-input-password .ant-input) {
  height: 46px;
  border: none;
  box-shadow: none;
  background: transparent;
  padding-right: 40px;
  line-height: 46px;
  display: flex;
  align-items: center;
}

:deep(.ant-input-password:focus-within) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ant-input-password .ant-input:focus) {
  border: none;
  box-shadow: none;
}

:deep(.ant-input-password .ant-input-suffix) {
  background: transparent;
  display: flex;
  align-items: center;
  height: 46px;
}

:deep(.ant-input-password .ant-input::placeholder) {
  line-height: 46px;
  vertical-align: middle;
}

.login-button {
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

:deep(.login-button:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.signup-link {
  text-align: center;
  margin: 15px 0 20px 0;
}

.signup-button {
  color: #1890ff !important;
  padding: 0 !important;
  height: auto !important;
}

:deep(.ant-divider) {
  margin: 30px 0;
  color: #999;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.social-button {
  height: 50px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.social-button.kakao {
  background: #FEE500 !important;
  border-color: #FEE500 !important;
  color: #3C1E1E !important;
}

.social-button.kakao:hover {
  background: #F7D600 !important;
  border-color: #F7D600 !important;
}

.social-button.naver {
  background: #03C75A !important;
  border-color: #03C75A !important;
  color: white !important;
}

.social-button.naver:hover {
  background: #02B351 !important;
  border-color: #02B351 !important;
}

.social-button.google {
  background: white !important;
  border-color: #e8e8e8 !important;
  color: #333 !important;
}

.social-button.google:hover {
  background: #f5f5f5 !important;
}

.footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    margin: 20px;
    min-height: auto;
  }

  .left-section, .right-section {
    flex: none;
    padding: 40px 30px;
  }

  .right-section {
    flex: 0 0 auto;
  }

  .welcome-title {
    font-size: 32px;
  }

  .welcome-subtitle {
    font-size: 22px;
  }

  .social-login {
    flex-direction: row;
  }
}
</style>
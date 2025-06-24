<template>
  <div class="signup-container">
    <div class="signup-content">
      <div class="signup-card">
        <div class="signup-header">
          <h2>회원가입</h2>
          <p>OttMoa에 오신 것을 환영합니다!</p>
        </div>

        <a-form
            ref="formRef"
            :model="signupForm"
            @finish="handleSignup"
            layout="vertical"
            class="signup-form"
            :validate-trigger="['blur', 'submit']"
        >
          <a-form-item
              label="아이디"
              name="loginId"
              :rules="[
              { required: true, message: '아이디를 입력해주세요', trigger: ['blur', 'submit'] },
              { min: 4, max: 20, message: '아이디는 4-20자 사이여야 합니다', trigger: ['blur', 'submit'] },
              { pattern: /^[a-zA-Z0-9]+$/, message: '아이디는 영문과 숫자만 사용 가능합니다', trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input
                v-model:value="signupForm.loginId"
                placeholder="아이디를 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              label="비밀번호"
              name="password"
              :rules="[
              { required: true, message: '비밀번호를 입력해주세요', trigger: ['blur', 'submit'] },
              { min: 6, max: 20, message: '비밀번호는 6-20자 사이여야 합니다', trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input-password
                v-model:value="signupForm.password"
                placeholder="비밀번호를 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              label="비밀번호 확인"
              name="passwordCheck"
              :rules="[
              { required: true, message: '비밀번호를 다시 입력해주세요', trigger: ['blur', 'submit'] },
              { validator: validatePasswordMatch, trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input-password
                v-model:value="signupForm.passwordCheck"
                placeholder="비밀번호를 다시 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              label="닉네임"
              name="nickname"
              :rules="[
              { required: true, message: '닉네임을 입력해주세요', trigger: ['blur', 'submit'] },
              { min: 2, max: 10, message: '닉네임은 2-10자 사이여야 합니다', trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input
                v-model:value="signupForm.nickname"
                placeholder="닉네임을 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              label="이름"
              name="name"
              :rules="[
              { required: true, message: '이름을 입력해주세요', trigger: ['blur', 'submit'] },
              { min: 2, max: 10, message: '이름은 2-10자 사이여야 합니다', trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input
                v-model:value="signupForm.name"
                placeholder="이름을 입력하세요"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item
              label="이메일"
              name="email"
              :rules="[
              { required: true, message: '이메일을 입력해주세요', trigger: ['blur', 'submit'] },
              { type: 'email', message: '올바른 이메일 형식을 입력해주세요', trigger: ['blur', 'submit'] }
            ]"
          >
            <a-input
                v-model:value="signupForm.email"
                placeholder="이메일을 입력하세요 (예: ottmoa@example.com)"
                size="large"
                class="input-field"
            />
          </a-form-item>

          <a-form-item class="submit-section">
            <a-button
                type="primary"
                html-type="submit"
                block
                :loading="loading"
                size="large"
                class="signup-button"
            >
              회원가입
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-link">
          <span>이미 계정이 있으신가요? </span>
          <a-button type="link" @click="goToLogin" class="login-link-button">
            로그인
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useAuthStore} from '@/stores/auth'
import {useRouter} from 'vue-router'
import {message} from 'ant-design-vue'

const loading = ref(false)
const formRef = ref()
const signupForm = ref({
  loginId: '',
  password: '',
  passwordCheck: '',
  nickname: '',
  name: '',
  email: ''
})

const authStore = useAuthStore()
const router = useRouter()

// 비밀번호 일치 검증
const validatePasswordMatch = async (rule, value) => {
  if (value && value !== signupForm.value.password) {
    return Promise.reject('비밀번호가 일치하지 않습니다')
  }
  return Promise.resolve()
}

// 회원가입 처리
const handleSignup = async (values) => {
  loading.value = true
  try {
    const success = await authStore.join(values)
    if (success) {
      authStore.isAuthenticated = false
      message.success('입력하신 이메일 주소로 인증 메일이 발송되었습니다.\n메일함에서 인증을 완료해주세요.')
      //message.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } finally {
    loading.value = false
  }
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 20px;
}

.signup-content {
  width: 100%;
  max-width: 500px;
}

.signup-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.signup-header {
  text-align: center;
  margin-bottom: 30px;
}

.signup-header h2 {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.signup-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.signup-form {
  width: 100%;
}

/* Input 스타일링 */
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

:deep(.ant-input-password) {
  height: 50px;
  border-radius: 10px;
  border: 2px solid #e8e8e8;
  background: white;
  transition: all 0.3s ease;
}

:deep(.ant-input-password .ant-input) {
  height: 46px;
  border: none;
  box-shadow: none;
  background: transparent;
  padding-right: 40px;
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
}

/* Form Item 스타일링 */
:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* 에러 메시지 스타일링 */
:deep(.ant-form-item-explain) {
  font-size: 13px;
  margin-top: 4px;
}

/* 회원가입 버튼 */
.signup-button {
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

:deep(.signup-button:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.submit-section {
  margin-top: 30px;
  margin-bottom: 20px;
}

/* 로그인 링크 */
.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link-button {
  color: #1890ff !important;
  padding: 0 !important;
  height: auto !important;
  font-weight: 500;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .signup-card {
    padding: 30px 20px;
  }

  .signup-header h2 {
    font-size: 24px;
  }
}
</style>
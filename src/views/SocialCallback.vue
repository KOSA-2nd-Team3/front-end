<template>
  <div class="social-callback-container">
    <div class="loading-spinner">
      <a-spin size="large" />
      <p>소셜 로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    // URL에서 임시 인증 코드 추출
    const urlParams = new URLSearchParams(window.location.search)
    const tempCode = urlParams.get('code')

    if (!tempCode) {
      message.error('소셜 로그인 처리 중 오류가 발생했습니다.')
      router.push('/login')
      return
    }

    console.log('🔄 소셜 로그인 토큰 교환 시작:', tempCode)

    // 임시 코드를 실제 액세스 토큰으로 교환
    const response = await axios.post('/api/auth/social/exchange', {
      code: tempCode
    })

    console.log('✅ 토큰 교환 성공:', response.data)

    if (response.status === 200 && response.data.authenticated) {
      // 응답 헤더에서 토큰 추출
      const token = response.headers['authorization']

      if (token) {
        // Bearer 접두사 제거
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
        authStore.setToken(cleanToken)

        // 사용자 정보 설정
        authStore.isAuthenticated = true
        authStore.userInfo = response.data.user

        // loginId 저장 (채팅용)
        if (response.data.user?.loginId) {
          localStorage.setItem('loginId', response.data.user.loginId)
        }

        message.success('소셜 로그인 성공!')
        router.push('/marketplace')
      } else {
        throw new Error('토큰을 받지 못했습니다.')
      }
    } else {
      throw new Error('인증에 실패했습니다.')
    }

  } catch (error) {
    console.error('💥 소셜 로그인 처리 실패:', error)
    message.error('소셜 로그인 처리 중 오류가 발생했습니다.')
    router.push('/login')
  }
})
</script>

<style scoped>
.social-callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner p {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}
</style>
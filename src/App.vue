<template>
  <div id="app">
    <!-- 로그인이 필요 없는 페이지들 (로그인, 회원가입 등) -->
    <div v-if="isPublicRoute">
      <router-view />
    </div>

    <!-- 로그인이 필요한 페이지들 (헤더/푸터 포함) -->
    <div v-else>
      <a-layout style="min-height: 100vh;">
        <!-- 헤더 컴포넌트 -->
        <AppHeader
            :current-page="currentPage"
            @subscribe-share="handleSubscribeShare"
            @menu-click="handleMenuClick"
        />

        <!-- 메인 콘텐츠 -->
        <a-layout-content style="flex: 1;">
          <router-view />
        </a-layout-content>

        <!-- 푸터 컴포넌트 -->
        <AppFooter />
      </a-layout>
    </div>

    <!-- 글로벌 로딩 스피너 -->
    <div v-if="globalLoading" class="global-loading">
      <a-spin size="large" tip="로딩 중...">
        <div style="width: 100px; height: 100px;"></div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()


// 반응형 데이터
const globalLoading = ref(false)

// computed
const isPublicRoute = computed(() => {
  const publicRoutes = ['/login', '/signup', '/']
  return publicRoutes.includes(route.path)
})

const currentPage = computed(() => {
  const path = route.path
  if (path === '/' || path === '/marketplace') return 'home'
  if (path === '/dashboard') return 'dashboard'
  if (path === '/chat') return 'chat'
  if (path === '/community') return 'community'
  return 'home'
})

// 라이프사이클
onMounted(async () => {
  // 앱 시작시 인증 상태 확인
  const token = authStore.getToken()
  if (token) {
    globalLoading.value = true
    try {
      await authStore.checkAuthStatus()
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error)
    } finally {
      globalLoading.value = false
    }
  }
})

// 라우트 변화 감지
watch(
    () => route.path,
    (newPath) => {
      // 필요시 라우트 변경 로직 추가
    }
)

// 헤더 이벤트 핸들러들
const handleSubscribeShare = () => {
  message.info('구독 공유하기 기능을 준비중입니다.')
}

const handleMenuClick = () => {
  message.info('메뉴를 클릭했습니다.')
}

// 전역 에러 핸들링
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 처리되지 않은 Promise 거부:', event.reason)
  message.error('예상치 못한 오류가 발생했습니다.')
})

// axios 전역 에러 핸들링 (401 unauthorized 처리)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStore.clearToken()
        authStore.isAuthenticated = false
        authStore.userInfo = null

        if (!isPublicRoute.value) {
          message.warning('로그인이 만료되었습니다. 다시 로그인해주세요.')
          router.push('/login')
        }
      }
      return Promise.reject(error)
    }
)
</script>

<style>
/* 전역 스타일 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 글로벌 로딩 스피너 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* Ant Design 전역 커스터마이징 */
.ant-layout {
  background: #fff;
}

.ant-layout-header {
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ant-layout-content {
  background: #f5f5f5;
}

/* 스크롤바 커스터마이징 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .ant-layout-header {
    padding: 0 20px;
  }
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 접근성 개선 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 포커스 스타일 개선 */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}
</style>
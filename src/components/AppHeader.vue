  <template>
    <a-layout-header style="background: white; padding: 0; border-bottom: 1px solid #f0f0f0; height: 64px; line-height: 64px;">
      <!-- 컨테이너로 감싸서 양쪽 여백 추가 -->
      <div class="header-container">
        <div style="display: flex; justify-content: space-between; align-items: center; height: 100%;">
          <!-- 좌측 로고 -->
          <div style="display: flex; align-items: center;">
            <a-typography-title :level="3" style="margin: 0; color: #69b7ff; font-weight: bold; cursor: pointer;" @click="navigateTo('home')">
              OTTMOA
            </a-typography-title>
          </div>

          <!-- 중앙 네비게이션 -->
          <div style="display: flex; align-items: center; gap: 32px;">
            <a-button
                type="text"
                :class="{ 'active-nav': currentPage === 'home' }"
                @click="navigateTo('home')"
            >
              홈페이지
            </a-button>
            <a-button
                type="text"
                :class="{ 'active-nav': currentPage === 'dashboard' }"
                @click="navigateTo('dashboard')"
            >
              구독
            </a-button>
            <a-button
                type="text"
                :class="{ 'active-nav': currentPage === 'chat' }"
                @click="navigateTo('chat')"
            >
              채팅
            </a-button>
          </div>

          <!-- 우측 사용자 영역 -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <!-- 구독 공유하기 버튼 -->
            <a-button
                type="primary"
                style="background-color: #69b7ff; border-color: #69b7ff; border-radius: 20px;"
                @click="handleSubscribeShare"
            >
              + 구독 공유하기
            </a-button>

            <!-- 사용자 프로필 -->
            <a-dropdown :trigger="['click']">
              <a-avatar
                  style="background-color: #69b7ff; cursor: pointer;"
              >
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item key="profile">
                    <UserOutlined />
                    프로필
                  </a-menu-item>
                  <a-menu-item key="logout">
                    <LogoutOutlined />
                    로그아웃
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

          </div>
        </div>
      </div>
    </a-layout-header>
  </template>

  <script setup>
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { message } from 'ant-design-vue'
  import {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuOutlined
  } from '@ant-design/icons-vue'

  // Props 정의
  const props = defineProps({
    currentPage: {
      type: String,
      default: 'home'
    }
  })

  // Emits 정의
  const emit = defineEmits(['profile-click', 'subscribe-share', 'menu-click'])

  const router = useRouter()
  const authStore = useAuthStore()

  // 네비게이션 처리
  const navigateTo = (page) => {
    switch (page) {
      case 'home':
        router.push('/marketplace')
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'chat':
        router.push('/chat')
        break
      case 'community':
        router.push('/community')
        break
      case 'subscription':
        router.push('/community')
        break
    }
  }

  // 이벤트 핸들러들
  const handleProfileClick = () => {
    emit('profile-click')
  }

  const handleSubscribeShare = () => {
    router.push('/subscription')
  }

  const handleLogout = async () => {
    try {
      await authStore.logout()
      message.success('로그아웃되었습니다.')
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      message.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const handleMenuClick = async ({key}) => {
    emit('menu-click')
    if (key === 'profile') {
      router.push('/profile')
    } else if (key === 'logout') {
      await handleLogout()
    }
  }
  </script>

  <style scoped>
  /* 헤더 컨테이너 - 양쪽 여백 추가 */
  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    height: 100%;
  }

  .active-nav {
    color: #69b7ff !important;
    font-weight: 500;
  }

  .active-nav::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background-color: #69b7ff;
  }

  .ant-btn {
    position: relative;
  }

  /* 반응형 디자인 */
  @media (max-width: 1200px) {
    .header-container {
      padding: 0 24px;
    }
  }

  @media (max-width: 768px) {
    .header-container {
      padding: 0 16px;
    }
  }
  </style>
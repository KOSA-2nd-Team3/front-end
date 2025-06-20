import {createRouter, createWebHistory} from 'vue-router'
import SignUpView from "@/views/LoginView.vue";
import ChatView from "@/views/ChatView.vue";
import LoginView from "@/views/LoginView.vue";
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // {
        //     path: '/',
        //     redirect: '/login'
        // },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('@/views/ChatView.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('@/views/SignUpView.vue')
        },
        {
            path: '/marketplace',
            name: 'marketplace',
            component: () => import('@/views/MainView.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/views/DashboardView.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@/views/ProfileView.vue'),
            meta: {requiresAuth: true}
        },
    ],
})

// 🔒 인증 가드 설정
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 저장된 토큰이 있으면 인증 상태 확인
    const token = authStore.getToken()
    if (token && !authStore.isAuthenticated) {
        // 토큰은 있지만 store의 인증 상태가 false인 경우 (페이지 새로고침 등)
        console.log('🔄 토큰 있음, 인증 상태 재확인 중...')
        await authStore.checkAuthStatus()
    }

    const isAuthenticated = authStore.isAuthenticated

    console.log(`🔍 Route Guard - Going to: ${to.path}, Authenticated: ${isAuthenticated}`)

    // 인증이 필요한 페이지 체크
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('❌ 인증 필요, 로그인 페이지로 리다이렉트')
        next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
        // 이미 로그인되어 있으면 홈페이지로 리다이렉트
        console.log('✅ 이미 로그인됨, 홈으로 리다이렉트')
        next('/')
    } else {
        // 정상적으로 진행
        console.log('✅ Route guard 통과')
        next()
    }
})

export default router
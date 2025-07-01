import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// axios 기본 설정 추가
import axios from 'axios'

// axios 기본 설정
axios.defaults.timeout = 10000 // 10초 타임아웃
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.withCredentials = true // 쿠키 자동 전송 (리프레시 토큰용)

// 요청 인터셉터
axios.interceptors.request.use(
    (config) => {
        console.log('📤 Axios 요청:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            headers: config.headers,
        })
        return config
    },
    (error) => {
        console.error('📤 Axios 요청 오류:', error)
        return Promise.reject(error)
    }
)

// 응답 인터셉터
axios.interceptors.response.use(
    (response) => {
        console.log('📥 Axios 응답 성공:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            data: response.data,
        })
        return response
    },
    (error) => {
        console.error('📥 Axios 응답 오류:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
        })
        return Promise.reject(error)
    }
)

// Ant Design Vue 추가
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
const pinia = createPinia()

app.use(Antd)
app.use(pinia)
app.use(router)

// 앱 마운트
app.mount('#app')

// Pinia 스토어 초기화 후 토큰 로드
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.loadToken() // 저장된 토큰이 있으면 axios 헤더에 자동 설정
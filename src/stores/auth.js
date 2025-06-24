import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    const userInfo = ref(null)

    /**
     * 토큰을 localStorage에 저장하고 axios 기본 헤더에 설정
     */
    function setToken(token) {
        localStorage.setItem('accessToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('✅ 토큰 설정 완료:', `Bearer ${token.substring(0, 20)}...`)
    }

    /**
     * 토큰을 제거하고 axios 헤더에서도 제거
     */
    function clearToken() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('loginId') // loginId도 함께 제거
        delete axios.defaults.headers.common['Authorization']
        console.log('🗑️ 토큰 및 loginId 제거 완료')
    }

    /**
     * localStorage에서 토큰을 가져와서 axios 헤더에 설정
     */
    function loadToken() {
        const token = localStorage.getItem('accessToken')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            console.log('🔄 저장된 토큰 로드 완료')
            return token
        }
        return null
    }

    /**
     * 현재 토큰 반환
     */
    function getToken() {
        return localStorage.getItem('accessToken')
    }

    /**
     * 서버에 로그인 요청을 보냅니다.
     * @returns 로그인 성공 여부 (boolean)
     */
    async function login(loginData) {
        try {
            console.log('🚀 로그인 요청 시작')
            console.log('📋 요청 데이터:', {
                loginId: loginData.loginId,
                password: '***' // 비밀번호는 로그에 노출하지 않음
            })
            console.log('🌐 요청 URL:', '/api/auth/login')

            const requestPayload = {
                loginId: loginData.loginId,
                password: loginData.password,
            }

            console.log('📤 실제 전송 데이터:', {
                ...requestPayload,
                password: '***' // 비밀번호 마스킹
            })

            const response = await axios.post('/api/auth/login', requestPayload)

            console.log('📡 서버 응답 상태:', response.status)
            console.log('📡 서버 응답 헤더:', response.headers)
            console.log('📡 서버 응답 데이터:', response.data)

            if (response.status === 200 && response.data.authenticated) {
                // 응답 헤더에서 토큰 추출
                const token = response.headers['authorization'] || response.data.accessToken
                console.log('🔑 토큰 추출 결과:', token ? `${token.substring(0, 20)}...` : '토큰 없음')

                if (token) {
                    // Bearer 접두사 제거 (필요한 경우)
                    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
                    setToken(cleanToken)
                } else {
                    console.warn('⚠️ 서버 응답에 토큰이 없습니다.')
                }

                isAuthenticated.value = true
                userInfo.value = response.data.user

                // 채팅을 위해 loginId를 별도로 저장
                if (userInfo.value?.loginId) {
                    localStorage.setItem('loginId', userInfo.value.loginId)
                    console.log('💾 loginId 저장 완료:', userInfo.value.loginId)
                }

                console.log('✅ 로그인 성공:', userInfo.value)
                return true
            } else {
                console.log('❌ 로그인 실패 - 인증되지 않음')
                console.log('- response.status:', response.status)
                console.log('- response.data.authenticated:', response.data.authenticated)
                return false
            }
        } catch (error) {
            console.error('💥 로그인 요청 중 오류 발생:', error)

            if (axios.isAxiosError(error)) {
                console.error('📡 Axios 오류 상세:')
                console.error('- 상태 코드:', error.response?.status)
                console.error('- 응답 데이터:', error.response?.data)
                console.error('- 요청 설정:', error.config)

                const code = error.response?.data?.code;

                if (error.response?.status === 401) {
                    if (code === 'A005') {
                        // 이메일 인증 실패 코드
                        alert('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
                    } else {
                        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
                    }

                    //alert('아이디 또는 비밀번호가 일치하지 않습니다.')
                } else if (error.response?.status === 500) {
                    alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
                } else {
                    alert(`로그인 중 오류가 발생했습니다. (상태: ${error.response?.status})`)
                }
            } else {
                console.error('💥 일반 오류:', error)
                alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
            }

            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
            return false
        }
    }

    async function join(joinData) {
        try {
            const response = await axios.post('/api/auth/join', joinData)
            return response.status === 201
        } catch (error) {
            console.error('💥 회원가입 실패:', error)
            let errorMessage = '회원가입 중 오류가 발생했습니다. 아이디나 이메일이 중복될 수 있습니다.'
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || errorMessage
            }
            alert(errorMessage)
            return false
        }
    }

    /**
     * 서버에 로그아웃 요청을 보냅니다.
     */
    async function logout() {
        try {
            await axios.post('/api/auth/logout')
        } finally {
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
        }
    }

    async function checkAuthStatus() {
        try {
            console.log('🔍 /api/auth/status 요청 중...')

            // 저장된 토큰이 있으면 헤더에 설정
            const token = loadToken()
            if (!token) {
                console.log('❌ 저장된 토큰이 없음')
                isAuthenticated.value = false
                userInfo.value = null
                return
            }

            const response = await axios.get('/api/auth/status')
            console.log('📡 서버 응답:', response.data)

            if (response.status === 200 && response.data.authenticated) {
                console.log('✅ 인증 성공, userInfo 설정 중...')
                isAuthenticated.value = true
                userInfo.value = response.data.user
                console.log('✅ 설정 완료 - userInfo:', userInfo.value)
            } else {
                console.log('❌ 인증 실패')
                isAuthenticated.value = false
                userInfo.value = null
                clearToken()
            }
        } catch (error) {
            console.error('💥 /api/auth/status 요청 실패:', error)
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
        }
    }

    return {
        isAuthenticated,
        userInfo,
        login,
        join,
        logout,
        checkAuthStatus,
        setToken,
        clearToken,
        loadToken,
        getToken
    }
})
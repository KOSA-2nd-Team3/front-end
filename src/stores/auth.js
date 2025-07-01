import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false)
    const userInfo = ref(null)
    const isRefreshing = ref(false) // 리프레시 토큰 중복 요청 방지

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
     * 현재 토큰 반환 (localStorage와 axios 헤더 동기화)
     */
    function getToken() {
        const token = localStorage.getItem('accessToken')
        
        // localStorage와 axios 헤더 동기화
        if (token) {
            // 토큰이 있으면 axios 헤더에도 설정
            if (!axios.defaults.headers.common['Authorization']) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                console.log('🔄 axios 헤더에 토큰 동기화 완료')
            }
        } else {
            // 토큰이 없으면 axios 헤더에서도 제거
            if (axios.defaults.headers.common['Authorization']) {
                delete axios.defaults.headers.common['Authorization']
                console.log('🗑️ axios 헤더에서 토큰 제거 완료')
            }
        }
        
        return token
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
    /**
     * 리프레시 토큰을 통해 새로운 액세스 토큰을 발급받습니다.
     */
    async function refreshToken() {
        // 이미 리프레시 중이면 기다림
        if (isRefreshing.value) {
            console.log('⏳ 이미 리프레시 토큰 요청 중이므로 대기...')
            return new Promise((resolve, reject) => {
                const checkRefresh = setInterval(() => {
                    if (!isRefreshing.value) {
                        clearInterval(checkRefresh)
                        const token = getToken()
                        if (token) {
                            resolve(token)
                        } else {
                            reject(new Error('리프레시 실패'))
                        }
                    }
                }, 100)
            })
        }

        try {
            isRefreshing.value = true
            console.log('🔄 액세스 토큰 갱신 시도 중...')
            
            const response = await axios.post('/api/auth/token/reissue', {}, {
                withCredentials: true // 쿠키 전송 필요
            })
            
            // 응답 헤더에서 새로운 액세스 토큰 추출
            const newAccessToken = response.headers.authorization?.replace('Bearer ', '')
            
            if (newAccessToken) {
                setToken(newAccessToken)
                console.log('✅ 액세스 토큰 갱신 성공')
                return newAccessToken
            } else {
                throw new Error('새로운 액세스 토큰을 받지 못했습니다.')
            }
        } catch (error) {
            console.error('❌ 액세스 토큰 갱신 실패:', error)
            // 리프레시 실패 시 완전 로그아웃
            logout()
            throw error
        } finally {
            isRefreshing.value = false
        }
    }

    async function logout() {
        try {
            // 로그아웃 요청시 인터셉터에서 토큰 갱신하지 않도록 플래그 설정
            await axios.post('/api/auth/logout', {}, { 
                headers: { 'X-Skip-Auth-Refresh': 'true' }
            })
        } catch (error) {
            // 로그아웃 요청 실패해도 로컬 정리는 진행
            console.log('로그아웃 요청 실패, 로컬 정리 진행:', error.response?.status)
        } finally {
            isAuthenticated.value = false
            userInfo.value = null
            clearToken()
        }
    }

    async function checkAuthStatus() {
        try {
            console.log('🔍 인증 상태 확인 시작...')

            // 저장된 액세스 토큰 확인 (동기화 포함)
            const token = getToken()
            if (!token) {
                console.log('⚠️ 저장된 액세스 토큰이 없음, 리프레시 토큰으로 복구 시도...')
                try {
                    // 직접 리프레시 토큰으로 새 액세스 토큰 발급 시도
                    await refreshToken()
                    console.log('✅ 리프레시 토큰으로 액세스 토큰 복구 성공')
                } catch (refreshError) {
                    console.log('❌ 리프레시 토큰으로 복구 실패, 로그아웃 상태로 설정')
                    isAuthenticated.value = false
                    userInfo.value = null
                    return
                }
            }

            // 액세스 토큰이 있는 상태에서 사용자 정보 요청
            console.log('🔍 /api/auth/status 요청 중...')
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
        refreshToken,
        setToken,
        clearToken,
        loadToken,
        getToken
    }
})
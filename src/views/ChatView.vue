<template>
  <a-layout style="min-height: 100vh;">
    <a-layout-header>
      <div style="color:#fff; font-weight:bold; font-size:24px;">채팅</div>
    </a-layout-header>

    <a-layout style="height: calc(100vh - 64px);">
      <a-layout-sider width="300" theme="light" style="border-right: 1px solid #eee;">
        <div style="padding:20px 16px; border-bottom:1px solid #eee;">
          <a-typography-title :level="4" style="margin:0;">
            채팅방
            <a-badge :count="chatRooms.length" size="small" :offset="[8, -2]" style="background-color: #ff4d4f;" />
          </a-typography-title>
        </div>
        <a-spin :spinning="loading">
          <div v-if="chatRooms.length > 0">
            <a-list-item
                v-for="room in chatRooms"
                :key="room.roomId"
                :class="{ 'ant-list-item-selected': selectedRoomId === room.roomId }"
                style="cursor:pointer; padding:16px;"
                @click="selectRoom(room)"
            >
              <div>
                <div style="font-weight:500;">{{ room.serviceName }}</div>
                <div style="color:#888; font-size:13px; margin-top:2px;">{{ room.createdAt }}</div>
              </div>
            </a-list-item>
          </div>
          <div v-else-if="!loading" style="padding:40px 20px; text-align:center;">
            채팅방이 없습니다.
          </div>
        </a-spin>
      </a-layout-sider>

      <a-layout>
        <a-layout-content v-if="selectedRoom"
                          style="background:#fafafa; display:flex; flex-direction:column; align-items:center;">
          <div style="margin-top:40px; width:100%; max-width:600px; background:#fff; border-radius:16px; box-shadow:0 2px 16px rgba(0,0,0,0.05); min-height:600px; display:flex; flex-direction:column;">
            <div style="border-bottom:1px solid #eee; padding:24px 32px; display:flex; align-items:center;">
              <a-typography-title :level="4" style="margin:0;">{{ selectedRoom.serviceName }}</a-typography-title>
            </div>
            <div ref="messageBox" style="flex:1 1 0; padding:24px 32px; overflow-y:auto;">
              <a-spin :spinning="messagesLoading">
                <div v-if="messagesError" style="color:red;">{{ messagesError }}</div>
                <div v-else-if="messages.length === 0" style="color:#888;">메시지가 없습니다.</div>
                <div v-else>
                  <div
                      v-for="(msg, idx) in messages"
                      :key="msg.createdAt + msg.senderLoginId + idx + msg.message"
                      :style="{textAlign: msg.senderLoginId === senderLoginId ? 'right':'left', marginBottom:'18px'}"
                  >
                    <div>
                      <b>{{ msg.senderLoginId }}</b>
                      <span v-if="msg.leader === 'Y'" style="color:orange; font-size:13px; margin-left:4px;">(파티장)</span>
                    </div>
                    <div style="padding:8px 16px; background:#f6f6f6; border-radius:8px; display:inline-block;">
                      {{ msg.message }}
                    </div>
                    <div style="font-size:12px; color:#aaa;">{{ msg.createdAt }}</div>
                  </div>
                </div>
              </a-spin>
            </div>
            <div style="border-top:1px solid #eee; padding:18px 32px; background:#fafafa;">
              <a-input-search
                  v-model:value="newMessage"
                  placeholder="메시지를 입력하세요"
                  enter-button="전송"
                  :disabled="sending || !connected"
                  @search="sendMessage"
                  size="large"
              />
            </div>
          </div>
        </a-layout-content>
        <a-layout-content v-else
                          style="display:flex; align-items:center; justify-content:center; background:#fafafa;">
          <div style="text-align:center; max-width:400px;">
            <a-typography-title :level="3" style="color:#333; margin-bottom:16px;">채팅방을 선택해주세요</a-typography-title>
            <a-typography-text type="secondary" style="font-size:16px; line-height:1.6;">
              왼쪽에서 채팅방을 선택하여<br />구독 멤버들과 대화를 시작하세요.
            </a-typography-text>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 반응형 데이터
const chatRooms = ref([])
const loading = ref(false)
const error = ref(null)
const selectedRoomId = ref(null)
const messages = ref([])
const messagesLoading = ref(false)
const messagesError = ref(null)
const newMessage = ref('')
const sending = ref(false)
const stompClient = ref(null)
const connected = ref(false)
const subscription = ref(null)
const senderLoginId = ref(null)
const messageBox = ref(null)

// computed
const selectedRoom = computed(() => {
  return chatRooms.value.find(r => r.roomId === selectedRoomId.value) || null
})

// 라이프사이클
onMounted(async () => {
  // 인증 스토어에서 사용자 정보 가져오기
  const authStore = useAuthStore()

  // 먼저 인증 상태를 확인하고 필요하면 갱신
  if (!authStore.isAuthenticated && authStore.getToken()) {
    await authStore.checkAuthStatus()
  }

  // 여러 소스에서 로그인 ID 확인
  const fromStore = authStore.userInfo?.loginId
  const fromLocalStorage = localStorage.getItem('loginId')
  const hasToken = localStorage.getItem('accessToken')

  // 우선순위: 스토어 → localStorage → 기본값
  if (fromStore) {
    senderLoginId.value = fromStore
  } else if (fromLocalStorage) {
    senderLoginId.value = fromLocalStorage
  } else if (hasToken) {
    // 토큰은 있지만 loginId가 없는 경우 - 인증 상태 재확인
    await authStore.checkAuthStatus()

    if (authStore.userInfo?.loginId) {
      senderLoginId.value = authStore.userInfo.loginId
    } else {
      senderLoginId.value = 'unknown_user'
    }
  } else {
    senderLoginId.value = null
  }

  // fetchChatRooms()   
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})

// 메서드들
const fetchChatRooms = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/chat/rooms', { withCredentials: true })
    chatRooms.value = res.data
  } catch (err) {
    error.value = err?.response?.data?.message || '채팅방 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchChatMessages = async (roomId) => {
  messagesLoading.value = true
  try {
    const res = await axios.get(`/api/chat/history/${roomId}`, { withCredentials: true })
    messages.value = res.data
    nextTick(() => scrollToBottom())
  } catch (err) {
    messagesError.value = err?.response?.data?.message || '채팅 내역을 불러오지 못했습니다.'
  } finally {
    messagesLoading.value = false
  }
}

const selectRoom = async (room) => {
  if (selectedRoomId.value === room.roomId && connected.value) return

  selectedRoomId.value = room.roomId
  messages.value = []
  messagesError.value = null
  await fetchChatMessages(room.roomId)
  connectWebsocket(room.roomId)
}

const connectWebsocket = (roomId) => {
  if (stompClient.value && stompClient.value.connected) return

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
  const sockJs = new SockJS(`${API_BASE_URL}/connect`)
  stompClient.value = Stomp.over(sockJs)

  const token = localStorage.getItem('accessToken')
  if (!token) {
    messagesError.value = '인증이 필요합니다. 다시 로그인 해주세요.'
    return
  }

  stompClient.value.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        connected.value = true
        subscription.value = stompClient.value.subscribe(
            `/topic/${roomId}`,
            (message) => {
              const parseMessage = JSON.parse(message.body)
              messages.value.push(parseMessage)
              scrollToBottom()
            },
            { Authorization: `Bearer ${token}` }
        )
      },
      (error) => {
        connected.value = false
        let errMsg = typeof error === "string"
            ? error
            : error?.body || String(error)
        if (errMsg.includes('토큰') || errMsg.includes('권한') || errMsg.includes('인증')) {
          messagesError.value = '인증이 필요합니다. 다시 로그인 해주세요.'
          localStorage.removeItem('accessToken')
        } else {
          messagesError.value = 'WebSocket 연결에 실패했습니다.'
        }
      }
  )
}

const disconnectWebSocket = () => {
  if (subscription.value && subscription.value.unsubscribe) {
    subscription.value.unsubscribe()
    subscription.value = null
  }
  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.disconnect()
    connected.value = false
  }
}

const sendMessage = () => {
  if (newMessage.value.trim() === '') return
  if (!stompClient.value || !stompClient.value.connected) {
    messagesError.value = 'WebSocket 연결이 끊어졌습니다.'
    return
  }
  if (!selectedRoom.value) return

  const token = localStorage.getItem('accessToken')
  if (!token) {
    messagesError.value = '인증이 필요합니다. 다시 로그인 해주세요.'
    return
  }

  const message = {
    senderLoginId: senderLoginId.value,
    message: newMessage.value.trim(),
  }

  stompClient.value.send(
      `/publish/${selectedRoom.value.roomId}`,
      JSON.stringify(message),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
  )
  newMessage.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageBox.value) {
      messageBox.value.scrollTop = messageBox.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.ant-list-item-selected {
  background: #f6f6f6;
  border-left: 4px solid #ff4d4f;
}
</style>
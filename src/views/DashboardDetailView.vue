<template>
  <div class="subscription-detail-container">
    <div class="detail-content">
      <div class="content-container">
        
        <!-- 뒤로가기 버튼 -->
        <div class="back-section">
          <a-button type="text" @click="goBack" class="back-button">
            <LeftOutlined /> 뒤로가기
          </a-button>
        </div>

        <!-- 서비스 상세 정보 -->
        <div class="service-detail-section">
          <div class="service-detail-container">
            
            <!-- 왼쪽: 서비스 정보 및 입력 폼 -->
            <div class="left-section">
              
              <!-- 구독 기간 설정 -->
              <div class="duration-section">
                <div class="duration-header">
                  <h3>구독 기간:</h3>
                  <span class="duration-value">{{ durationMonth }}개월 </span>
                </div>
                <a-slider
                  v-model:value="durationMonth"
                  :min="1"
                  :max="12"
                  :marks="durationMarks"
                  :disabled="serviceData.status === '파티원'"
                  @afterChange="onDurationChange"
                />
              </div>

              <!-- 구독 가격 정보 -->
              <div class="price-info">
                <div class="price-row">
                  <span class="price-label">슬롯당 구독 가격:</span>
                  <span class="price-value">{{ Number(serviceData.price ?? 0).toLocaleString() }}원 <span class="price-period">/ 월</span></span>
                </div>
              </div>

              <!-- 슬롯 판매 상태 -->
              <div class="slot-status">
                <div class="slot-header">
                  <span class="slot-text">슬롯 판매 상태:</span>
                  <span class="slot-count">{{ serviceData.currentMembers }}/{{ serviceData.maxMembers }}</span>
                  <span class="slot-label">공용 가입됨</span>
                </div>
                
                <!-- 참여자 및 빈 슬롯 리스트 -->
                <div class="members-list">
                  <!-- 실제 참여자들 -->
                  <div v-for="member in members" :key="member.id" class="member-item">
                    <a-avatar :size="32" :style="{ backgroundColor: member.color }">
                      {{ member.name.charAt(0) }}
                    </a-avatar>
                    <span class="member-name">{{ member.name }}</span>
                    <a-tag v-if="member.isOwner" color="orange">{{ member.role }}</a-tag>
                    <div class="spacer"></div>
                    <span class="member-joined">{{ member.role == '파티장' ? '생성' : '가입' }}/{{ formatDate(member.createdAt) }}</span>
                  </div>

                  <!-- 빈 슬롯들 (예약됨, 무료 등) -->
                  <div v-for="slot in emptySlots" :key="slot.id" class="member-item empty-slot">
                    <div class="slot-icon">
                      <component :is="slot.icon" class="slot-icon-inner" />
                    </div>
                    <div class="slot-info">
                      <span class="slot-title">{{ slot.title }}</span>
                      <span class="slot-description">{{ slot.description }}</span>
                    </div>
                  </div>
                </div>  
              </div>

            </div>

            <!-- 오른쪽: 계정 입력 및 액션 -->
            <div class="right-section">
              <div class="service-header">
                <div class="service-icon">
                  <img :src="serviceData.platformImageUrl" :alt="serviceData.name" />
                </div>
                <h2 class="service-name">{{ serviceData.name }}</h2>
              </div>

               <!-- 저장된 계정 정보 표시 -->
              <div class="account-display">
                <div class="account-group">
                  <!-- 일반 표시 모드 -->
                  <template v-if="!isEditing">
                    <div class="account-item">
                      <MailOutlined class="account-icon" />
                      <div class="account-info">
                        <span class="account-label">이메일</span>
                        <span class="account-value">{{ serviceData.email }}</span>
                      </div>
                    </div>

                    <div class="account-item">
                      <LockOutlined class="account-icon" />
                      <div class="account-info">
                        <span class="account-label">비밀번호</span>
                        <span class="account-value">{{ serviceData.password }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- 편집 모드 -->
                  <template v-else>
                    <div class="account-item editing">
                      <MailOutlined class="account-icon" />
                      <div class="account-info">
                        <span class="account-label">이메일</span>
                        <a-input v-model:value="editingAccount.email" placeholder="이메일을 입력하세요" class="account-input" />
                      </div>
                    </div>

                    <div class="account-item editing">
                      <LockOutlined class="account-icon" />
                      <div class="account-info">
                        <span class="account-label">비밀번호</span>
                        <a-input-password v-model:value="editingAccount.password" placeholder="비밀번호를 입력하세요"
                          class="account-input" />
                      </div>
                    </div>
                  </template>
                </div>

                <!-- 버튼 영역 -->
                
                <div v-if="!isEditing && isLeader">
                  <a-button type="default" block class="account-edit-btn" @click="editAccountInfo">
                    <EditOutlined /> 계정 정보 수정
                  </a-button>
                </div>

                <div v-else-if="isEditing" class="edit-buttons">
                  <a-button type="primary" class="save-btn" @click="saveAccountInfo">
                    <SaveOutlined /> 저장
                  </a-button>
                  <a-button type="default" class="cancel-btn" @click="cancelEdit">
                    <CloseOutlined /> 취소
                  </a-button>
                </div>
              </div>

              <!-- 액션 버튼들 -->
              <div class="action-buttons">
                <a-button 
                  type="default" 
                  block 
                  class="chat-button"
                  @click="joinGroupChat"
                >
                  그룹 채팅에 참여
                </a-button>

                <a-button 
                  type="primary" 
                  block 
                  class="stop-sharing-btn"
                  @click="serviceData.status === '파티장' ? stopSharing() : outSharing()"
                >
                   {{ serviceData.status == '파티장' ? '삭제' : '나가기' }} 
                </a-button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { 
  LeftOutlined, 
  RightOutlined, 
  MailOutlined, 
  LockOutlined, 
  UserOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import axios from 'axios'
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginId = computed(() => authStore.userInfo?.loginId)
const postId = route.params.id;
const afterChangeLock = ref(false);
// 편집 모드 상태 추가
const isEditing = ref(false)
const isLeader = computed(() => serviceData.value.status === '파티장')
// 편집용 임시 데이터
const editingAccount = reactive({
  email: '',
  password: ''
})

// 구독 기간
const durationMonth = ref(6)
const durationMarks = {
  1: '1개월',
  3: '3개월',
  6: '6개월',
  12: '12개월'
}

// 예약 상태 관리 - 이 부분이 누락되어 있었음
const reservedSlots = ref([
  // {
  //   id: 'reserved-1',
  //   reservedBy: 'user123',
  //   reservedAt: new Date(),
  //   status: 'reserved'
  // }
])


// 서비스 데이터 - 예약된 슬롯도 포함해서 카운트
const serviceData = ref({})

  // id: 1,
  // name: 'Peacock 플러스',
  // price: 4469,
  // icon: 'https://logos-world.net/wp-content/uploads/2021/08/Peacock-Logo.png',
  // currentMembers: 1 + reservedSlots.value.length, // 파티장 1 + 예약됨 1 = 2
//})

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/post/myPost/${postId}`, { params: { loginId: loginId.value } }
    );
    const item = response.data; 
    console.log('item:', item);
      if (!item) {
      message.error('상세 데이터를 찾을 수 없습니다.');
      return; // 아래 코드 실행 중단
    }
    serviceData.value = {
      id: item.postId,
      name: item.platformName,
      price:  item.price / item.partySize,
      period: '개월',
      description: item.description,
      icon: item.iconUrl,
      currentMembers: item.currentCount + reservedSlots.value.length,
      maxMembers: item.partySize,
      email: item.hostId,
      password : item.hostPwd,
      status: item.isExpired === 'Y' ? '만료됨'
        : (item.isOwner === 'Y' ? '파티장' : '파티원'),
      category: item.isExpired === 'Y' ? 'expired' : 'activity',
      type: item.isOwner === 'Y' ? 'sharing' : 'my',
      platformImageUrl: item.platformImageUrl
    };

    editingAccount.email = serviceData.value.email
    editingAccount.password = serviceData.value.password
    durationMonth.value = item.durationMonth;
    originalDuration.value = item.durationMonth;

    members.value = item.members.map((member) => ({
        id: member.memberId,
        name: member.nickName,
        color: '#52c41a',
        isOwner: member.isOwner,
        role: member.isOwner === 'Y' ? '파티장' : '파티원',
        createdAt : member.createdAt
    }));
    durationMonth.value = item.durationMonth;
    
    console.log('구독 데이터 불러옴', serviceData.value);
  } catch (error) {
    console.error('구독 데이터 요청 실패:', error);
  }
});

// 멤버 목록 (파티장만)
const members = ref([])
const originalDuration = ref(durationMonth.value);
const onDurationChange = (value) => {
   if (afterChangeLock.value) return; 

  afterChangeLock.value = true;
  setTimeout(() => {
    afterChangeLock.value = false;
  }, 300);
  Modal.confirm({
    title: '구독 기간을 변경하시겠습니까?',
    content: `${originalDuration.value}개월 → ${value}개월`,
    okText: '네',
    cancelText: '아니오',
    async onOk() {
      await axios.post('http://localhost:8080/post/update', {
      postId: postId,
      loginId: loginId.value,
      durationMonth : value
    });
      message.success('구독 기간이 변경되었습니다.');
      originalDuration.value = value;
    },
    onCancel() {
      durationMonth.value = originalDuration.value; // 원래 값으로 복원
    }
  });
}

const editAccountInfo = () => {
  isEditing.value = true
  // 현재 값으로 편집 데이터 초기화
  editingAccount.email = serviceData.value.email
  editingAccount.password = serviceData.value.password
}

const cancelEdit = () => {
  isEditing.value = false
  // 원래 값으로 되돌리기
  editingAccount.email = serviceData.value.email
  editingAccount.password = serviceData.value.password
}

const saveAccountInfo = async () => {
  try {
    // 입력 값 검증
    if (!editingAccount.email.trim()) {
      message.error('이메일을 입력해주세요.')
      return
    }
    if (!editingAccount.password.trim()) {
      message.error('비밀번호를 입력해주세요.')
      return
    }

    // API 호출하여 계정 정보 업데이트
    await axios.post('http://localhost:8080/post/update', {
      postId: postId,
      loginId: loginId.value,
      email: editingAccount.email,
      password: editingAccount.password
    });

    // 성공 시 serviceData 업데이트
    serviceData.value.email = editingAccount.email
    serviceData.value.password = editingAccount.password
    
    isEditing.value = false
    message.success('계정 정보가 성공적으로 수정되었습니다.')
  } catch (error) {
    console.error('계정 정보 수정 실패:', error)
    message.error('계정 정보 수정에 실패했습니다.')
  }
}

// 빈 슬롯 계산 로직 - 이 부분이 제대로 구현되지 않았음
const emptySlots = computed(() => {
  const totalOccupied = members.value.length + reservedSlots.value.length
  const remainingSlots = serviceData.value.maxMembers - totalOccupied
  const slots = []
  
  // 예약된 슬롯들 추가
  reservedSlots.value.forEach((reservation) => {
    slots.push({
      id: reservation.id,
      title: '예약됨',
      description: '접근 해제 후 사용',
      icon: 'LockOutlined',
      type: 'reserved',
      reservationData: reservation
    })
  })
  
  // 나머지 무료 슬롯들 추가
  for (let i = 0; i < remainingSlots; i++) {
    slots.push({
      id: `free-${i + 1}`,
      title: '무료',
      description: '가입 대기 중',
      // icon: 'UserOutlined',
      type: 'free'
    })
  }
  
  return slots
})

// 나머지 함수들 구현
const handleSlotAction = (slot) => {
  if (slot.type === 'reserved') {
    Modal.confirm({
      title: '예약을 해제하시겠습니까?',
      content: '예약이 해제되면 다른 사용자가 이 슬롯을 사용할 수 있습니다.',
      okText: '해제',
      cancelText: '취소',
      onOk() {
        cancelReservation(slot.id)
      }
    })
  } else if (slot.type === 'free') {
    Modal.confirm({
      title: '친구를 초대하시겠습니까?',
      content: '초대하면 이 슬롯이 예약됩니다.',
      okText: '초대',
      cancelText: '취소',
      onOk() {
        inviteFriend()
      }
    })
  }
}

const cancelReservation = (reservationId) => {
  const index = reservedSlots.value.findIndex(slot => slot.id === reservationId)
  if (index !== -1) {
    reservedSlots.value.splice(index, 1)
    serviceData.value.currentMembers = members.value.length + reservedSlots.value.length
    message.success('예약이 해제되었습니다.')
  }
}

const inviteFriend = () => {
  const newReservation = {
    id: `reserved-${Date.now()}`,
    reservedBy: 'invited-user',
    reservedAt: new Date(),
    status: 'reserved'
  }
  
  reservedSlots.value.push(newReservation)
  serviceData.value.currentMembers = members.value.length + reservedSlots.value.length
  
  message.success('친구 초대가 완료되었습니다. 슬롯이 예약되었습니다.')
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

const goBack = () => {
  router.go(-1)
}

const joinGroupChat = async () => {
  try {
    // postId로 roomId 찾기
    const response = await axios.get(`http://localhost:8080/api/chat/room-by-post/${postId}`)
    const roomId = response.data.chatRoomId
    
    // roomId로 ChatView 이동
    router.push(`/chat/${roomId}`)
    message.info('그룹 채팅에 참여했습니다.')
  } catch (error) {
    console.error('채팅방 접근 실패:', error)
    message.error('채팅방에 접근할 수 없습니다.')
  }
}

const stopSharing = () => {
  Modal.confirm({
    title: '파티를 삭제하시겠습니까?',
    content: '파티를 삭제하시면 파티가 해제됩니다.',
    okText: '삭제',
    cancelText: '취소',
    async onOk() {
      try {
        await axios.post(`http://localhost:8080/post/leaveMyPost`, {
          postId: serviceData.value.id,
          loginId: loginId.value
        });
        message.success('파티가 삭제되었습니다.');
        router.push('/dashboard'); 
      } catch (e) {
        message.error('삭제에 실패했습니다.');
      }
    }
  })
}

const outSharing = () => {
  Modal.confirm({
    title: '파티를 나가겠습니까?',
    content: '파티를 나가시면 더 이상 구독 할 수 없습니다.',
    okText: '나가기',
    cancelText: '취소',
    async onOk() {
      try {
        await axios.post(`http://localhost:8080/post/leaveMyPost`, {
          postId: serviceData.value.id,
          loginId: loginId.value
        });
        message.success('파티가 삭제되었습니다.');
        router.push('/dashboard'); 
      } catch (e) {
        message.error('삭제에 실패했습니다.');
      }
    }
  })
}
</script>

<style scoped>
/* 완전한 CSS 스타일 */
.subscription-detail-container {
  background: #fafafa;
  min-height: 100vh;
}

.detail-content {
  background: #fafafa;
  padding: 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 40px;
}

.readonly-slider {
  pointer-events: none !important;  /* 클릭/드래그 완전 차단 */
  user-select: none !important;     /* 텍스트 선택 차단 */
}

.readonly-slider .ant-slider-handle {
  cursor: default !important;       /* 커서 모양 일반으로 */
}

/* 뒤로가기 섹션 */
.back-section {
  margin-bottom: 24px;
}

.back-button {
  color: #333;
  padding: 0;
  height: auto;
  font-size: 16px;
}

.back-button:hover {
  color: #ff7875;
}

/* 서비스 상세 섹션 */
.service-detail-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.service-detail-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  min-height: 600px;
}

/* 왼쪽 섹션 */
.left-section {
  padding: 32px;
  border-right: 1px solid #f0f0f0;
}

/* 구독 기간 섹션 */
.duration-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #d6e4ff;
}

.duration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.duration-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.duration-value {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
}

.duration-slider {
  margin-top: 8px;
}

/* 가격 정보 */
.price-info {
  margin-bottom: 24px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.price-label {
  font-size: 16px;
  color: #666;
}

.price-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.price-period {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

/* 슬롯 상태 */
.slot-status {
  margin-bottom: 32px;
}

.slot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.slot-text {
  font-size: 16px;
  color: #333;
}

.slot-count {
  font-size: 18px;
  font-weight: bold;
  color: #ff9500;
}

.slot-label {
  font-size: 14px;
  color: #666;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}


.member-item.empty-slot {
  background: #f9f9f9;
  border: 1px solid #f0f0f0;
}

.member-item.empty-slot.clickable {
  cursor: pointer;
}

.member-item.empty-slot.clickable:hover {
  background: #f0f0f0;
  border-color: #d9d9d9;
}

.spacer {
  flex: 1; 
}

.member-joined {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.slot-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.slot-icon-inner {
  font-size: 16px;
  color: #666;
}

.slot-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.slot-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.slot-description {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-name {
  font-size: 14px;
  color: #333;
}

/* 오른쪽 섹션 */
.right-section {
  padding: 32px;
  background: #fafafa;
}

.service-header {
  text-align: center;
  margin-bottom: 32px;
}

.service-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-name {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 계정 정보 */
.account-display {
  margin-bottom: 24px;
}

.account-group {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.account-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.account-icon {
  font-size: 16px;
  color: #666;
  width: 20px;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.account-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.account-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.account-edit-btn {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #d9d9d9;
}

.account-edit-btn:hover {
  border-color: #ff7875;
  color: #ff7875;
}

/* 편집 모드 스타일 */
.account-item.editing {
  align-items: flex-start;
  padding: 16px 0;
}

.account-input {
  margin-top: 4px;
}

.edit-buttons {
  display: flex;
  gap: 8px;
}

.save-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
}

.cancel-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
}

.account-item.editing .account-info {
  width: 100%;
}

/* 편집 중일 때 입력 필드 스타일 */
.account-input.ant-input {
  border-radius: 6px;
  font-size: 14px;
}

.account-input.ant-input:focus {
  border-color: #ff7875;
  box-shadow: 0 0 0 2px rgba(255, 120, 117, 0.2);
}


/* 액션 버튼들 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.chat-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  background: #ffc53d;
  border-color: #ffc53d;
  color: white;
}

.chat-button:hover {
  background: #ffb300;
  border-color: #ffb300;
}

.stop-sharing-btn {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  background: #ff7875;
  border-color: #ff7875;
  color: white;
}

.stop-sharing-btn:hover {
  background: #ff9c99;
  border-color: #ff9c99;
}

/* 반응형 */
@media (max-width: 1024px) {
  .service-detail-container {
    grid-template-columns: 1fr;
  }
  
  .left-section {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .content-container {
    padding: 16px 20px;
  }
}
</style>

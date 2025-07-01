<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="content-container">
        <!-- 메인 탭 섹션 -->
        <div class="main-tab-section">
          <div class="main-tab-container">
            <div class="dashboard-toolbar">
              <div class="main-tabs">
                <a-button
                  class="filter-button"
                  :class="{ 'active-main-tab': tabType === 'owner' }"
                  @click="setTab('owner')"
                >
                  파티장
                </a-button>
                <a-button
                  class="filter-button"
                  :class="{ 'active-main-tab': tabType === 'member' }"
                  @click="setTab('member')"
                >
                  파티원
                </a-button>
              </div>

              <div class="filter-section">
                <!-- 상태 필터 -->
                <div class="status-tabs">
                  <a-button
                    :class="{ 'active-status': statusFilter === 'active' }"
                    @click="setStatusFilter('active')"
                    class="filter-tab"
                  >
                    활성
                  </a-button>
                  <a-button
                    :class="{ 'active-status': statusFilter === 'expired' }"
                    @click="setStatusFilter('expired')"
                    class="filter-tab"
                  >
                    만료
                  </a-button>
                </div>

                <!-- 정렬 필터 -->
                <div class="filter-tabs">
                  <a-button
                    :class="{ 'active-sort': sortBy === 'platformName' }"
                    @click="toggleSort('platformName')"
                    class="filter-tab"
                  >
                    이름순
                    <span v-if="sortBy === 'platformName'">{{
                        sortOrder === "asc" ? "▲" : "▼"
                      }}</span>
                  </a-button>
                  <a-button
                    :class="{ 'active-sort': sortBy === 'createdAt' }"
                    @click="toggleSort('createdAt')"
                    class="filter-tab"
                  >
                    최신순
                    <span v-if="sortBy === 'createdAt'">{{
                        sortOrder === "asc" ? "▲" : "▼"
                      }}</span>
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 서비스 카드들 -->
        <div class="services-section">
          <div class="services-container">
            <a-row :gutter="[32, 32]" justify="start">
              <a-col
                :xs="24"
                :sm="12"
                :lg="8"
                v-for="service in filteredPosts"
                :key="service.id"
              >
                <div class="service-card">
                  <div class="service-header">
                    <div class="service-icon">
                      <img
                        :src="service.platformImageUrl"
                        :alt="service.name"
                      />
                    </div>
                    <div class="service-info">
                      <h3 class="service-name">{{ service.name }} #{{ service.id }}</h3>
                      <p class="service-price">
                        {{ service.price.toLocaleString() }}원
                        <span class="price-period">/ {{ service.period }}</span>
                      </p>
                      <p class="service-description">
                        {{ service.description }}
                      </p>
                    </div>
                    <div class="registration-time">
                      {{ getTimeAgo(service.createdAt) }}
                    </div>
                  </div>

                  <div class="service-progress">
                    <div class="progress-info">
                      <span class="progress-text"
                      >{{ service.current }}/{{ service.total }}</span
                      >
                      <span class="status-badge" :class="{ 'expired': service.expired === 'expired' }">
                        {{ service.status }}
                      </span>
                    </div>
                    <a-progress
                      :percent="(service.current / service.total) * 100"
                      :show-info="false"
                      :stroke-color="service.expired === 'expired' ? '#d9d9d9' : '#ff7875'"
                      class="progress-bar"
                    />
                    <div class="time-remaining">
                      <a-avatar size="small" style="background-color: #69b7ff">
                        <template #icon>
                          <ClockCircleOutlined />
                        </template>
                      </a-avatar>
                    </div>
                  </div>

                  <div class="service-actions">
                    <a-button
                      type="primary"
                      block
                      class="join-button"
                      :class="{ 'expired-button': service.expired === 'expired' }"
                      @click="joinService(service)"
                      :disabled="service.expired === 'expired'"
                    >
                      구독 관리 &gt;
                    </a-button>
                  </div>
                </div>
              </a-col>
            </a-row>
            <!-- 페이징 네비게이션 -->
            <div class="pagination">
              <a-button
                v-for="pageNum in totalPages"
                :key="pageNum"
                @click="changePage(pageNum - 1)"
                :class="{ 'active-page': currentPage === pageNum - 1 }"
              >
                {{ pageNum }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ClockCircleOutlined } from "@ant-design/icons-vue";
import axios from "axios";

// 상태 변수
const sortBy = ref("createdAt"); // 'platformName' or 'createdAt'
const sortOrder = ref("desc"); // 'asc' or 'desc'
const tabType = ref("owner"); // 'owner' (파티장) / 'member' (파티원)
const statusFilter = ref("active"); // 'active' (활성) / 'expired' (만료)
const postsOwner = ref([]);
const postsMember = ref([]);
const currentPageOwner = ref(0);
const currentPageMember = ref(0);
const totalPagesOwner = ref(1);
const totalPagesMember = ref(1);
const router = useRouter();

// 정렬 버튼 클릭 핸들러
function toggleSort(type) {
  if (sortBy.value === type) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = type;
    sortOrder.value = "desc";
  }
  fetchPosts();
}

// 탭 변경 핸들러
function setTab(type) {
  tabType.value = type;
  fetchPosts();
}

// 상태 필터 변경 핸들러
function setStatusFilter(status) {
  statusFilter.value = status;
  // 페이지를 0으로 리셋
  if (tabType.value === "owner") {
    currentPageOwner.value = 0;
  } else {
    currentPageMember.value = 0;
  }
  fetchPosts();
}

// 페이지 변경
function changePage(newPage) {
  if (tabType.value === "owner") {
    currentPageOwner.value = newPage;
  } else {
    currentPageMember.value = newPage;
  }
  fetchPosts();
}

// 데이터 조회 (탭/정렬/페이지/상태 모두 반영)
async function fetchPosts() {
  const page =
    tabType.value === "owner"
      ? currentPageOwner.value
      : currentPageMember.value;
  const apiUrl =
    tabType.value === "owner"
      ? "/api/dashboard/my-parties"
      : "/api/dashboard/participated-parties";
  try {
    const response = await axios.get(apiUrl, {
      params: {
        page,
        sortField: sortBy.value,
        sortDirection: sortOrder.value,
        statusFilter: statusFilter.value, // 상태 필터 추가
      },
    });
    const posts = response.data.content.map((item) => ({
      id: item.postId,
      name: item.platformName,
      price: item.price,
      period: "월",
      description: item.description || "",
      current: item.currentCount,
      total: item.partySize,
      status: tabType.value === "owner" ? "파티장" : "파티원",
      icon: item.iconUrl,
      expired: item.isExpired === "Y" ? "expired" : "active",
      platformImageUrl: item.platformImageUrl,
      createdAt: item.createdAt,
    }));
    if (tabType.value === "owner") {
      postsOwner.value = posts;
      totalPagesOwner.value = response.data.totalPages;
    } else {
      postsMember.value = posts;
      totalPagesMember.value = response.data.totalPages;
    }
  } catch (e) {
    console.error('데이터 조회 실패:', e);
  }
}

// 실제 보여줄 리스트
const filteredPosts = computed(() => {
  return tabType.value === "owner" ? postsOwner.value : postsMember.value;
});
const totalPages = computed(() => {
  return tabType.value === "owner"
    ? totalPagesOwner.value
    : totalPagesMember.value;
});
const currentPage = computed(() => {
  return tabType.value === "owner"
    ? currentPageOwner.value
    : currentPageMember.value;
});

// 서비스 참여
const joinService = (service) => {
  router.push(`/dashboard/${service.id}`);
};

// 날짜 차이를 계산
const getTimeAgo = (createdAt) => {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  const timeDiff = currentDate - createdDate; // 밀리초 단위 차이

  // 개월
  const monthsAgo =
    currentDate.getMonth() -
    createdDate.getMonth() +
    12 * (currentDate.getFullYear() - createdDate.getFullYear());
  if (monthsAgo > 0) {
    return `${monthsAgo}개월 전`;
  }

  // 일
  const daysAgo = Math.floor(timeDiff / (1000 * 3600 * 24)); // 밀리초를 일 단위로 변환
  if (daysAgo > 0) {
    return `${daysAgo}일 전`;
  }

  // 시간
  const hoursAgo = Math.floor(timeDiff / (1000 * 3600)); // 밀리초를 시간 단위로 변환
  if (hoursAgo > 0) {
    return `${hoursAgo}시간 전`;
  }

  // 분
  const minutesAgo = Math.floor(timeDiff / (1000 * 60)); // 밀리초를 분 단위로 변환
  if (minutesAgo > 0) {
    return `${minutesAgo}분 전`;
  }

  return "방금 전";
};

// 최초 로딩
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.dashboard-container {
  background: #fafafa;
}

.dashboard-content {
  background: #fafafa;
  padding: 0;
}

.content-container {
  /* 헤더와 푸터는 상위 레이아웃에서 처리 */
}

/* 메인 탭 섹션 */
.main-tab-section {
  background: white;
  padding: 20px 0 16px;
}

.main-tab-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.main-tabs {
  display: flex;
  gap: 8px;
}

.active-main-tab {
  color: #ff7875 !important;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.status-tabs {
  display: flex;
  gap: 8px;
}

.active-status {
  background-color: #52c41a !important;
  color: white !important;
  border-color: #52c41a !important;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  padding: 6px 16px;
  height: auto;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #666;
}

.filter-tab:hover {
  border-color: #ff7875;
  color: #ff7875;
}

.active-sort {
  background-color: #ff7875 !important;
  color: white !important;
  border-color: #ff7875 !important;
}

.services-section {
  padding: 32px 0 64px;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.registration-time {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.service-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.service-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-info {
  flex: 1;
}

.service-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.service-price {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.price-period {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.service-description {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.service-progress {
  margin-bottom: 20px;
  flex: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 18px;
  font-weight: bold;
  color: #ff7875;
}

.status-badge {
  background: #f6f6f6;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.status-badge.expired {
  background: #fff2f0;
  color: #ff4d4f;
}

.progress-bar {
  margin-bottom: 12px;
}

.time-remaining {
  display: flex;
  justify-content: flex-end;
}

.service-actions {
  margin-top: auto;
}

.join-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  background: #ff7875;
  border-color: #ff7875;
  color: white;
  transition: all 0.3s ease;
}

.join-button:hover:not(:disabled) {
  background: #ff9c99;
  border-color: #ff9c99;
  transform: translateY(-1px);
}

.join-button:disabled,
.join-button.expired-button {
  background: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #bfbfbf !important;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
}

.pagination button {
  min-width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
}

.pagination button.active-page {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.dashboard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 40px 0 40px;
  background: white;
}

.filter-button {
  width: 120px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #f0f0f0;
  color: #333333;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f0f0f0;
  margin-right: 8px;
}

.filter-button:hover {
  background-color: #ff7875;
  color: #fff;
  border-color: #ff7875;
}

.active-main-tab {
  background-color: #ff7875 !important;
  color: #fff !important;
  border-color: #ff7875 !important;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .main-tab-container,
  .filter-container,
  .services-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .dashboard-toolbar {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    padding: 0 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .services-container {
    padding: 0 16px;
  }

  .service-card {
    padding: 20px;
  }
}

/* 3개 카드가 가로로 꽉 차도록 조정 */
@media (min-width: 992px) {
  .ant-col-lg-8 {
    width: 33.333333% !important;
    flex: 0 0 33.333333% !important;
  }
}
</style>
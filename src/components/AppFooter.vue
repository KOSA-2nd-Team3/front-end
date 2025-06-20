<template>
  <a-layout-footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- 좌측 브랜드 정보 -->
        <div class="footer-brand">
          <h3 class="footer-logo">OTTMOA</h3>
          <p class="footer-description">
            함께하는 구독 서비스의 새로운 경험
          </p>
        </div>

        <!-- 중앙 링크 섹션 -->
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">서비스</h4>
            <ul class="link-list">
              <li><a href="#" @click.prevent>구독 공유</a></li>
              <li><a href="#" @click.prevent>구독 관리</a></li>
              <li><a href="#" @click.prevent>대시보드</a></li>
              <li><a href="#" @click.prevent>커뮤니티</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4 class="link-title">고객지원</h4>
            <ul class="link-list">
              <li><a href="#" @click.prevent>자주 묻는 질문</a></li>
              <li><a href="#" @click.prevent>고객센터</a></li>
              <li><a href="#" @click.prevent>서비스 가이드</a></li>
              <li><a href="#" @click.prevent>문의하기</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4 class="link-title">회사</h4>
            <ul class="link-list">
              <li><a href="#" @click.prevent>회사소개</a></li>
              <li><a href="#" @click.prevent>개인정보처리방침</a></li>
              <li><a href="#" @click.prevent>이용약관</a></li>
              <li><a href="#" @click.prevent>공지사항</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 하단 저작권 정보 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>Copyright © 2025 OTTMOA. All Rights Reserved.</p>
        </div>
        <div class="social-links">
          <a href="#" @click.prevent class="social-link">
            <FacebookOutlined />
          </a>
          <a href="#" @click.prevent class="social-link">
            <TwitterOutlined />
          </a>
          <a href="#" @click.prevent class="social-link">
            <InstagramOutlined />
          </a>
          <a href="#" @click.prevent class="social-link">
            <YoutubeOutlined />
          </a>
        </div>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup>
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined
} from '@ant-design/icons-vue'
</script>

<style scoped>
.app-footer {
  background: #69b7ff;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.footer-content {
  padding: 48px 0 32px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.footer-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.link-group {

}

.link-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 8px;
}

.link-list a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link-list a:hover {
  color: white;
}

.footer-bottom {
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .footer-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .footer-container {
    padding: 0 16px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 0 24px;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
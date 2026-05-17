<template>
  <el-container class="chat-layout">
    <ChatSidebar />

    <el-container class="chat-main">
      <el-header class="chat-header">
        <div>
          <p class="chat-eyebrow">AI Assistant</p>
          <h1>{{ activeConversation?.title || '新的会话' }}</h1>
        </div>
      </el-header>

      <el-main class="chat-content">
        <ChatWindow />
      </el-main>

      <el-footer class="chat-footer">
        <MessageInput />
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import { useConversationStore } from '@/stores/conversation'
import ChatSidebar from './ChatSidebar.vue'
import ChatWindow from './ChatWindow.vue'
import MessageInput from './MessageInput.vue'

const conversationStore = useConversationStore()
const { activeConversation } = storeToRefs(conversationStore)
</script>

<style scoped>
.chat-layout {
  height: 100vh;
  min-width: 900px;
  background: #f5f7fb;
}

.chat-main {
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  height: 72px;
  padding: 0 28px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.chat-header h1 {
  margin: 2px 0 0;
  color: #111827;
  font-size: 20px;
  font-weight: 650;
}

.chat-eyebrow {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.chat-content {
  padding: 0;
  overflow: hidden;
}

.chat-footer {
  height: auto;
  padding: 16px 28px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}
</style>

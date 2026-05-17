<template>
  <el-aside class="chat-sidebar" width="280px">
    <div class="sidebar-header">
      <h2>会话</h2>
      <el-button :icon="Plus" circle @click="conversationStore.createConversation" />
    </div>

    <el-scrollbar class="conversation-scroll">
      <button
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-item"
        :class="{ active: conversation.id === activeConversationId }"
        type="button"
        @click="conversationStore.setActiveConversation(conversation.id)"
      >
        <span class="conversation-title">{{ conversation.title }}</span>
        <span class="conversation-time">{{ conversation.updatedAt }}</span>
      </button>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { Plus } from '@element-plus/icons-vue'

import { useConversationStore } from '@/stores/conversation'

const conversationStore = useConversationStore()
const { conversations, activeConversationId } = storeToRefs(conversationStore)
</script>

<style scoped>
.chat-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: #101827;
  color: #ffffff;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
}

.conversation-scroll {
  flex: 1;
  padding: 12px;
}

.conversation-item {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  margin-bottom: 8px;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;
  text-align: left;
}

.conversation-item:hover,
.conversation-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.conversation-title {
  font-size: 14px;
  font-weight: 600;
}

.conversation-time {
  color: #9ca3af;
  font-size: 12px;
}
</style>

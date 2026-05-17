<template>
  <el-scrollbar ref="scrollbarRef" class="chat-window">
    <div ref="messageListRef" class="message-list">
      <div
        v-for="message in activeMessages"
        :key="message.id"
        class="message-row"
        :class="message.role"
      >
        <div class="message-bubble">
          <AiMarkdown
            v-if="message.role === 'assistant' && message.content"
            :content="message.content"
            :streaming="isStreaming && message.id === lastMessageId"
          />
          <span v-else-if="message.content">{{ message.content }}</span>
          <span v-else class="typing-cursor" />
        </div>
      </div>

      <el-empty v-if="activeMessages.length === 0" description="当前会话还没有消息" />
    </div>
  </el-scrollbar>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useConversationStore } from '@/stores/conversation'
import AiMarkdown from './AiMarkdown.vue'

const conversationStore = useConversationStore()
const { activeMessages, isStreaming } = storeToRefs(conversationStore)
const scrollbarRef = ref(null)
const messageListRef = ref(null)
const lastMessageId = computed(() => activeMessages.value.at(-1)?.id)

async function scrollToBottom() {
  await nextTick()

  if (!messageListRef.value) {
    return
  }

  scrollbarRef.value?.setScrollTop(messageListRef.value.scrollHeight)
}

watch(activeMessages, scrollToBottom, {
  deep: true,
  flush: 'post',
})
</script>

<style scoped>
.chat-window {
  height: 100%;
}

.message-list {
  min-height: calc(100vh - 176px);
  padding: 28px;
}

.message-row {
  display: flex;
  margin-bottom: 16px;
}

.message-row.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 720px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  line-height: 1.7;
  white-space: pre-wrap;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.message-row.assistant .message-bubble {
  min-width: 0;
}

.message-row.user .message-bubble {
  background: #2563eb;
  color: #ffffff;
}

@media (prefers-color-scheme: dark) {
  .message-row.assistant .message-bubble {
    background: #111827;
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  }
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  border-radius: 999px;
  background: #9ca3af;
  animation: cursor-blink 0.9s ease-in-out infinite;
  vertical-align: -3px;
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 0.25;
  }

  50% {
    opacity: 1;
  }
}
</style>

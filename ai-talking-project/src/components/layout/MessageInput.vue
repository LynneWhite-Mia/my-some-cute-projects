<template>
  <div class="message-input">
    <el-input
      v-model="draft"
      :autosize="{ minRows: 2, maxRows: 5 }"
      :disabled="isStreaming"
      placeholder="输入消息..."
      resize="none"
      type="textarea"
      @keydown.enter.exact.prevent="handleSend"
    />
    <el-button
      v-if="isStreaming"
      :icon="Close"
      plain
      type="danger"
      @click="conversationStore.abortStreaming"
    >
      中断
    </el-button>
    <el-button v-else :disabled="!draft.trim()" :icon="Promotion" type="primary" @click="handleSend">
      发送
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Close, Promotion } from '@element-plus/icons-vue'

import { useConversationStore } from '@/stores/conversation'

const conversationStore = useConversationStore()
const { isStreaming } = storeToRefs(conversationStore)
const draft = ref('')

async function handleSend() {
  const content = draft.value

  if (!content.trim() || isStreaming.value) {
    return
  }

  draft.value = ''
  await conversationStore.sendMessage(content)
}
</script>

<style scoped>
.message-input {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 12px;
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 8px;
}

.message-input .el-button {
  height: 40px;
}
</style>

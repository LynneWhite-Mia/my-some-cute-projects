import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const CHAT_STREAM_URL = import.meta.env.VITE_CHAT_STREAM_URL || '/api/chat/stream'
const TYPEWRITER_DELAY = 24

const defaultConversations = [
  {
    id: 'conversation-1',
    title: '新的会话',
    updatedAt: '刚刚',
    messages: [
      {
        id: 'message-1',
        role: 'assistant',
        content: '你好，我是你的 AI 聊天助手。',
      },
    ],
  },
]

function createMessage(role, content = '') {
  return {
    id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function extractSsePayload(line) {
  if (!line.startsWith('data:')) {
    return ''
  }

  return line.slice(5).trimStart()
}

function extractContent(payload) {
  if (!payload || payload === '[DONE]') {
    return ''
  }

  try {
    const data = JSON.parse(payload)

    return (
      data.content ??
      data.delta ??
      data.message ??
      data.choices?.[0]?.delta?.content ??
      data.choices?.[0]?.message?.content ??
      ''
    )
  } catch {
    return payload
  }
}

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref(defaultConversations)
  const activeConversationId = ref(defaultConversations[0].id)
  const isStreaming = ref(false)
  const abortController = ref(null)
  const pendingText = ref('')
  const activeAssistantMessageId = ref('')

  const activeConversation = computed(() =>
    conversations.value.find((item) => item.id === activeConversationId.value),
  )

  const activeMessages = computed(() => activeConversation.value?.messages ?? [])

  function setActiveConversation(id) {
    activeConversationId.value = id
  }

  function createConversation() {
    const id = `conversation-${Date.now()}`

    conversations.value.unshift({
      id,
      title: '新的会话',
      updatedAt: '刚刚',
      messages: [],
    })

    activeConversationId.value = id
  }

  function appendMessage(message) {
    activeConversation.value?.messages.push(message)
  }

  function updateMessageContent(messageId, content) {
    const message = activeMessages.value.find((item) => item.id === messageId)

    if (message) {
      message.content = content
    }
  }

  function appendAssistantContent(messageId, content) {
    const message = activeMessages.value.find((item) => item.id === messageId)

    if (message) {
      message.content += content
    }
  }

  async function flushPendingText(messageId) {
    while (pendingText.value && activeAssistantMessageId.value === messageId) {
      if (abortController.value?.signal.aborted) {
        pendingText.value = ''
        return
      }

      const nextChar = pendingText.value.slice(0, 1)
      pendingText.value = pendingText.value.slice(1)
      appendAssistantContent(messageId, nextChar)
      await wait(TYPEWRITER_DELAY)
    }
  }

  async function readSseStream(response, messageId) {
    const reader = response.body?.getReader()

    if (!reader) {
      throw new Error('当前浏览器不支持读取流式响应')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() || ''

      for (const line of lines) {
        const payload = extractSsePayload(line)

        if (payload === '[DONE]') {
          return
        }

        const content = extractContent(payload)

        if (content) {
          pendingText.value += content
          await flushPendingText(messageId)
        }
      }

      if (done) {
        break
      }
    }

    const tailContent = extractContent(extractSsePayload(buffer))

    if (tailContent) {
      pendingText.value += tailContent
      await flushPendingText(messageId)
    }
  }

  async function sendMessage(content) {
    const text = content.trim()

    if (!text || isStreaming.value) {
      return
    }

    appendMessage(createMessage('user', text))

    const assistantMessage = createMessage('assistant')
    appendMessage(assistantMessage)
    activeAssistantMessageId.value = assistantMessage.id
    pendingText.value = ''

    abortController.value = new AbortController()
    isStreaming.value = true

    try {
      const response = await fetch(CHAT_STREAM_URL, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: activeMessages.value
            .filter((message) => message.content)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: abortController.value.signal,
      })

      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`)
      }

      await readSseStream(response, assistantMessage.id)
      await flushPendingText(assistantMessage.id)
    } catch (error) {
      if (error.name === 'AbortError') {
        appendAssistantContent(assistantMessage.id, '\n\n[已中断]')
        return
      }

      updateMessageContent(assistantMessage.id, `抱歉，流式响应失败：${error.message}`)
    } finally {
      isStreaming.value = false
      abortController.value = null
      pendingText.value = ''
      activeAssistantMessageId.value = ''
    }
  }

  function abortStreaming() {
    abortController.value?.abort()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    isStreaming,
    setActiveConversation,
    createConversation,
    sendMessage,
    abortStreaming,
  }
})

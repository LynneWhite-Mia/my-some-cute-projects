<template>
  <div ref="markdownRef" class="ai-markdown" v-html="renderedHtml" @click="handleClick" />
</template>

<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  streaming: {
    type: Boolean,
    default: false,
  },
})

const markdownRef = ref(null)
const renderedHtml = shallowRef('')
let renderTimer = 0

const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    const lang = language && hljs.getLanguage(language) ? language : ''
    const highlighted = lang
      ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
      : hljs.highlightAuto(code).value
    const languageLabel = md.utils.escapeHtml(lang || 'text')

    return `<pre class="markdown-code-block"><div class="markdown-code-header"><span>${languageLabel}</span><button class="markdown-copy-button" type="button" data-copy-code>复制</button></div><code class="hljs language-${languageLabel}">${highlighted}</code></pre>`
  },
})

const normalizedContent = computed(() => props.content || '')

function render() {
  renderedHtml.value = md.render(normalizedContent.value)
}

function scheduleRender() {
  window.clearTimeout(renderTimer)

  if (!props.streaming) {
    render()
    return
  }

  renderTimer = window.setTimeout(render, 80)
}

async function handleClick(event) {
  const button = event.target.closest('[data-copy-code]')

  if (!button || !markdownRef.value?.contains(button)) {
    return
  }

  const code = button.closest('.markdown-code-block')?.querySelector('code')?.innerText || ''

  if (!code) {
    return
  }

  await navigator.clipboard.writeText(code)
  button.textContent = '已复制'
  window.setTimeout(() => {
    button.textContent = '复制'
  }, 1400)
}

watch(normalizedContent, scheduleRender, {
  immediate: true,
})

watch(
  () => props.streaming,
  (streaming) => {
    if (!streaming) {
      window.clearTimeout(renderTimer)
      render()
    }
  },
)

onBeforeUnmount(() => {
  window.clearTimeout(renderTimer)
})
</script>

<style scoped>
.ai-markdown {
  color: inherit;
  overflow-wrap: anywhere;
  white-space: normal;
}

.ai-markdown :deep(*) {
  max-width: 100%;
}

.ai-markdown :deep(p) {
  margin: 0 0 10px;
}

.ai-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-markdown :deep(a) {
  color: #2563eb;
  text-decoration: none;
}

.ai-markdown :deep(a:hover) {
  text-decoration: underline;
}

.ai-markdown :deep(ul),
.ai-markdown :deep(ol) {
  padding-left: 22px;
  margin: 8px 0;
}

.ai-markdown :deep(blockquote) {
  padding-left: 12px;
  border-left: 3px solid #cbd5e1;
  margin: 10px 0;
  color: #475569;
}

.ai-markdown :deep(:not(pre) > code) {
  padding: 2px 5px;
  border-radius: 5px;
  background: #eef2f7;
  color: #be123c;
  font-size: 0.92em;
}

.ai-markdown :deep(.markdown-code-block) {
  overflow: hidden;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  margin: 12px 0;
  background: #f8fafc;
}

.ai-markdown :deep(.markdown-code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  padding: 0 10px;
  border-bottom: 1px solid #d7dde8;
  background: #eef2f7;
  color: #475569;
  font-size: 12px;
}

.ai-markdown :deep(.markdown-copy-button) {
  min-width: 54px;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
}

.ai-markdown :deep(.markdown-copy-button:hover) {
  border-color: #94a3b8;
  background: #f8fafc;
}

.ai-markdown :deep(pre code) {
  display: block;
  overflow-x: auto;
  padding: 14px;
  color: #24292f;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    Menlo,
    monospace;
  font-size: 13px;
  line-height: 1.6;
}

.ai-markdown :deep(.hljs-comment),
.ai-markdown :deep(.hljs-quote) {
  color: #6a737d;
}

.ai-markdown :deep(.hljs-keyword),
.ai-markdown :deep(.hljs-selector-tag),
.ai-markdown :deep(.hljs-subst) {
  color: #d73a49;
}

.ai-markdown :deep(.hljs-number),
.ai-markdown :deep(.hljs-literal),
.ai-markdown :deep(.hljs-variable),
.ai-markdown :deep(.hljs-template-variable),
.ai-markdown :deep(.hljs-tag .hljs-attr) {
  color: #005cc5;
}

.ai-markdown :deep(.hljs-string),
.ai-markdown :deep(.hljs-doctag) {
  color: #032f62;
}

.ai-markdown :deep(.hljs-title),
.ai-markdown :deep(.hljs-section),
.ai-markdown :deep(.hljs-selector-id) {
  color: #6f42c1;
}

.ai-markdown :deep(.hljs-type),
.ai-markdown :deep(.hljs-class .hljs-title) {
  color: #22863a;
}

@media (prefers-color-scheme: dark) {
  .ai-markdown :deep(a) {
    color: #93c5fd;
  }

  .ai-markdown :deep(blockquote) {
    border-left-color: #475569;
    color: #cbd5e1;
  }

  .ai-markdown :deep(:not(pre) > code) {
    background: #1e293b;
    color: #fda4af;
  }

  .ai-markdown :deep(.markdown-code-block) {
    border-color: #334155;
    background: #0f172a;
  }

  .ai-markdown :deep(.markdown-code-header) {
    border-bottom-color: #334155;
    background: #111827;
    color: #cbd5e1;
  }

  .ai-markdown :deep(.markdown-copy-button) {
    border-color: #475569;
    background: #1e293b;
    color: #e5e7eb;
  }

  .ai-markdown :deep(.markdown-copy-button:hover) {
    border-color: #64748b;
    background: #263449;
  }

  .ai-markdown :deep(pre code) {
    color: #e5e7eb;
  }

  .ai-markdown :deep(.hljs-comment),
  .ai-markdown :deep(.hljs-quote) {
    color: #94a3b8;
  }

  .ai-markdown :deep(.hljs-keyword),
  .ai-markdown :deep(.hljs-selector-tag),
  .ai-markdown :deep(.hljs-subst) {
    color: #f472b6;
  }

  .ai-markdown :deep(.hljs-number),
  .ai-markdown :deep(.hljs-literal),
  .ai-markdown :deep(.hljs-variable),
  .ai-markdown :deep(.hljs-template-variable),
  .ai-markdown :deep(.hljs-tag .hljs-attr) {
    color: #93c5fd;
  }

  .ai-markdown :deep(.hljs-string),
  .ai-markdown :deep(.hljs-doctag) {
    color: #86efac;
  }

  .ai-markdown :deep(.hljs-title),
  .ai-markdown :deep(.hljs-section),
  .ai-markdown :deep(.hljs-selector-id) {
    color: #c4b5fd;
  }

  .ai-markdown :deep(.hljs-type),
  .ai-markdown :deep(.hljs-class .hljs-title) {
    color: #67e8f9;
  }
}
</style>

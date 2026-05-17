# AI Chat Assistant

基于 Vue 3、Vite、Element Plus 和 Pinia 的 AI 聊天助手基础结构。

## 启动

```bash
npm install
npm run dev
```

## 目录结构

```text
src/
  components/
    layout/
      ChatLayout.vue
      ChatSidebar.vue
      ChatWindow.vue
      MessageInput.vue
  stores/
    conversation.js
  styles/
    global.css
  App.vue
  main.js
```

当前只包含基础布局和会话状态骨架，后续可以继续补充消息发送、AI 接口、会话持久化等业务逻辑。

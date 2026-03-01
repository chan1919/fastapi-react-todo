/**
 * @file main.tsx - React 应用入口文件
 * @description 这是整个 React 应用的起点，负责将根组件渲染到 DOM 中
 * 
 * 教学要点:
 * - React 18 引入了新的 createRoot API，替代了 ReactDOM.render
 * - StrictMode 是 React 的开发模式工具，帮助发现潜在问题
 * - 感叹号 (!) 是 TypeScript 的非空断言操作符
 */

// 从 React 包导入 StrictMode 组件
// StrictMode 是一个开发工具，用于在开发模式下检测潜在问题
// 它不会渲染任何可见的 UI，但会激活额外的检查和警告
import { StrictMode } from 'react'

// 从 react-dom/client 导入 createRoot
// 教学提示：React 18+ 使用 createRoot 创建根节点，支持并发特性
// 旧版本使用 ReactDOM.render，但在新版本中已被标记为遗留 API
import { createRoot } from 'react-dom/client'

// 导入全局样式文件
// Vite 会自动处理 CSS 文件的导入和打包
import './index.css'

// 导入根组件 App
// 注意：在 Vite 中，.tsx 扩展名可以省略
import App from './App.tsx'

/**
 * 获取 DOM 容器并创建 React 根节点
 * 
 * 教学提示:
 * - document.getElementById('root') 获取 HTML 中 id 为 root 的元素
 * - 感叹号 (!) 告诉 TypeScript 这个元素一定存在（非空断言）
 * - 如果担心元素不存在，可以使用可选链或条件判断
 * 
 * 最佳实践:
 * - 在生产环境中，建议添加空值检查以避免运行时错误
 * - 例如：const rootElement = document.getElementById('root');
 *        if (rootElement) { createRoot(rootElement).render(...) }
 */
const rootElement = document.getElementById('root')!

// 创建 React 根节点并渲染应用
// createRoot 返回一个对象，包含 render 方法
createRoot(rootElement).render(
  // StrictMode 包裹整个应用，在开发模式下提供额外检查
  // 教学提示：StrictMode 只在开发模式生效，生产环境会自动忽略
  <StrictMode>
    {/* 渲染根组件 App */}
    {/* 所有其他组件都将从 App 开始嵌套渲染 */}
    <App />
  </StrictMode>,
)

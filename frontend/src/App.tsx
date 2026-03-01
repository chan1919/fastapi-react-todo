/**
 * @file App.tsx - React 应用根组件
 * @description 作为整个应用的顶层组件，负责配置全局 provider 和主题
 * 
 * 组件层级结构:
 * ConfigProvider (Ant Design 全局配置)
 * └── TodoProvider (待办事项上下文)
 *     └── MainLayout (页面布局)
 *         └── Todos (待办事项主组件)
 * 
 * 教学要点:
 * - Provider 组件的嵌套顺序很重要，内层可以访问外层提供的上下文
 * - ConfigProvider 必须是最外层，以确保主题配置对所有 Ant Design 组件生效
 */

import React from "react";
// 从 Ant Design 导入配置提供者和主题工具
// ConfigProvider: 用于全局配置 Ant Design 组件的行为和样式
// theme: 提供主题算法和令牌（token）系统
import { ConfigProvider, theme } from "antd";
// 导入中文语言包，用于将 Ant Design 组件的默认文本改为中文
import zhCN from "antd/lib/locale/zh_CN";
// 导入待办事项上下文提供者，用于全局状态管理
import { TodoProvider } from "./context/TodoContext";
// 导入主布局组件，定义页面的基本结构
import MainLayout from "./layouts/MainLayout";
// 导入待办事项主组件，包含所有待办事项相关的功能
import Todos from "./components/Todos";
// 导入组件级别的样式文件
import "./App.css";

/**
 * App 组件 - 应用的根组件
 * 
 * @returns {JSX.Element} 渲染应用的整体结构
 * 
 * 教学提示:
 * - React.FC 是"React Function Component"的缩写，是函数组件的类型定义
 * - 使用 React.FC 可以自动获得 children 属性的类型（虽然这里没有使用）
 * - 箭头函数 () => {} 是 ES6+ 的语法，比 function 关键字更简洁
 * 
 * 最佳实践:
 * - 根组件通常只负责组合其他组件，不包含具体业务逻辑
 * - 全局配置和 Provider 应该在根组件中设置
 */
const App: React.FC = () => {
  return (
    /**
     * ConfigProvider - Ant Design 的全局配置组件
     * 
     * 教学提示:
     * - ConfigProvider 必须包裹所有使用 Ant Design 组件的部分
     * - 它通过 React Context 向下传递配置，所有子组件都可以访问
     * 
     * @prop locale - 设置语言包，这里使用中文
     * @prop theme - 主题配置对象
     *   - token: 设计令牌，定义颜色、圆角等基础样式变量
     *   - algorithm: 主题算法，defaultAlgorithm 是默认亮色主题
     * 
     * 设计令牌（Design Tokens）概念:
     * - colorPrimary: 主色调，会影响按钮、链接等组件的默认颜色
     * - borderRadius: 圆角大小，影响所有组件的圆角风格
     * 
     * 教学提示：为什么使用 Design Token？
     * - 统一的设计语言：所有组件使用相同的颜色和圆角
     * - 易于主题切换：只需修改 token 值即可改变整体风格
     * - 响应式设计：token 可以根据条件动态变化
     */
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          // 主色调，这里使用 Ant Design 的经典蓝色
          // 这个颜色会应用到所有使用主色的组件上
          colorPrimary: "#1890ff",
          // 圆角大小，单位是像素
          // 较大的圆角给人更现代、友好的感觉
          borderRadius: 10,
        },
        // 使用默认主题算法（亮色模式）
        // 其他选项：theme.darkAlgorithm（暗色模式）
        //         theme.compactAlgorithm（紧凑模式，减小间距）
        algorithm: theme.defaultAlgorithm,
      }}
    >
      {/* 
        TodoProvider - 待办事项的状态管理提供者
        教学提示：Context API 是 React 的全局状态管理方案
        - 避免了 props drilling（逐层传递 props）
        - 任何子组件都可以通过 useContext 访问共享状态
        
        状态管理最佳实践:
        - 将 Provider 放在需要访问该状态的所有组件之上
        - 越靠近根组件，可访问的范围越广
      */}
      <TodoProvider>
        {/* 
          MainLayout - 页面布局组件
          负责页面的整体结构（头部、内容区、底部等）
          使用 children prop 接收嵌套的内容
        */}
        <MainLayout>
          {/* 
            Todos - 待办事项主功能组件
            包含待办列表、过滤、排序等所有核心功能
          */}
          <Todos />
        </MainLayout>
      </TodoProvider>
    </ConfigProvider>
  );
};

// 导出组件作为默认导出
// 教学提示：默认导出 vs 命名导出
// - 默认导出：import App from './App'（一个文件只能有一个默认导出）
// - 命名导出：export const App = ...  import { App } from './App'（可以有多个）
export default App;

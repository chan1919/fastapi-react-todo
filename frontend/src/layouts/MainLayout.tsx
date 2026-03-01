/**
 * @file layouts/MainLayout.tsx - 主布局组件
 * @description 定义应用的整体页面结构
 * 
 * 教学要点:
 * - Layout 布局组件的使用
 * - children prop 的模式
 * - 布局组件的职责和最佳实践
 * - TypeScript 接口定义组件 props
 * 
 * 布局结构:
 * ┌─────────────────────────────┐
 * │         Header              │
 * ├─────────────────────────────┤
 * │                             │
 * │         Content             │
 * │      (动态内容区域)          │
 * │                             │
 * └─────────────────────────────┘
 */

import React, { ReactNode } from 'react';
// 从 Ant Design 导入布局组件
// Layout: 布局容器，提供标准的页面布局结构
import { Layout } from 'antd';
// 导入头部组件
import Header from '../components/Header';
// 导入布局样式
import './MainLayout.css';

// 解构 Layout 组件的 Content 子组件
// 教学提示：Content 是主要内容区域，通常包裹页面的核心内容
const { Content } = Layout;

// ============================================================================
// Props 接口定义
// ============================================================================

/**
 * MainLayoutProps - MainLayout 组件的属性类型
 * 
 * @description 定义布局组件接收的 props
 * 
 * 教学提示 - children prop:
 * - children 是 React 的特殊 prop
 * - 代表组件标签内嵌套的内容
 * - 例如：<MainLayout><Todos /></MainLayout> 中，<Todos /> 就是 children
 * 
 * ReactNode 类型:
 * - 可以是任何有效的 React 节点
 * - 包括 JSX 元素、字符串、数字、null、undefined 等
 * - 是 children 最常用的类型定义
 */
interface MainLayoutProps {
  // children 是嵌套在组件内的内容
  children: ReactNode;
}

// ============================================================================
// 组件定义
// ============================================================================

/**
 * MainLayout 组件 - 主页面布局
 * 
 * @description 包裹整个应用页面，提供统一的布局结构
 * 
 * @param {MainLayoutProps} props - 组件属性
 * @param {ReactNode} props.children - 子组件（页面内容）
 * @returns {JSX.Element} 渲染页面布局
 * 
 * 教学提示 - 布局组件模式:
 * - 布局组件负责页面结构，不负责具体业务
 * - 通过 children prop 接收可变的内容
 * - 可以复用同一个布局包裹不同的页面
 * 
 * 使用示例:
 * <MainLayout>
 *   <Todos />  {/* 这是 children */}
 * </MainLayout>
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // Layout 组件 - Ant Design 的布局容器
    // 教学提示：Layout 可以嵌套使用，创建复杂的布局结构
    <Layout className="main-layout">
      {/* 
        Header 组件 - 页面头部
        这里使用的是自定义的 Header 组件，不是 Layout.Header
        它包含了应用的标题和 Logo
      */}
      <Header />
      
      {/* 
        Content 组件 - 主要内容区域
        教学提示 - children 的使用:
        - {children} 会被替换为传入的子组件
        - 这是 React 组件组合的核心模式
        - 让布局组件可以包裹任何内容
      */}
      <Content className="main-content">
        {/* 
          这里会渲染传入的子组件
          在 App.tsx 中，这里是 <Todos /> 组件
        */}
        {children}
      </Content>
      
      {/* 
        可选：可以添加 Footer 组件
        <Footer>页脚内容</Footer>
      */}
    </Layout>
  );
};

// 导出组件
export default MainLayout;

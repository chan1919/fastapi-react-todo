/**
 * @file components/Header.tsx - 应用头部组件
 * @description 显示应用的标题和 Logo
 * 
 * 教学要点:
 * - Ant Design Layout 组件的使用
 * - theme.useToken() Hook 访问主题配置
 * - 简单的展示型组件（无状态）
 * 
 * 设计特点:
 * - 使用主题色作为背景
 * - 包含图标和标题
 * - 响应式布局
 */

import React from "react";
// 从 Ant Design 导入布局和排版组件
// Layout: 布局容器，提供 Header、Content、Sider、Footer 等子组件
// Typography: 排版组件，提供 Title、Text、Paragraph 等
// theme: 主题 Hook，用于访问设计令牌
import { Layout, Typography, theme } from "antd";
// 导入图标
import { CheckCircleOutlined } from "@ant-design/icons";
// 导入样式
import "./Header.css";

// 解构 Layout 组件的 Header 子组件
// 教学提示：解构后可以直接使用 Header，而不是 Layout.Header
const { Header } = Layout;
// 解构 Typography 组件的 Title 子组件
const { Title } = Typography;

/**
 * AppHeader 组件 - 应用头部
 * 
 * @description 显示应用的标题栏，包含 Logo 图标和应用名称
 * 
 * @returns {JSX.Element} 渲染应用头部
 * 
 * 教学提示 - 展示型组件:
 * - 这个组件没有内部状态（不使用 useState）
 * - 不接收 props，是独立的
 * - 只负责渲染 UI，被称为"哑组件"或"展示组件"
 */
const AppHeader: React.FC = () => {
  /**
   * theme.useToken() - 访问 Ant Design 主题令牌
   * 
   * 教学提示 - Design Tokens:
   * - token 是 Ant Design 的设计变量系统
   * - 可以访问在 ConfigProvider 中配置的颜色、圆角等
   * - 让组件样式与全局主题保持一致
   * 
   * 这里的使用:
   * - token.colorPrimary 获取主色调（#1890ff）
   * - 用于设置 Header 的背景色
   * 
   * 最佳实践:
   * - 使用 token 而不是硬编码颜色值
   * - 这样主题切换时组件会自动更新
   */
  const { token } = theme.useToken();

  return (
    // Header 组件 - Ant Design 的头部布局组件
    // 教学提示：Layout.Header 有默认的样式和语义
    <Header 
      className="app-header" 
      // 使用内联样式设置背景色
      // 使用主题色，确保与全局主题一致
      style={{ backgroundColor: token.colorPrimary }}
    >
      {/* 头部内容容器 */}
      <div className="header-content">
        {/* 
          图标组件
          教学提示 - Ant Design Icons:
          - 提供大量常用图标
          - 作为 React 组件使用
          - 可以设置 size、color 等属性
        */}
        <CheckCircleOutlined className="header-icon" />
        
        {/* 
          标题组件
          教学提示 - Title level:
          - level 属性指定标题级别（1-6）
          - level={3} 对应 HTML 的 <h3>
          - Ant Design 会自动应用合适的字体大小和间距
        */}
        <Title level={3} className="header-title">
          待办事项管理
        </Title>
      </div>
    </Header>
  );
};

// 导出组件
// 教学提示：这里使用默认导出
// 在导入时使用：import AppHeader from './Header'
export default AppHeader;

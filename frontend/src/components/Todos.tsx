/**
 * @file components/Todos.tsx - 待办事项主列表组件
 * @description 显示待办事项列表，提供搜索、过滤、排序功能
 * 
 * 教学要点:
 * - useMemo 用于优化性能，避免不必要的重新计算
 * - 从 Context 获取全局状态
 * - 使用 Ant Design 组件构建 UI
 * - 条件渲染：根据加载、错误、空状态显示不同内容
 * 
 * 组件功能:
 * - 显示待办事项列表
 * - 搜索功能：按文本内容搜索
 * - 过滤功能：按完成状态过滤
 * - 排序功能：按时间、优先级、字母顺序排序
 * - 统计信息：显示总数、已完成、未完成数量
 */

import React, { useState } from 'react';
// 从 Ant Design 导入多个 UI 组件
// Empty: 空状态组件
// Spin: 加载指示器
// Alert: 警告/错误提示框
// Input, Select: 表单输入组件
// Row, Col: 栅格布局组件
// Typography, Space: 排版组件
import { Empty, Spin, Alert, Input, Select, Row, Col, Typography, Space } from 'antd';
// 从 Ant Design Icons 导入图标
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
// 导入自定义 Hook，用于访问全局状态
import { useTodoContext } from '../context/TodoContext';
// 导入子组件
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
// 导入组件样式
import './Todos.css';

// 解构 Typography 组件，方便使用
const { Title } = Typography;
// 解构 Select 组件的 Option 子组件
const { Option } = Select;

/**
 * Todos 组件 - 待办事项主列表
 * 
 * @description 核心功能组件，包含搜索、过滤、排序等功能
 * 
 * @returns {JSX.Element} 渲染待办事项列表界面
 * 
 * 教学提示 - 组件职责:
 * - 这是一个"容器组件"，负责组合多个子组件
 * - 不直接操作数据，而是通过 Context 获取
 * - 专注于 UI 展示和用户交互
 */
const Todos: React.FC = () => {
  // ==========================================================================
  // 状态管理
  // ==========================================================================
  
  /**
   * 从 Context 获取全局状态
   * 
   * 教学提示 - useContext:
   * - 直接获取 Provider 提供的数据，无需 props 传递
   * - 当 Context 值变化时，组件会自动重新渲染
   * - 这是 React 推荐的全局状态访问方式
   */
  const { todos, loading, error } = useTodoContext();
  
  /**
   * 搜索文本状态
   * 
   * 教学提示 - useState:
   * - 用于管理组件内部的本地状态
   * - 状态变化会触发组件重新渲染
   * - 初始值为空字符串
   */
  const [searchText, setSearchText] = useState('');
  
  // 过滤状态：all | completed | active
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // 排序方式：createdAt | priority | alphabetical
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // ==========================================================================
  // 数据处理
  // ==========================================================================
  
  /**
   * useMemo - 记忆化 Hook，用于优化性能
   * 
   * 教学提示 - useMemo 详解:
   * - 第一个参数是计算函数，返回值会被缓存
   * - 第二个参数是依赖数组，只有依赖变化时才重新计算
   * - 避免每次渲染都重新执行昂贵的计算
   * 
   * 为什么这里需要 useMemo？
   * - 过滤和排序是计算密集型操作
   * - 如果每次渲染都执行，会浪费性能
   * - 只有当 todos、searchText、filterStatus、sortBy 变化时才需要重新计算
   * 
   * 最佳实践:
   * - 不要在 useMemo 中执行副作用（如 API 调用）
   * - 依赖数组要完整，避免遗漏导致 stale 数据
   */
  const filteredAndSortedTodos = React.useMemo(() => {
    // 第一步：过滤
    let result = todos.filter(todo => {
      // 搜索文本过滤：检查标题或描述是否包含搜索文本
      const matchesSearch = todo.item.toLowerCase().includes(searchText.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchText.toLowerCase()));

      // 状态过滤：根据选择的过滤条件判断
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && todo.isCompleted) ||
        (filterStatus === 'active' && !todo.isCompleted);

      // 同时满足搜索和状态条件
      return matchesSearch && matchesStatus;
    });

    // 第二步：排序
    return result.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority; // 高优先级在前（降序）
      } else if (sortBy === 'createdAt') {
        // 新创建的在前（降序）
        // 教学提示：Date 对象比较需要转换为时间戳
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'alphabetical') {
        // 按字母顺序（升序）
        // localeCompare 用于字符串比较，支持国际化
        return a.item.localeCompare(b.item);
      }
      return 0; // 默认不排序
    });
  }, [todos, searchText, filterStatus, sortBy]); // 依赖数组

  // ==========================================================================
  // 渲染 UI
  // ==========================================================================
  
  return (
    <div className="todos-container">
      {/* 添加新待办区域 */}
      <Title level={4} className="section-title">添加新待办</Title>
      <TodoForm />

      {/* 待办事项列表区域 */}
      <Title level={4} className="section-title">待办事项列表</Title>

      {/* 过滤和排序工具栏 */}
      <div className="todos-filters">
        {/* 
          Ant Design 栅格系统:
          - Row: 行组件，自动换行
          - Col: 列组件，xs/sm/md 表示不同屏幕尺寸的宽度
          - gutter: 列间距
          - align: 垂直对齐方式
        */}
        <Row gutter={16} align="middle">
          {/* 搜索框 - 占据不同屏幕下的不同宽度 */}
          <Col xs={24} sm={10} md={12}>
            <Input
              placeholder="搜索待办事项"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          
          {/* 状态过滤器 */}
          <Col xs={12} sm={7} md={6}>
            <Select
              value={filterStatus}
              onChange={value => setFilterStatus(value)}
              placeholder="状态过滤"
              style={{ width: '100%' }}
              prefix={<FilterOutlined />}
            >
              <Option value="all">全部</Option>
              <Option value="active">未完成</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Col>
          
          {/* 排序选择器 */}
          <Col xs={12} sm={7} md={6}>
            <Select
              value={sortBy}
              onChange={value => setSortBy(value)}
              placeholder="排序方式"
              style={{ width: '100%' }}
            >
              <Option value="createdAt">创建时间</Option>
              <Option value="priority">优先级</Option>
              <Option value="alphabetical">字母顺序</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* 
        条件渲染 - 三种状态:
        1. loading: 显示加载指示器
        2. error: 显示错误提示
        3. 有数据：显示列表
        4. 无数据：显示空状态
      */}
      {loading ? (
        // 加载状态
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : error ? (
        // 错误状态
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
        />
      ) : filteredAndSortedTodos.length > 0 ? (
        // 有数据：渲染列表
        <div className="todos-list">
          {/* 
            使用 map 渲染列表
            教学提示 - React 列表渲染:
            - key 是必需的，用于标识每个元素
            - 使用唯一的 id 作为 key，不要用索引
            - key 帮助 React 优化渲染性能
          */}
          {filteredAndSortedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      ) : (
        // 空状态
        <Empty
          description={
            // 根据是否有过滤条件显示不同的提示
            searchText || filterStatus !== 'all'
              ? "没有找到匹配的待办事项"
              : "暂无待办事项，请添加"
          }
        />
      )}

      {/* 统计信息 - 只在有数据时显示 */}
      {filteredAndSortedTodos.length > 0 && (
        <div className="todos-summary">
          <Space>
            <Typography.Text type="secondary">
              {/* 
                动态计算统计数据
                教学提示 - 数组方法:
                - length: 获取数组长度
                - filter: 过滤数组，然后获取长度
              */}
              共 {todos.length} 项，
              已完成 {todos.filter(t => t.isCompleted).length} 项，
              未完成 {todos.filter(t => !t.isCompleted).length} 项
            </Typography.Text>
          </Space>
        </div>
      )}
    </div>
  );
};

// 导出组件
export default Todos;

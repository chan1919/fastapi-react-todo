import React, { useState } from 'react';
import { Empty, Spin, Alert, Input, Select, Row, Col, Typography, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useTodoContext } from '../context/TodoContext';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import './Todos.css';

const { Title } = Typography;
const { Option } = Select;

const Todos: React.FC = () => {
  const { todos, loading, error } = useTodoContext();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // 过滤和排序待办事项
  const filteredAndSortedTodos = React.useMemo(() => {
    // 首先过滤
    let result = todos.filter(todo => {
      // 搜索文本过滤
      const matchesSearch = todo.item.toLowerCase().includes(searchText.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchText.toLowerCase()));

      // 状态过滤
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && todo.isCompleted) ||
        (filterStatus === 'active' && !todo.isCompleted);

      return matchesSearch && matchesStatus;
    });

    // 然后排序
    return result.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority; // 高优先级在前
      } else if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 新创建的在前
      } else if (sortBy === 'alphabetical') {
        return a.item.localeCompare(b.item); // 按字母顺序
      }
      return 0;
    });
  }, [todos, searchText, filterStatus, sortBy]);

  return (
    <div className="todos-container">
      <Title level={4} className="section-title">添加新待办</Title>
      <TodoForm />

      <Title level={4} className="section-title">待办事项列表</Title>

      <div className="todos-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={10} md={12}>
            <Input
              placeholder="搜索待办事项"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
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

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
        />
      ) : filteredAndSortedTodos.length > 0 ? (
        <div className="todos-list">
          {filteredAndSortedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      ) : (
        <Empty
          description={
            searchText || filterStatus !== 'all'
              ? "没有找到匹配的待办事项"
              : "暂无待办事项，请添加"
          }
        />
      )}

      {filteredAndSortedTodos.length > 0 && (
        <div className="todos-summary">
          <Space>
            <Typography.Text type="secondary">
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

export default Todos;

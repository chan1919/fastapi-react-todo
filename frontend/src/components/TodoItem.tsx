/**
 * @file components/TodoItem.tsx - 单个待办事项组件
 * @description 显示单个待办事项的详细信息，提供编辑、删除、完成等操作
 * 
 * 教学要点:
 * - Props 接口定义：使用 TypeScript 定义组件属性类型
 * - 条件样式：根据完成状态应用不同样式
 * - Modal 对话框：编辑功能的实现
 * - confirm 确认对话框：删除前的二次确认
 * - 类型断言：使用 keyof typeof 获取对象键的类型
 * 
 * 组件功能:
 * - 显示待办事项的标题、描述、优先级、创建时间
 * - 切换完成状态
 * - 编辑待办事项（弹窗表单）
 * - 删除待办事项（二次确认）
 */

import React, { useState } from 'react';
// 从 Ant Design 导入多个组件
// Card: 卡片容器
// Typography: 排版组件（Text, Paragraph）
// Button: 按钮
// Tag: 标签，用于显示优先级
// Modal: 模态对话框，用于编辑
// Input, Select, Checkbox: 表单组件
import { Card, Typography, Button, Tag, Modal, Form, Input, Select, Checkbox } from 'antd';
// 导入图标
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// 导入类型定义
import { Todo, TodoUpdateRequest } from '../types/todo';
// 导入自定义 Hook
import { useTodoContext } from '../context/TodoContext';
// 导入样式
import './TodoItem.css';

// 解构 Typography 组件的子组件
const { Text, Paragraph } = Typography;
// 解构 Select 组件的 Option 子组件
const { Option } = Select;
// 解构 Modal 的 confirm 方法（静态方法）
// 教学提示：confirm 是 Modal 的静态方法，用于快速显示确认对话框
const { confirm } = Modal;

// ============================================================================
// Props 接口定义
// ============================================================================

/**
 * TodoItemProps - TodoItem 组件的属性类型
 * 
 * @description 定义组件接收的 props
 * 
 * 教学提示 - Props 接口:
 * - 使用 interface 定义组件属性的类型
 * - Props 命名约定：组件名 + Props，如 TodoItemProps
 * - 子组件通过 props 从父组件接收数据
 * 
 * @prop {Todo} todo - 待办事项对象，包含所有待办事项数据
 */
interface TodoItemProps {
  // 待办事项数据，类型是之前定义的 Todo 接口
  todo: Todo;
}

// ============================================================================
// 样式配置对象
// ============================================================================

/**
 * 优先级颜色映射
 * 
 * @description 将优先级数字映射到 Ant Design 的 Tag 颜色
 * 
 * 教学提示 - 类型安全访问:
 * - 使用 keyof typeof 获取对象的所有键的类型
 * - 这样在访问对象属性时有类型检查
 * - 避免访问不存在的键
 */
const priorityColors = {
  1: 'blue',    // 很低 - 蓝色
  2: 'cyan',    // 低 - 青色
  3: 'green',   // 中 - 绿色
  4: 'orange',  // 高 - 橙色
  5: 'red',     // 很高 - 红色
};

/**
 * 优先级标签映射
 * 
 * @description 将优先级数字映射到中文标签
 */
const priorityLabels = {
  1: '很低',
  2: '低',
  3: '中',
  4: '高',
  5: '很高',
};

// ============================================================================
// 组件定义
// ============================================================================

/**
 * TodoItem 组件 - 单个待办事项
 * 
 * @description 显示待办事项的详细信息，提供操作按钮
 * 
 * @param {TodoItemProps} props - 组件属性
 * @param {Todo} props.todo - 待办事项数据
 * @returns {JSX.Element} 渲染待办事项卡片
 * 
 * 教学提示 - 组件解构 props:
 * - ({ todo }) 是解构写法，等价于 (props) 然后使用 props.todo
 * - 解构让代码更简洁，直接使用 todo 而不是 props.todo
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  // ==========================================================================
  // 状态管理
  // ==========================================================================
  
  // 从 Context 获取操作方法
  const { updateTodoItem, removeTodo } = useTodoContext();
  
  /**
   * 编辑对话框可见性状态
   * 
   * 教学提示 - 布尔状态:
   * - 用于控制 Modal 的显示/隐藏
   * - true = 显示，false = 隐藏
   * - 初始值为 false（隐藏）
   */
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  /**
   * 表单实例
   * 
   * 教学提示 - 每个表单都需要独立的实例:
   * - 用于操作编辑对话框中的表单
   * - 与 TodoForm 中的表单实例是独立的
   */
  const [form] = Form.useForm();

  // ==========================================================================
  // 事件处理函数
  // ==========================================================================
  
  /**
   * 处理编辑按钮点击
   * 
   * @description 打开编辑对话框，并填充当前数据
   * 
   * 教学提示 - form.setFieldsValue:
   * - 编程式设置表单字段的值
   * - 用于编辑时填充现有数据
   * - 字段名必须与 Form.Item 的 name 属性匹配
   */
  const handleEdit = () => {
    // 设置表单值为当前待办事项的数据
    form.setFieldsValue({
      item: todo.item,
      description: todo.description || '',  // 如果 description 为 undefined，使用空字符串
      priority: todo.priority,
      isCompleted: todo.isCompleted,
    });
    // 显示编辑对话框
    setIsEditModalVisible(true);
  };

  /**
   * 处理更新提交
   * 
   * @description 验证表单并提交更新
   * 
   * 教学提示 - 异步表单验证:
   * - form.validateFields() 返回 Promise
   * - 验证失败时会抛出异常
   * - 使用 try/catch 处理验证结果
   * 
   * 最佳实践:
   * - 验证通过后再提交
   * - 捕获验证失败的异常
   */
  const handleUpdate = async () => {
    try {
      // 验证表单字段，通过后获取值
      const values = await form.validateFields();
      // 调用 Context 方法更新待办事项
      // 使用类型断言告诉 TypeScript 这是 TodoUpdateRequest 类型
      await updateTodoItem(todo.id, values as TodoUpdateRequest);
      // 关闭对话框
      setIsEditModalVisible(false);
    } catch (error) {
      // 验证失败或其他错误
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 处理删除
   * 
   * @description 显示确认对话框，确认后删除
   * 
   * 教学提示 - Modal.confirm:
   * - Ant Design 提供的快速确认对话框
   * - 不需要手动管理可见性状态
   * - onOk 回调在用户点击确认后执行
   */
  const handleDelete = () => {
    // 显示确认对话框
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除"${todo.item}"吗？`,
      okText: '确认',
      cancelText: '取消',
      // 用户点击确认后的回调
      onOk: async () => {
        await removeTodo(todo.id);
      },
    });
  };

  /**
   * 处理完成状态切换
   * 
   * @description 切换待办事项的完成状态
   * 
   * 教学提示 - 状态切换模式:
   * - 使用 !todo.isCompleted 取反当前状态
   * - 只更新需要更改的字段
   * - 不需要传递完整的对象
   */
  const handleToggleComplete = async () => {
    await updateTodoItem(todo.id, {
      // 切换完成状态
      isCompleted: !todo.isCompleted,
    });
  };

  // ==========================================================================
  // 渲染 UI
  // ==========================================================================
  
  return (
    <>
      {/* 
        React.Fragment (<>...</>) 
        教学提示：Fragment 用于包裹多个元素，不添加额外的 DOM 节点
        这里用于同时返回 Card 和 Modal
      */}
      
      {/* 待办事项卡片 */}
      <Card
        // 动态类名：根据完成状态添加不同的 CSS 类
        className={`todo-item-card ${todo.isCompleted ? 'completed' : ''}`}
        // Card 的 actions 属性：底部操作按钮区域
        actions={[
          // 完成按钮
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={handleToggleComplete}
            // 根据完成状态应用不同的样式
            className={todo.isCompleted ? 'completed-btn' : ''}
          >
            {todo.isCompleted ? '已完成' : '完成'}
          </Button>,
          // 编辑按钮
          <Button type="text" icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>,
          // 删除按钮（危险操作，使用红色）
          <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>,
        ]}
      >
        {/* 卡片头部：标题和优先级标签 */}
        <div className="todo-item-header">
          <Text
            strong
            style={{
              fontSize: '16px',
              // 教学提示：条件样式
              // 已完成的项目显示删除线
              textDecoration: todo.isCompleted ? 'line-through' : 'none',
            }}
          >
            {todo.item}
          </Text>
          {/* 
            Tag 组件 - 优先级标签
            教学提示 - 类型断言:
            - todo.priority 是 number 类型
            - priorityColors 的键需要是字面量类型
            - 使用 keyof typeof 进行类型断言
          */}
          <Tag color={priorityColors[todo.priority as keyof typeof priorityColors]}>
            {priorityLabels[todo.priority as keyof typeof priorityLabels]}
          </Tag>
        </div>

        {/* 描述（如果有） */}
        {todo.description && (
          <Paragraph
            className="todo-description"
            style={{
              // 已完成的项目描述也显示删除线和灰色
              textDecoration: todo.isCompleted ? 'line-through' : 'none',
              color: todo.isCompleted ? '#999' : 'inherit',
            }}
          >
            {todo.description}
          </Paragraph>
        )}

        {/* 元信息区域 */}
        <div className="todo-meta">
          <Text type="secondary" className="todo-date">
            {/* 
              日期格式化
              教学提示 - Date 对象:
              - new Date(string) 将 ISO 字符串转换为 Date 对象
              - toLocaleString() 格式化为本地时间字符串
              - 例如："2024/1/15 10:30:00"
            */}
            创建于：{new Date(todo.createdAt).toLocaleString()}
          </Text>
        </div>
      </Card>

      {/* 编辑对话框 */}
      <Modal
        title="编辑待办事项"
        // open 控制对话框显示（Ant Design v4.23+ 使用 open，之前使用 visible）
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        {/* 编辑表单 */}
        <Form
          form={form}
          layout="vertical"
          // 初始值，与 handleEdit 中的 setFieldsValue 配合
          initialValues={{
            item: todo.item,
            description: todo.description || '',
            priority: todo.priority,
            isCompleted: todo.isCompleted,
          }}
        >
          {/*
            安全修复：编辑表单也需要输入验证
            - 问题：编辑时的输入验证与创建时应该一致
            - 解决：添加与TodoForm相同的验证规则
          */}
          <Form.Item
            name="item"
            label="待办事项"
            rules={[
              { required: true, message: '请输入待办事项内容' },
              { max: 200, message: '内容不能超过200个字符' },
              { min: 1, message: '内容不能为空' },
            ]}
          >
            <Input 
              placeholder="输入待办事项内容" 
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 2000, message: '描述不能超过2000个字符' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="输入描述（可选）" 
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="选择优先级">
              <Option value={1}>很低</Option>
              <Option value={2}>低</Option>
              <Option value={3}>中</Option>
              <Option value={4}>高</Option>
              <Option value={5}>很高</Option>
            </Select>
          </Form.Item>

          {/* 
            Checkbox 组件
            教学提示 - valuePropName:
            - Checkbox 的值属性是 checked，不是 value
            - valuePropName="checked" 告诉 Form 使用 checked 属性
          */}
          <Form.Item
            name="isCompleted"
            valuePropName="checked"
          >
            <Checkbox>已完成</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// 导出组件
export default TodoItem;

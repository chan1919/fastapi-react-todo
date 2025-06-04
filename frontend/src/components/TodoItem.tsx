import React, { useState } from 'react';
import { Card, Typography, Button, Tag, Modal, Form, Input, Select, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Todo, TodoUpdateRequest } from '../types/todo';
import { useTodoContext } from '../context/TodoContext';
import './TodoItem.css';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface TodoItemProps {
  todo: Todo;
}

const priorityColors = {
  1: 'blue',
  2: 'cyan',
  3: 'green',
  4: 'orange',
  5: 'red',
};

const priorityLabels = {
  1: '很低',
  2: '低',
  3: '中',
  4: '高',
  5: '很高',
};

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { updateTodoItem, removeTodo } = useTodoContext();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 处理编辑
  const handleEdit = () => {
    form.setFieldsValue({
      item: todo.item,
      description: todo.description || '',
      priority: todo.priority,
      isCompleted: todo.isCompleted,
    });
    setIsEditModalVisible(true);
  };

  // 处理更新
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateTodoItem(todo.id, values as TodoUpdateRequest);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理删除
  const handleDelete = () => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除"${todo.item}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await removeTodo(todo.id);
      },
    });
  };

  // 处理完成状态切换
  const handleToggleComplete = async () => {
    await updateTodoItem(todo.id, {
      isCompleted: !todo.isCompleted,
    });
  };

  return (
    <>
      <Card
        className={`todo-item-card ${todo.isCompleted ? 'completed' : ''}`}
        actions={[
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={handleToggleComplete}
            className={todo.isCompleted ? 'completed-btn' : ''}
          >
            {todo.isCompleted ? '已完成' : '完成'}
          </Button>,
          <Button type="text" icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>,
          <Button type="text" danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>,
        ]}
      >
        <div className="todo-item-header">
          <Text
            strong
            style={{
              fontSize: '16px',
              textDecoration: todo.isCompleted ? 'line-through' : 'none',
            }}
          >
            {todo.item}
          </Text>
          <Tag color={priorityColors[todo.priority as keyof typeof priorityColors]}>
            {priorityLabels[todo.priority as keyof typeof priorityLabels]}
          </Tag>
        </div>

        {todo.description && (
          <Paragraph
            className="todo-description"
            style={{
              textDecoration: todo.isCompleted ? 'line-through' : 'none',
              color: todo.isCompleted ? '#999' : 'inherit',
            }}
          >
            {todo.description}
          </Paragraph>
        )}

        <div className="todo-meta">
          <Text type="secondary" className="todo-date">
            创建于: {new Date(todo.createdAt).toLocaleString()}
          </Text>
        </div>
      </Card>

      <Modal
        title="编辑待办事项"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            item: todo.item,
            description: todo.description || '',
            priority: todo.priority,
            isCompleted: todo.isCompleted,
          }}
        >
          <Form.Item
            name="item"
            label="待办事项"
            rules={[{ required: true, message: '请输入待办事项内容' }]}
          >
            <Input placeholder="输入待办事项内容" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="输入描述（可选）" />
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

export default TodoItem;

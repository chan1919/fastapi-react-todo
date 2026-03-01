/**
 * @file components/TodoForm.tsx - 待办事项表单组件
 * @description 提供创建新待办事项的表单界面
 * 
 * 教学要点:
 * - Ant Design Form 组件的使用
 * - Form.useForm() Hook 管理表单实例
 * - 受控组件与非受控组件的概念
 * - 表单验证规则
 * 
 * 表单功能:
 * - 输入待办事项内容（必需）
 * - 输入描述（可选）
 * - 选择优先级（可选）
 * - 表单验证
 * - 提交后重置表单
 */

import React from 'react';
// 从 Ant Design 导入表单相关组件
// Form: 表单容器，提供验证、提交等功能
// Input: 文本输入框
// Button: 按钮组件
// Select: 下拉选择器
// Card: 卡片容器，用于包裹表单
import { Form, Input, Button, Select, Card } from 'antd';
// 导入图标
import { PlusOutlined } from '@ant-design/icons';
// 导入类型定义
import { TodoCreateRequest } from '../types/todo';
// 导入自定义 Hook
import { useTodoContext } from '../context/TodoContext';
// 导入样式
import './TodoForm.css';

// 解构 Select 组件的 Option 子组件
const { Option } = Select;
// 解构 Input 组件的 TextArea 子组件（多行文本输入）
const { TextArea } = Input;

/**
 * TodoForm 组件 - 待办事项创建表单
 * 
 * @description 使用 Ant Design Form 组件构建的创建表单
 * 
 * @returns {JSX.Element} 渲染表单界面
 * 
 * 教学提示 - Ant Design Form 特点:
 * - 自动处理表单验证
 * - 支持复杂的布局配置
 * - 内置美观的样式
 * - 与 TypeScript 良好集成
 */
const TodoForm: React.FC = () => {
  // ==========================================================================
  // 表单实例与状态
  // ==========================================================================
  
  /**
   * Form.useForm() - 创建表单实例
   * 
   * 教学提示 - useForm Hook:
   * - 返回一个表单实例对象
   * - 通过实例可以编程式操作表单（如重置、设置值、验证等）
   * - 需要将实例传递给 Form 组件的 form 属性
   * 
   * 常见操作:
   * - form.resetFields(): 重置表单
   * - form.setFieldsValue(): 设置表单值
   * - form.validateFields(): 验证表单
   * - form.getFieldsValue(): 获取表单值
   */
  const [form] = Form.useForm();
  
  /**
   * 从 Context 获取方法
   * 
   * 教学提示 - 解构重命名:
   * - addTodo 是 Context 中的方法名
   * - loading 是加载状态
   * - 这里没有重命名，直接使用
   */
  const { addTodo, loading } = useTodoContext();

  // ==========================================================================
  // 事件处理
  // ==========================================================================
  
  /**
   * 表单提交处理函数
   * 
   * @description 处理表单提交，调用 Context 的 addTodo 方法
   * 
   * 教学提示 - Ant Design Form 提交流程:
   * 1. 用户点击提交按钮
   * 2. Form 自动验证所有字段
   * 3. 验证通过后调用 onFinish
   * 4. values 参数包含所有表单字段的值
   * 
   * @param {TodoCreateRequest} values - 表单提交的数据
   */
  const handleSubmit = async (values: TodoCreateRequest) => {
    // 调用 Context 方法添加待办事项
    await addTodo(values);
    // 提交成功后重置表单
    // 教学提示：resetFields() 会将所有字段恢复到 initialValues 的值
    form.resetFields();
  };

  // ==========================================================================
  // 渲染 UI
  // ==========================================================================
  
  return (
    // Card 组件：提供卡片式容器，带有边框和阴影
    <Card className="todo-form-card">
      {/* 
        Form 组件 - Ant Design 表单容器
        教学提示 - Form 属性:
        - form: 绑定表单实例
        - layout: 布局方式，vertical 表示标签在输入框上方
        - onFinish: 提交成功时的回调
        - initialValues: 表单初始值
      */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        // 初始值配置
        initialValues={{
          item: '',           // 内容为空
          description: '',    // 描述为空
          priority: 3,        // 优先级默认为中（3）
          isCompleted: false, // 默认为未完成
        }}
      >
        {/* 
          Form.Item - 表单字段容器
          教学提示 - Form.Item 属性:
          - name: 字段名，也是提交数据中的键名（必需）
          - rules: 验证规则数组
          
          验证规则:
          - required: true 表示必填
          - message: 验证失败时的提示信息
          
          安全修复：添加输入长度限制
          - 问题：无限制的输入可能导致：
            1. 数据库存储压力
            2. 前端渲染问题
            3. 潜在的DoS攻击
          - 解决：与后端验证规则保持一致（最大200字符）
          - 最佳实践：前端和后端都应进行输入验证
        */}
        <Form.Item
          name="item"
          rules={[
            { required: true, message: '请输入待办事项内容' },
            { max: 200, message: '内容不能超过200个字符' },
            { min: 1, message: '内容不能为空' },
          ]}
        >
          {/* 
            Input 组件 - 文本输入框
            教学提示 - Input 属性:
            - placeholder: 占位提示文本
            - size: 输入框大小
            - prefix: 输入框前缀，通常是图标
            - maxLength: 最大输入长度（前端限制）
            - showCount: 显示字符计数
          */}
          <Input
            placeholder="输入新的待办事项"
            size="large"
            prefix={<PlusOutlined />}
            maxLength={200}
            showCount
          />
        </Form.Item>

        {/* 
          展开的表单区域
          包含描述、优先级和提交按钮
          教学提示：这种设计让表单默认简洁，需要时可以展开更多选项
        */}
        <div className="form-expanded">
          {/* 
            描述字段 - 可选
            
            安全修复：添加描述长度限制
            - 问题：无限制的描述可能导致存储和显示问题
            - 解决：限制最大2000字符，与后端保持一致
          */}
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 2000, message: '描述不能超过2000个字符' }]}
          >
            {/* TextArea - 多行文本输入框 */}
            <TextArea
              placeholder="添加描述（可选）"
              rows={3}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          {/* 优先级字段 - 可选 */}
          <Form.Item
            name="priority"
            label="优先级"
          >
            {/* Select - 下拉选择器 */}
            <Select>
              {/* Option - 选项 */}
              <Option value={1}>很低</Option>
              <Option value={2}>低</Option>
              <Option value={3}>中</Option>
              <Option value={4}>高</Option>
              <Option value={5}>很高</Option>
            </Select>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item>
            {/* 
              Button 组件 - 提交按钮
              教学提示 - Button 属性:
              - type: 按钮类型，primary 是主按钮（蓝色）
              - htmlType: HTML 按钮类型，submit 表示提交表单
              - loading: 加载状态，显示为加载中的按钮
              - block: 块级按钮，宽度 100%
            */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              添加待办事项
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
};

// 导出组件
export default TodoForm;

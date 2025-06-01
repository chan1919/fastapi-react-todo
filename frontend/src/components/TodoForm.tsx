import React from "react";
import { Form, Input, Button, Select, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { TodoCreateRequest } from "../types/todo";
import { useTodoContext } from "../context/TodoContext";
import "./TodoForm.css";

const { Option } = Select;
const { TextArea } = Input;

const TodoForm: React.FC = () => {
  const [form] = Form.useForm();
  const { addTodo, loading } = useTodoContext();

  const handleSubmit = async (values: TodoCreateRequest) => {
    await addTodo(values);
    form.resetFields();
  };

  return (
    <Card className="todo-form-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          item: "",
          description: "",
          priority: 3,
          isCompleted: false,
        }}
      >
        <Form.Item
          name="item"
          rules={[{ required: true, message: "请输入待办事项内容" }]}
        >
          <Input
            placeholder="输入新的待办事项"
            size="large"
            prefix={<PlusOutlined />}
          />
        </Form.Item>

        <div className="form-expanded">
          <Form.Item name="description" label="描述">
            <TextArea placeholder="添加描述（可选）" rows={3} />
          </Form.Item>

          <Form.Item name="priority" label="优先级">
            <Select>
              <Option value={1}>很低</Option>
              <Option value={2}>低</Option>
              <Option value={3}>中</Option>
              <Option value={4}>高</Option>
              <Option value={5}>很高</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              添加待办事项
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
};

export default TodoForm;

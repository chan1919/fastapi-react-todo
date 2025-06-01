import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from "../types/todo";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api/todoApi";
import { message } from "antd";

// 定义上下文类型
interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchAllTodos: () => Promise<void>;
  addTodo: (todo: TodoCreateRequest) => Promise<void>;
  updateTodoItem: (id: number, todo: TodoUpdateRequest) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
}

// 创建上下文
const TodoContext = createContext<TodoContextType>({
  todos: [],
  loading: false,
  error: null,
  fetchAllTodos: async () => {},
  addTodo: async () => {},
  updateTodoItem: async () => {},
  removeTodo: async () => {},
});

// 上下文提供者组件
export const TodoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有待办事项
  const fetchAllTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取待办事项失败");
      message.error("获取待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  // 添加待办事项
  const addTodo = async (todo: TodoCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      await createTodo(todo);
      message.success("待办事项添加成功");
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加待办事项失败");
      message.error("添加待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  // 更新待办事项
  const updateTodoItem = async (id: number, todo: TodoUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      await updateTodo(id, todo);
      message.success("待办事项更新成功");
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新待办事项失败");
      message.error("更新待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  // 删除待办事项
  const removeTodo = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTodo(id);
      message.success("待办事项删除成功");
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除待办事项失败");
      message.error("删除待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchAllTodos();
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        error,
        fetchAllTodos,
        addTodo,
        updateTodoItem,
        removeTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// 自定义Hook，方便使用上下文
export const useTodoContext = () => useContext(TodoContext);

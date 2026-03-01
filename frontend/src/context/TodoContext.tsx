/**
 * @file context/TodoContext.tsx - 待办事项 React 上下文
 * @description 使用 React Context API 实现全局状态管理
 * 
 * 教学要点:
 * - Context API 用于在组件树中共享数据，无需逐层传递 props
 * - createContext 创建上下文，Provider 提供数据，useContext 消费数据
 * - 自定义 Hook（useTodoContext）简化上下文的使用
 * 
 * 状态管理概念:
 * - 集中管理：所有待办事项状态在一个地方管理
 * - 全局访问：任何组件都可以通过 useContext 访问
 * - 单一数据源：避免状态不一致的问题
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Todo, TodoCreateRequest, TodoUpdateRequest } from "../types/todo";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api/todoApi";
import { message } from "antd";

// ============================================================================
// 上下文类型定义
// ============================================================================

/**
 * TodoContextType - 上下文数据的类型定义
 * 
 * @description 定义了通过上下文可以访问的所有状态和方法
 * 
 * 教学提示 - 为什么需要类型定义？
 * - TypeScript 需要知道上下文包含什么
 * - 提供智能提示和类型检查
 * - 确保 Provider 的 value 属性包含所有必需的字段
 * 
 * @prop {Todo[]} todos - 待办事项列表
 * @prop {boolean} loading - 加载状态
 * @prop {string | null} error - 错误信息
 * @prop {Function} fetchAllTodos - 获取所有待办事项的方法
 * @prop {Function} addTodo - 添加待办事项的方法
 * @prop {Function} updateTodoItem - 更新待办事项的方法
 * @prop {Function} removeTodo - 删除待办事项的方法
 */
interface TodoContextType {
  // 待办事项数组
  todos: Todo[];
  
  // 加载状态，用于显示加载指示器
  loading: boolean;
  
  // 错误信息，null 表示没有错误
  error: string | null;
  
  // 操作方法
  fetchAllTodos: () => Promise<void>;
  addTodo: (todo: TodoCreateRequest) => Promise<void>;
  updateTodoItem: (id: number, todo: TodoUpdateRequest) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
}

// ============================================================================
// 创建上下文
// ============================================================================

/**
 * TodoContext - 待办事项上下文对象
 * 
 * @description 使用 createContext 创建上下文
 * 
 * 教学提示 - 初始值的意义:
 * - 初始值主要用于 TypeScript 类型推断
 * - 实际使用时，Provider 会覆盖这些值
 * - 如果组件在没有 Provider 的情况下使用 useContext，会获得这些默认值
 * 
 * 最佳实践:
 * - 提供合理的默认值，避免运行时错误
 * - 方法默认为空函数，防止调用失败
 */
const TodoContext = createContext<TodoContextType>({
  todos: [],
  loading: false,
  error: null,
  fetchAllTodos: async () => {},
  addTodo: async () => {},
  updateTodoItem: async () => {},
  removeTodo: async () => {},
});

// ============================================================================
// Provider 组件
// ============================================================================

/**
 * TodoProvider - 待办事项上下文提供者组件
 * 
 * @description 包裹在应用外层，提供全局状态管理
 * 
 * 教学提示 - Provider 组件模式:
 * - Provider 是 Context 的属性，是一个 React 组件
 * - 通过 value 属性向下传递数据
 * - 所有 Provider 的子组件都可以访问这些数据
 * 
 * @param {ReactNode} children - 子组件，Provider 会包裹这些组件
 * 
 * 使用示例:
 * <TodoProvider>
 *   <App />  {/* App 内的所有组件都可以访问 TodoContext */}
 * </TodoProvider>
 */
export const TodoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /**
   * useState - React Hook，用于在函数组件中添加状态
   * 
   * 教学提示 - useState 基础:
   * - 第一个返回值是当前状态值
   * - 第二个返回值是更新状态的函数
   * - 状态更新会触发组件重新渲染
   * 
   * @param {Todo[]} [] - 初始状态为空数组
   */
  const [todos, setTodos] = useState<Todo[]>([]);
  
  // 加载状态，初始为 false
  const [loading, setLoading] = useState<boolean>(false);
  
  // 错误信息，初始为 null（没有错误）
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取所有待办事项
   * 
   * @description 调用 API 获取数据并更新状态
   * 
   * 教学提示 - 异步状态更新模式:
   * 1. 设置 loading = true
   * 2. 清除之前的错误
   * 3. 执行异步操作
   * 4. 成功后更新数据 / 失败后设置错误
   * 5. finally 中设置 loading = false
   */
  const fetchAllTodos = async () => {
    // 开始加载
    setLoading(true);
    // 清除之前的错误
    setError(null);
    
    try {
      // 调用 API 获取数据
      const data = await fetchTodos();
      // 更新状态，触发组件重新渲染
      setTodos(data);
    } catch (err) {
      // 错误处理
      setError(err instanceof Error ? err.message : "获取待办事项失败");
      // 使用 Ant Design 的 message 组件显示错误提示
      message.error("获取待办事项失败");
    } finally {
      // 无论成功或失败，都结束加载状态
      setLoading(false);
    }
  };

  /**
   * 添加待办事项
   * 
   * @param {TodoCreateRequest} todo - 待办事项数据
   * 
   * 教学提示 - 添加后刷新列表:
   * - 调用 createTodo 创建数据
   * - 成功后调用 fetchAllTodos 重新获取列表
   * - 这是一种简单但有效的状态同步方式
   * 
   * 优化建议:
   * - 可以直接将新项添加到 todos 数组，避免重新请求
   * - 但重新获取可以确保数据一致性
   */
  const addTodo = async (todo: TodoCreateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用 API 创建待办事项
      await createTodo(todo);
      // 显示成功提示
      message.success("待办事项添加成功");
      // 重新获取列表
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加待办事项失败");
      message.error("添加待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新待办事项
   * 
   * @param {number} id - 待办事项 ID
   * @param {TodoUpdateRequest} todo - 更新的字段
   */
  const updateTodoItem = async (id: number, todo: TodoUpdateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用 API 更新待办事项
      await updateTodo(id, todo);
      message.success("待办事项更新成功");
      // 重新获取列表
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新待办事项失败");
      message.error("更新待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除待办事项
   * 
   * @param {number} id - 待办事项 ID
   */
  const removeTodo = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用 API 删除待办事项
      await deleteTodo(id);
      message.success("待办事项删除成功");
      // 重新获取列表
      await fetchAllTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除待办事项失败");
      message.error("删除待办事项失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect - React Hook，用于处理副作用
   * 
   * 教学提示 - useEffect 基础:
   * - 第一个参数是效应函数，在渲染后执行
   * - 第二个参数是依赖数组，控制何时重新执行
   * - 空数组 [] 表示只在组件挂载时执行一次
   * 
   * 这里的使用场景:
   * - 组件挂载时自动加载待办事项
   * - 依赖数组为空，只执行一次
   */
  useEffect(() => {
    // 组件挂载时获取所有待办事项
    fetchAllTodos();
    // 依赖数组为空，这个效应只在首次渲染后执行
  }, []);

  /**
   * 渲染 Provider
   * 
   * 教学提示 - Provider 的 value 属性:
   * - value 是一个对象，包含所有要共享的状态和方法
   * - 子组件通过 useContext 可以获取这个对象
   * - value 变化时，所有使用 useContext 的组件都会重新渲染
   */
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

// ============================================================================
// 自定义 Hook
// ============================================================================

/**
 * useTodoContext - 自定义 Hook，用于访问待办事项上下文
 * 
 * @description 封装 useContext 调用，简化使用
 * 
 * 教学提示 - 自定义 Hook:
 * - 以 "use" 开头的函数，可以调用其他 Hooks
 * - 封装重复逻辑，提供简洁的 API
 * - 可以在多个组件中复用
 * 
 * @returns {TodoContextType} 上下文数据和方法
 * 
 * 使用示例:
 * const { todos, loading, addTodo } = useTodoContext();
 */
export const useTodoContext = () => useContext(TodoContext);

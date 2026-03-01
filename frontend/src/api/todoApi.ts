/**
 * @file api/todoApi.ts - 待办事项 API 客户端
 * @description 封装了与后端 FastAPI 服务通信的所有 HTTP 请求
 * 
 * 教学要点:
 * - 使用 Fetch API 进行 HTTP 通信
 * - 命名转换：后端使用 snake_case，前端使用 camelCase
 * - 统一的错误处理机制
 * - 异步函数使用 async/await 语法
 * 
 * API 设计原则:
 * - 单一职责：每个函数只负责一个 API 端点
 * - 类型安全：使用 TypeScript 类型确保数据正确
 * - 错误处理：统一的错误处理函数
 */

import { Todo, TodoCreateRequest, TodoUpdateRequest } from '../types/todo';

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取 API 基础 URL
 * 
 * @description 根据环境返回不同的 API 地址
 * 
 * 教学提示 - 环境配置:
 * - 开发环境：使用 localhost:8000 直接连接后端
 * - 生产环境：使用相对路径 /api，通过代理转发
 * 
 * 最佳实践:
 * - 将配置集中管理，便于不同环境切换
 * - 使用环境变量（process.env）管理配置
 * 
 * 安全修复：支持环境变量配置
 * - 问题：硬编码URL无法适应不同部署环境
 * - 解决：优先读取环境变量 VITE_API_BASE_URL
 * 
 * @returns {string} API 基础 URL
 */
const getBaseUrl = () => {
  // 安全修复：优先使用环境变量配置
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  // 开发环境使用 localhost:8000，生产环境使用相对路径
  // 教学提示：import.meta.env.DEV 是 Vite 提供的环境变量
  return import.meta.env.DEV
    ? 'http://localhost:8000'
    : '/api';
};

/**
 * 错误处理函数
 * 
 * @description 统一的错误处理逻辑
 * 
 * 教学提示 - TypeScript 类型:
 * - unknown: 比 any 更安全的类型，需要进行类型检查才能使用
 * - never: 表示这个函数永远不会正常返回（总是抛出异常）
 * 
 * 安全修复：改进错误处理，不暴露敏感信息
 * - 问题：原始代码可能暴露内部错误详情给用户
 * - 解决：返回友好的错误信息，详细错误仅记录到控制台
 * 
 * @param {unknown} error - 捕获到的错误对象
 * @returns {never} 这个函数总是抛出异常，不会返回正常值
 * @throws {Error} 重新抛出用户友好的错误
 */
const handleError = (error: unknown): never => {
  // 安全修复：在控制台记录详细错误供开发者调试
  console.error('API 错误:', error);
  
  // 安全修复：不向用户暴露敏感的错误详情
  let userMessage = '请求失败，请稍后重试';
  
  if (error instanceof Error) {
    // 根据错误类型返回友好的提示
    if (error.message.includes('fetch') || error.message.includes('network')) {
      userMessage = '网络连接失败，请检查网络设置';
    } else if (error.message.includes('HTTP')) {
      // 安全修复：不暴露具体的HTTP状态码给用户
      userMessage = '服务器处理请求失败，请稍后重试';
    } else if (error.message.includes('JSON')) {
      userMessage = '服务器响应格式错误';
    }
  }
  
  // 抛出用户友好的错误信息
  throw new Error(userMessage);
};

/**
 * 将蛇形命名（snake_case）转换为驼峰命名（camelCase）
 * 
 * @description 递归转换对象的所有键名
 * 
 * 教学提示 - 命名约定差异:
 * - Python/后端：习惯使用 snake_case（如：created_at）
 * - JavaScript/前端：习惯使用 camelCase（如：createdAt）
 * - 这个函数解决了前后端命名不一致的问题
 * 
 * 正则表达式解释:
 * - /_([a-z])/g: 匹配下划线后跟一个小写字母
 * - (_, letter) => letter.toUpperCase(): 将字母转为大写，去掉下划线
 * 
 * @param {any} obj - 需要转换的对象或数组
 * @returns {any} 转换后的对象或数组
 * 
 * 示例:
 * - 输入：{ created_at: "2024-01-01" }
 * - 输出：{ createdAt: "2024-01-01" }
 */
const snakeToCamel = (obj: any): any => {
  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  } 
  // 如果是对象且不为 null，转换键名
  else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      // 转换键名：将 snake_case 转为 camelCase
      // 例如：created_at -> createdAt
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      // 递归转换值（处理嵌套对象）
      result[camelKey] = snakeToCamel(obj[key]);
      return result;
    }, {} as Record<string, any>);
  }
  // 如果是基本类型（字符串、数字等），直接返回
  return obj;
};

/**
 * 将驼峰命名（camelCase）转换为蛇形命名（snake_case）
 * 
 * @description 递归转换对象的所有键名，用于发送请求到后端
 * 
 * 教学提示 - 正则表达式:
 * - /[A-Z]/g: 匹配所有大写字母
 * - letter => `_${letter.toLowerCase()}`: 在字母前加下划线并转小写
 * 
 * @param {any} obj - 需要转换的对象或数组
 * @returns {any} 转换后的对象或数组
 * 
 * 示例:
 * - 输入：{ createdAt: "2024-01-01" }
 * - 输出：{ created_at: "2024-01-01" }
 */
const camelToSnake = (obj: any): any => {
  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  } 
  // 如果是对象且不为 null，转换键名
  else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      // 转换键名：将 camelCase 转为 snake_case
      // 例如：createdAt -> created_at
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      // 递归转换值（处理嵌套对象）
      result[snakeKey] = camelToSnake(obj[key]);
      return result;
    }, {} as Record<string, any>);
  }
  // 如果是基本类型，直接返回
  return obj;
};

// ============================================================================
// API 请求函数
// ============================================================================

/**
 * 获取所有待办事项
 * 
 * @description 调用 GET /todo 端点获取待办事项列表
 * 
 * 教学提示 - Fetch API:
 * - fetch() 返回一个 Promise
 * - response.ok: 检查 HTTP 状态码是否在 200-299 范围内
 * - response.json(): 将响应体解析为 JSON
 * 
 * @returns {Promise<Todo[]>} 待办事项数组
 * @throws {Error} 请求失败时抛出错误
 */
export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    // 发送 GET 请求
    const response = await fetch(`${getBaseUrl()}/todo`);
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    
    // 解析 JSON 响应
    const data = await response.json();
    
    // 转换为驼峰命名
    return snakeToCamel(data) || [];
  } catch (error) {
    // 使用统一的错误处理
    return handleError(error);
  }
};

/**
 * 获取单个待办事项
 * 
 * @description 调用 GET /todo/{id} 端点获取指定 ID 的待办事项
 * 
 * @param {number} id - 待办事项的唯一标识符
 * @returns {Promise<Todo>} 待办事项对象
 * @throws {Error} 请求失败时抛出错误
 */
export const fetchTodoById = async (id: number): Promise<Todo> => {
  try {
    // 发送 GET 请求，URL 中包含 ID
    const response = await fetch(`${getBaseUrl()}/todo/${id}`);
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    
    // 解析 JSON 响应
    const data = await response.json();
    
    // 转换为驼峰命名
    return snakeToCamel(data);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * 创建待办事项
 * 
 * @description 调用 POST /todo 端点创建新的待办事项
 * 
 * 教学提示 - POST 请求:
 * - method: 'POST' 指定请求方法
 * - headers: 设置 Content-Type 为 application/json
 * - body: 请求体，需要使用 JSON.stringify 序列化
 * 
 * @param {TodoCreateRequest} todo - 待办事项数据
 * @returns {Promise<Todo>} 创建后的待办事项（包含 ID 和时间戳）
 * @throws {Error} 请求失败时抛出错误
 */
export const createTodo = async (todo: TodoCreateRequest): Promise<Todo> => {
  try {
    // 转换为蛇形命名（后端期望的格式）
    const snakeCaseTodo = camelToSnake(todo);

    const response = await fetch(`${getBaseUrl()}/todo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snakeCaseTodo),
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    
    // 解析 JSON 响应
    const data = await response.json();
    
    // 转换为驼峰命名
    return snakeToCamel(data);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * 更新待办事项
 * 
 * @description 调用 PUT /todo/{id} 端点更新指定的待办事项
 * 
 * 教学提示 - PUT vs PATCH:
 * - PUT: 完整替换资源，需要提供所有字段
 * - PATCH: 部分更新，只提供要修改的字段
 * - 这里使用 PUT，但后端应该支持部分更新
 * 
 * @param {number} id - 待办事项的唯一标识符
 * @param {TodoUpdateRequest} todo - 要更新的字段
 * @returns {Promise<Todo>} 更新后的待办事项
 * @throws {Error} 请求失败时抛出错误
 */
export const updateTodo = async (id: number, todo: TodoUpdateRequest): Promise<Todo> => {
  try {
    // 转换为蛇形命名（后端期望的格式）
    const snakeCaseTodo = camelToSnake(todo);

    const response = await fetch(`${getBaseUrl()}/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snakeCaseTodo),
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    
    // 解析 JSON 响应
    const data = await response.json();
    
    // 转换为驼峰命名
    return snakeToCamel(data);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * 删除待办事项
 * 
 * @description 调用 DELETE /todo/{id} 端点删除指定的待办事项
 * 
 * 教学提示 - DELETE 请求:
 * - 通常不需要请求体
 * - 成功响应可能是 204 No Content（没有返回数据）
 * - 返回类型是 Promise<void>，表示没有返回值
 * 
 * @param {number} id - 待办事项的唯一标识符
 * @returns {Promise<void>} 删除成功时 resolve，失败时 reject
 * @throws {Error} 请求失败时抛出错误
 */
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    // 发送 DELETE 请求
    const response = await fetch(`${getBaseUrl()}/todo/${id}`, {
      method: 'DELETE',
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    // 注意：DELETE 成功可能没有响应体，所以不调用 response.json()
  } catch (error) {
    return handleError(error);
  }
};

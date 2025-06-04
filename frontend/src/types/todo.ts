// Todo类型定义

// 基础Todo类型
export interface TodoBase {
  item: string;
  description?: string;
  isCompleted: boolean;
  priority: number;
}

// 从API返回的Todo类型
export interface Todo extends TodoBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// 创建Todo的请求类型
export interface TodoCreateRequest {
  item: string;
  description?: string;
  isCompleted?: boolean;
  priority?: number;
}

// 更新Todo的请求类型
export interface TodoUpdateRequest {
  item?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: number;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

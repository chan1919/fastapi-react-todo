/**
 * @file types/todo.ts - 待办事项相关的 TypeScript 类型定义
 * @description 定义了整个应用中与待办事项相关的所有数据类型
 * 
 * 教学要点:
 * - TypeScript 接口（interface）用于定义对象的结构
 * - 使用接口可以在编译时捕获类型错误
 * - 良好的类型定义是 TypeScript 项目的基石
 * 
 * 类型设计原则:
 * - 分离关注点：基础类型、完整类型、请求类型分开定义
 * - 使用继承：Todo 继承 TodoBase，避免重复定义
 * - 可选属性：使用 ? 标记可选字段，提高灵活性
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * TodoBase - 待办事项的基础接口
 * 
 * @description 定义了待办事项的核心属性，不包含系统字段（如 id、时间戳）
 * 
 * 教学提示 - 为什么需要基础接口？
 * - 代码复用：其他接口可以继承它，避免重复定义相同字段
 * - 关注点分离：将业务属性与系统属性分开
 * - 类型安全：确保所有待办事项都有这些必需字段
 * 
 * @prop {string} item - 待办事项的标题/内容（必需）
 * @prop {string} [description] - 详细描述（可选，使用 ? 标记）
 * @prop {boolean} isCompleted - 完成状态（必需）
 * @prop {number} priority - 优先级，1-5 的数字（必需）
 * 
 * 最佳实践:
 * - 业务相关字段放在基础接口中
 * - 系统生成的字段（id、时间戳）放在扩展接口中
 */
export interface TodoBase {
  // 待办事项的主要内容，例如："买牛奶"
  item: string;
  
  // 详细描述，使用 ? 表示这是可选字段
  // 教学提示：可选字段意味着这个属性可以不存在或为 undefined
  description?: string;
  
  // 完成状态，true 表示已完成，false 表示未完成
  isCompleted: boolean;
  
  // 优先级，使用数字 1-5 表示
  // 教学提示：可以考虑使用字面量类型，如：1 | 2 | 3 | 4 | 5
  // 这样可以限制只能使用这些特定值
  priority: number;
}

// ============================================================================
// 完整类型定义
// ============================================================================

/**
 * Todo - 完整的待办事项接口（从 API 返回的数据类型）
 * 
 * @description 继承 TodoBase，添加了系统生成的字段
 * 
 * 教学提示 - 接口继承:
 * - 使用 extends 关键字继承其他接口
 * - 子接口会包含父接口的所有属性
 * - 可以添加新的属性或覆盖可选属性
 * 
 * @extends {TodoBase}
 * @prop {number} id - 唯一标识符，由后端生成
 * @prop {string} createdAt - 创建时间，ISO 8601 格式字符串
 * @prop {string} updatedAt - 最后更新时间，ISO 8601 格式字符串
 */
export interface Todo extends TodoBase {
  // 唯一标识符，用于标识和操作特定的待办事项
  // 教学提示：ID 通常由后端数据库生成，前端只读使用
  id: number;
  
  // 创建时间戳，格式如："2024-01-15T10:30:00Z"
  // 教学提示：可以使用 new Date(createdAt) 转换为 Date 对象
  createdAt: string;
  
  // 最后更新时间戳
  // 教学提示：每次更新待办事项时，后端都会更新这个字段
  updatedAt: string;
}

// ============================================================================
// 请求类型定义
// ============================================================================

/**
 * TodoCreateRequest - 创建待办事项的请求数据类型
 * 
 * @description 用于创建新待办事项时提交的数据
 * 
 * 教学提示 - 为什么需要单独的定义？
 * - 创建时不需要 id、createdAt、updatedAt（这些由后端生成）
 * - isCompleted 和 priority 是可选的，有默认值
 * - 与 Todo 类型分离，明确区分"输入"和"输出"
 * 
 * @prop {string} item - 待办事项内容（必需）
 * @prop {string} [description] - 描述（可选）
 * @prop {boolean} [isCompleted] - 完成状态（可选，默认 false）
 * @prop {number} [priority] - 优先级（可选，默认 3）
 */
export interface TodoCreateRequest {
  // 待办事项内容，创建时必须提供
  item: string;
  
  // 可选描述
  description?: string;
  
  // 可选完成状态，如果不提供，后端会使用默认值
  // 教学提示：前端通常创建时都是未完成状态
  isCompleted?: boolean;
  
  // 可选优先级，如果不提供，后端会使用默认值
  priority?: number;
}

/**
 * TodoUpdateRequest - 更新待办事项的请求数据类型
 * 
 * @description 用于更新现有待办事项时提交的数据
 * 
 * 教学提示 - Partial 模式:
 * - 所有字段都是可选的，因为更新时可以只修改部分字段
 * - 例如：只更新 isCompleted，不修改 item 和 description
 * - 这与 CreateRequest 不同，创建时必须提供 item
 * 
 * 最佳实践:
 * - 更新接口通常所有字段都是可选的
 * - 使用 PATCH 方法时，只发送需要更改的字段
 */
export interface TodoUpdateRequest {
  // 所有字段都是可选的，因为更新操作可以是部分的
  item?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: number;
}

// ============================================================================
// 通用 API 响应类型
// ============================================================================

/**
 * ApiResponse<T> - 通用的 API 响应接口
 * 
 * @description 定义了 API 响应的标准结构
 * 
 * 教学提示 - 泛型（Generics）:
 * - <T> 是泛型参数，表示这个接口可以适配任何类型
 * - 使用时指定具体类型，如：ApiResponse<Todo[]>
 * - 泛型让类型定义更灵活、可复用
 * 
 * @template T - 响应数据的类型
 * @prop {T} data - 实际的数据负载
 * @prop {string} [message] - 成功消息（可选）
 * @prop {string} [error] - 错误信息（可选）
 * 
 * 使用示例:
 * - ApiResponse<Todo> - 单个待办事项的响应
 * - ApiResponse<Todo[]> - 待办事项列表的响应
 * - ApiResponse<void> - 没有数据返回的响应
 */
export interface ApiResponse<T> {
  // 响应的主要数据，类型由泛型 T 决定
  data: T;
  
  // 可选的成功消息，例如："创建成功"
  message?: string;
  
  // 可选的错误信息，当请求失败时提供
  error?: string;
}

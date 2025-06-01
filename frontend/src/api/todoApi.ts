import type { Todo, TodoCreateRequest, TodoUpdateRequest } from '../types/todo';

const API_BASE_URL = 'http://localhost:8000';

//处理错误函数
const handleError = (error: any): never => {
    console.error("API错误:", error);
    throw new Error(error.message||"请求失败")
}

//蛇形=>驼峰
const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      // 转换键名
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      // 递归转换值
      result[camelKey] = snakeToCamel(obj[key]);
      return result;
    }, {} as Record<string, any>);
  }
  return obj;
};

//驼峰=>蛇形
const camelToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      // 转换键名
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      // 递归转换值
      result[snakeKey] = camelToSnake(obj[key]);
      return result;
    }, {} as Record<string, any>);
  }
  return obj;
};

// 获取所有Todo
export const fetchTodos = async (): Promise<Todo[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/todo`);
        if (!response.ok) {
            throw new Error(`HTTP错误:${response.status}`);
        }
        const data = await response.json();
        //驼峰转化
        return snakeToCamel(data) || [];
    } catch (error) {
        return handleError(error);
    }
};


//获取单个Todo
export const fetchTodoById = async (id: number): Promise<Todo> => {
    try {
        const response = await fetch(`${API_BASE_URL}/todo/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP错误:${ response.status }`);
        }
        const data = await response.json();
        //驼峰
        return snakeToCamel(data);
    } catch (error) {
        return handleError(error)
    }
}

// 创建Todo
export const createTodo = async (todo: TodoCreateRequest): Promise<Todo> => {
    try {
        const snakeCaseTodo = camelToSnake(todo);

        const response = await fetch(`${API_BASE_URL}/todo`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(snakeCaseTodo),
        });
        if (!response.ok) {
            throw new Error(`HTTP错误:${response.status}`);
        }

        const data = await response.json();

        return snakeToCamel(data);

    } catch (error) {
        return handleError(error);
    }
};


// 更新待办事项
export const updateTodo = async (id: number, todo: TodoUpdateRequest): Promise<Todo> => {
  try {
    // 转换为蛇形命名
    const snakeCaseTodo = camelToSnake(todo);

    const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snakeCaseTodo),
    });
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    const data = await response.json();
    // 转换为驼峰命名
    return snakeToCamel(data);
  } catch (error) {
    return handleError(error);
  }
};

// 删除待办事项
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
  } catch (error) {
    return handleError(error);
  }
};

/*
    定义todo的相关抽象类型
    */


//  基础的Todo类型
export interface TodoBase {
    item: string;
    description?: string;
    isCompleted: boolean;
    priority: number;
}

//  从后端fastapi返回的Todo类型
export interface Todo extends TodoBase {
    id: number;
    createAt: string;
    updateAt: string;
}

//  new Todo的请求类型
export interface TodoCreateRequest{
    item: string;
    description?: string;
    isComplete?: boolean;
    priority?: number;
}

// update Todo的请求类型
export interface TodoUpdateRequest {
    itrm?: string;
    description?: string;
    isComplete?: boolean;
    priority?: number;
}

// API响应类型
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}
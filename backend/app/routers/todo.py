from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ..database.database import get_session
from ..models.todo import TodoCreate, TodoUpdate, TodoResponse
from ..services.todo_service import TodoService

router = APIRouter(prefix="/todo", tags=["todos"])


# 安全修复：添加合理的查询限制
# 问题：原始代码 limit=100 允许返回过多数据，可能导致：
# 1. 内存消耗过大
# 2. 响应时间过长
# 3. 数据库压力
# 最佳实践：限制单次查询返回的最大数量
MAX_QUERY_LIMIT = 50


@router.get(path="/", response_model=List[TodoResponse])
async def get_todos(
    skip: int = 0, 
    limit: int = 20,  # 默认改为20，更合理的分页大小
    session: Session = Depends(get_session)
):
    # 安全修复：验证分页参数
    # 问题：负数skip或过大的limit可能导致问题
    # 最佳实践：限制参数范围
    if skip < 0:
        skip = 0
    if limit < 1:
        limit = 20
    if limit > MAX_QUERY_LIMIT:
        limit = MAX_QUERY_LIMIT
    
    todo_service = TodoService(session=session)
    todos = todo_service.get_todos(skip=skip, limit=limit)
    return todos


@router.get(path="/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, session: Session = Depends(get_session)):
    todo_service = TodoService(session=session)
    todo = todo_service.get_todo_by_id(todo_id=todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项",
        )
    return todo


@router.post(path="/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(todo: TodoCreate, session: Session = Depends(get_session)):
    todo_service = TodoService(session=session)
    return todo_service.create_todo(todo)


@router.put(path="/{todo_id}", response_model=TodoResponse)
# Bug修复：添加Session类型注解
# 问题：session参数缺少类型注解，这会导致：
# 1. IDE无法提供正确的代码补全
# 2. 类型检查工具无法正确分析
# 3. 运行时行为可能不一致
# 最佳实践：始终为依赖注入的参数添加明确的类型注解
async def update_todo(
    todo_id: int, todo_update: TodoUpdate, session: Session = Depends(get_session)
):
    todo_service = TodoService(session=session)
    updated_todo = todo_service.update_todo(todo_id=todo_id, todo_update=todo_update)
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项",
        )
    return updated_todo


@router.delete(path="/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    todo_service = TodoService(session=session)
    success = todo_service.delete_todo(todo_id=todo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项",
        )
    return None

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ..database.database import get_session
from ..models.todo import TodoCreate, TodoUpdate, TodoResponse
from ..services.todo_service import TodoService

router = APIRouter(prefix="/todo", tags=["todos"])


@router.get(path="/", response_model=List[TodoResponse])
async def get_todos(
    skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
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
async def update_todo(
    todo_id: int, todo_update: TodoUpdate, session=Depends(get_session)
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

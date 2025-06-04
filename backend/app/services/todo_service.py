from sqlmodel import Session, select
from datetime import datetime
from typing import Optional, Sequence

from ..models.todo import Todo, TodoCreate, TodoUpdate


class TodoService:
    def __init__(self, session: Session):
        self.session = session

    def get_todos(self, skip: int = 0, limit: int = 100) -> Sequence[Todo]:
        """查询全部Todo"""
        statement = select(Todo).offset(skip).limit(limit=limit)
        return self.session.exec(statement=statement).all()

    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        """id查询"""
        return self.session.get(Todo, todo_id)

    def create_todo(self, todo_create: TodoCreate) -> Todo:
        """根据请求创建Todo"""
        todo = Todo.model_validate(todo_create)
        self.session.add(todo)
        self.session.commit()
        self.session.refresh(todo)

        return todo

    def update_todo(self, todo_id: int, todo_update: TodoUpdate) -> Optional[Todo]:
        """更新Todo"""
        todo = self.get_todo_by_id(todo_id=todo_id)
        if not todo:
            return None

        # 更新字段
        # exclude_unset配置只修改存在的字段
        todo_data = todo_update.model_dump(exclude_unset=True)
        for key, value in todo_data.items():
            setattr(todo, key, value)

        todo.updated_at = datetime.now()
        self.session.add(todo)
        self.session.commit()
        self.session.refresh(todo)

        return todo

    def delete_todo(self, todo_id: int) -> bool:
        """删除Todo"""
        todo = self.get_todo_by_id(todo_id=todo_id)
        if not todo:
            return False

        self.session.delete(todo)
        self.session.commit()

        return True

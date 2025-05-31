from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class TodoBase(SQLModel):
    """Todo基础模型"""

    item: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    priority: int = Field(default=1, ge=1, le=5)  # 优先级 1 ~ 5


class Todo(TodoBase, table=True):
    """Todo数据库模型"""

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(SQLModel):
    item: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)


class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime

from sqlmodel import SQLModel, Field
from typing import Optional, Annotated
from datetime import datetime


# 安全修复：定义带验证的字符串类型
# 问题：无限长度的字符串可能导致：
# 1. 数据库存储压力过大
# 2. 内存消耗过大（DoS攻击风险）
# 3. 前端显示问题
# 最佳实践：使用 Annotated 类型配合验证约束
ItemStr = Annotated[str, Field(min_length=1, max_length=200)]
DescriptionStr = Annotated[str, Field(max_length=2000)]


class TodoBase(SQLModel):
    """Todo基础模型"""
    
    item: ItemStr = Field(index=True)
    description: Optional[DescriptionStr] = Field(default=None)
    is_completed: bool = Field(default=False)
    # 安全修复：添加优先级验证约束
    # 问题：虽然之前有 ge=1, le=5，但在TodoUpdate中默认值为None时约束不生效
    # 最佳实践：确保所有优先级值都在有效范围内
    priority: int = Field(default=1, ge=1, le=5)  # 优先级 1 ~ 5


class Todo(TodoBase, table=True):
    """Todo数据库模型"""

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(SQLModel):
    # 安全修复：为更新操作添加输入验证
    # 问题：更新时也需要验证输入长度，防止注入超长数据
    # 最佳实践：更新模型的验证规则应与创建模型一致
    item: Optional[ItemStr] = None
    description: Optional[DescriptionStr] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)


class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime

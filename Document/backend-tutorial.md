# FastAPI 后端开发教程

> 📚 本教程专为初学者设计，帮助你从零开始理解 FastAPI 后端开发的核心概念。

## 📋 目录

1. [FastAPI 简介](#fastapi-简介)
2. [环境准备](#环境准备)
3. [项目结构解析](#项目结构解析)
4. [核心概念详解](#核心概念详解)
5. [代码逐行讲解](#代码逐行讲解)
6. [最佳实践](#最佳实践)
7. [常见错误与解决方案](#常见错误与解决方案)
8. [进阶学习路线](#进阶学习路线)

---

## FastAPI 简介

### 什么是 FastAPI？

FastAPI 是一个现代、高性能的 Python Web 框架，用于构建 API。它基于 Starlette（ASGI 框架）和 Pydantic（数据验证库）。

### 为什么选择 FastAPI？

```python
# 🚀 高性能 - 性能接近 Node.js 和 Go
# 📝 自动文档 - 自动生成交互式 API 文档
# ✅ 类型安全 - 基于 Python 类型提示
# 🔍 自动验证 - 自动进行数据验证和序列化
# ⚡ 异步支持 - 原生支持 async/await
```

### 对比其他框架

| 特性 | FastAPI | Flask | Django |
|------|---------|-------|--------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 自动文档 | ✅ | ❌ | ❌ |
| 类型检查 | ✅ | ❌ | ⚠️ |
| 学习曲线 | 中等 | 简单 | 陡峭 |
| 异步支持 | ✅ | ⚠️ | ⚠️ |

---

## 环境准备

### 1. 安装 Python

确保 Python 版本 >= 3.8：

```bash
python --version
# Python 3.10.0
```

### 2. 创建虚拟环境

**为什么需要虚拟环境？**
- 隔离项目依赖
- 避免版本冲突
- 便于部署

```bash
# 创建虚拟环境
python -m venv venv

# Windows 激活
venv\Scripts\activate

# macOS/Linux 激活
source venv/bin/activate

# 退出虚拟环境
deactivate
```

### 3. 安装依赖

```bash
pip install fastapi uvicorn sqlmodel
```

| 包名 | 作用 |
|------|------|
| `fastapi` | Web 框架核心 |
| `uvicorn` | ASGI 服务器 |
| `sqlmodel` | ORM + 数据验证 |

---

## 项目结构解析

```
backend/
├── app/
│   ├── database/          # 数据库配置
│   │   └── database.py    # 引擎和会话管理
│   ├── models/            # 数据模型
│   │   └── todo.py        # Todo 模型定义
│   ├── routers/           # API 路由
│   │   └── todo.py        # Todo 路由处理器
│   ├── services/          # 业务逻辑层
│   │   └── todo_service.py # 业务逻辑封装
│   └── main.py            # FastAPI 应用实例
├── main.py                # 入口文件
└── requirements.txt       # 依赖列表
```

### 分层架构的意义

```
┌─────────────────────────────────────┐
│           Router 层                  │ ← 处理 HTTP 请求/响应
│     (接收参数、返回数据)              │
├─────────────────────────────────────┤
│          Service 层                  │ ← 业务逻辑处理
│     (数据处理、业务规则)              │
├─────────────────────────────────────┤
│          Model 层                    │ ← 数据模型定义
│     (数据库表结构、数据验证)          │
├─────────────────────────────────────┤
│         Database 层                  │ ← 数据库操作
│     (连接、会话管理)                  │
└─────────────────────────────────────┘
```

**好处：**
- ✅ 职责分离，代码更清晰
- ✅ 易于测试（可以单独测试每一层）
- ✅ 便于维护（修改一处不影响其他地方）

---

## 核心概念详解

### 1. SQLModel - ORM 基础

#### 什么是 ORM？

ORM（Object-Relational Mapping）让你可以用面向对象的方式操作数据库。

**传统 SQL 方式：**
```sql
-- 查询
SELECT * FROM todo WHERE id = 1;

-- 插入
INSERT INTO todo (item, priority) VALUES ('学习', 1);

-- 更新
UPDATE todo SET is_completed = true WHERE id = 1;
```

**ORM 方式：**
```python
# 查询
todo = session.get(Todo, 1)

# 创建
new_todo = Todo(item="学习", priority=1)
session.add(new_todo)
session.commit()

# 更新
todo.is_completed = True
session.commit()
```

#### SQLModel 模型定义

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TodoBase(SQLModel):
    """
    基础模型 - 定义共有的字段
    
    SQLModel 结合了 Pydantic 和 SQLAlchemy 的优点：
    - Pydantic：数据验证和序列化
    - SQLAlchemy：数据库操作
    """
    item: str = Field(index=True)  # index=True 创建索引，加速查询
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    priority: int = Field(default=1, ge=1, le=5)  # ge=大于等于, le=小于等于

class Todo(TodoBase, table=True):
    """
    数据库模型 - 对应数据库表
    
    table=True 表示这是一个数据库表模型
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class TodoCreate(TodoBase):
    """
    创建请求模型 - 用于接收创建请求的数据
    
    继承自 TodoBase，包含所有必填字段
    """
    pass

class TodoUpdate(SQLModel):
    """
    更新请求模型 - 用于接收更新请求的数据
    
    所有字段都是 Optional，允许部分更新
    """
    item: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)

class TodoResponse(TodoBase):
    """
    响应模型 - 用于返回给客户端的数据
    
    包含完整的 Todo 信息，包括数据库生成的字段
    """
    id: int
    created_at: datetime
    updated_at: datetime
```

#### 为什么要分多个模型？

```
┌─────────────────────────────────────────────┐
│              不同场景使用不同模型               │
├─────────────────────────────────────────────┤
│                                             │
│  创建请求 → TodoCreate                      │
│  （只需提供 item 等基本信息）                 │
│                                             │
│  更新请求 → TodoUpdate                      │
│  （可以只更新部分字段）                       │
│                                             │
│  数据库表 → Todo                            │
│  （包含 id、created_at 等数据库字段）         │
│                                             │
│  返回响应 → TodoResponse                    │
│  （完整数据，包含所有字段）                   │
│                                             │
└─────────────────────────────────────────────┘
```

**好处：**
- ✅ 精确控制输入输出
- ✅ 防止暴露敏感字段（如密码）
- ✅ 清晰的接口契约

### 2. 数据库配置

```python
from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
from typing import Generator

# 获取项目根目录
Base_DIR = Path(__file__).resolve().parent.parent.parent

# 确保数据库目录存在
DB_DIR = Base_DIR / "app" / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)

# SQLite 数据库 URL
SQLITE_URL = f"sqlite:///{DB_DIR / 'todos.db'}"

# 创建数据库引擎
echo=True  # 打印 SQL 语句，方便调试
connect_args={"check_same_thread": False}  # SQLite 多线程支持
engine = create_engine(
    SQLITE_URL, 
    echo=True, 
    connect_args={"check_same_thread": False}
)

def create_db_and_tables():
    """创建所有表"""
    SQLModel.metadata.create_all(engine)

# 依赖注入函数 - FastAPI 会自动调用
async def get_session() -> Generator[Session, None, None]:
    """
    生成数据库会话
    
    使用 yield 实现上下文管理器模式：
    1. 创建会话
    2. yield 会话给路由函数使用
    3. 自动关闭会话
    """
    with Session(engine) as session:
        yield session
```

#### 依赖注入详解

```python
# 传统方式 - 手动管理
@app.get("/todo")
async def get_todos():
    session = Session(engine)  # 创建
    try:
        # ... 使用 session
        return result
    finally:
        session.close()  # 必须记得关闭！

# FastAPI 依赖注入 - 自动管理
@app.get("/todo")
async def get_todos(session: Session = Depends(get_session)):
    # session 自动创建和关闭
    # ... 使用 session
    return result
```

### 3. 服务层 - 业务逻辑

```python
from sqlmodel import Session, select
from datetime import datetime
from typing import Optional, Sequence

from ..models.todo import Todo, TodoCreate, TodoUpdate

class TodoService:
    """
    业务逻辑层
    
    职责：
    1. 封装数据库操作
    2. 实现业务规则
    3. 处理事务
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_todos(self, skip: int = 0, limit: int = 100) -> Sequence[Todo]:
        """
        查询全部 Todo，支持分页
        
        Args:
            skip: 跳过多少条记录（用于分页）
            limit: 最多返回多少条记录
        """
        statement = select(Todo).offset(skip).limit(limit=limit)
        return self.session.exec(statement=statement).all()
    
    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        """通过 ID 查询单个 Todo"""
        return self.session.get(Todo, todo_id)
    
    def create_todo(self, todo_create: TodoCreate) -> Todo:
        """
        创建新的 Todo
        
        流程：
        1. 验证数据（Pydantic 自动完成）
        2. 创建模型实例
        3. 添加到会话
        4. 提交事务
        5. 刷新获取最新数据（如数据库生成的 id）
        """
        # model_validate 将 Pydantic 模型转换为 SQLModel 模型
        todo = Todo.model_validate(todo_create)
        self.session.add(todo)
        self.session.commit()      # 提交到数据库
        self.session.refresh(todo) # 刷新以获取数据库生成的值
        return todo
    
    def update_todo(self, todo_id: int, todo_update: TodoUpdate) -> Optional[Todo]:
        """
        更新 Todo
        
        exclude_unset=True 的作用：
        只更新提供的字段，未提供的字段保持不变
        """
        todo = self.get_todo_by_id(todo_id=todo_id)
        if not todo:
            return None
        
        # 获取更新的数据（排除未设置的字段）
        todo_data = todo_update.model_dump(exclude_unset=True)
        
        # 动态设置属性
        for key, value in todo_data.items():
            setattr(todo, key, value)
        
        # 更新时间戳
        todo.updated_at = datetime.now()
        
        self.session.add(todo)
        self.session.commit()
        self.session.refresh(todo)
        
        return todo
    
    def delete_todo(self, todo_id: int) -> bool:
        """删除 Todo"""
        todo = self.get_todo_by_id(todo_id=todo_id)
        if not todo:
            return False
        
        self.session.delete(todo)
        self.session.commit()
        return True
```

### 4. 路由层 - API 端点

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ..database.database import get_session
from ..models.todo import TodoCreate, TodoUpdate, TodoResponse
from ..services.todo_service import TodoService

# 创建路由实例
router = APIRouter(
    prefix="/todo",      # URL 前缀
    tags=["todos"]       # API 文档分组标签
)

@router.get(
    path="/",
    response_model=List[TodoResponse]  # 指定响应模型
)
async def get_todos(
    skip: int = 0,                     # 查询参数，带默认值
    limit: int = 100,
    session: Session = Depends(get_session)  # 依赖注入
):
    """
    获取所有待办事项
    
    - **skip**: 跳过的记录数
    - **limit**: 返回的最大记录数
    """
    todo_service = TodoService(session=session)
    todos = todo_service.get_todos(skip=skip, limit=limit)
    return todos

@router.get(
    path="/{todo_id}",
    response_model=TodoResponse
)
async def get_todo(
    todo_id: int,                      # 路径参数
    session: Session = Depends(get_session)
):
    """获取单个待办事项"""
    todo_service = TodoService(session=session)
    todo = todo_service.get_todo_by_id(todo_id=todo_id)
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项"
        )
    return todo

@router.post(
    path="/",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED  # 返回 201 状态码
)
async def create_todo(
    todo: TodoCreate,                  # 请求体，自动验证
    session: Session = Depends(get_session)
):
    """创建新的待办事项"""
    todo_service = TodoService(session=session)
    return todo_service.create_todo(todo)

@router.put(
    path="/{todo_id}",
    response_model=TodoResponse
)
async def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    session: Session = Depends(get_session)
):
    """更新待办事项"""
    todo_service = TodoService(session=session)
    updated_todo = todo_service.update_todo(
        todo_id=todo_id,
        todo_update=todo_update
    )
    
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项"
        )
    return updated_todo

@router.delete(
    path="/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT  # 删除成功返回 204
)
async def delete_todo(
    todo_id: int,
    session: Session = Depends(get_session)
):
    """删除待办事项"""
    todo_service = TodoService(session=session)
    success = todo_service.delete_todo(todo_id=todo_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到id为{todo_id}的待办事项"
        )
    return None
```

#### 路由装饰器详解

```python
@router.get(
    path="/",                          # URL 路径
    response_model=List[TodoResponse], # 响应数据模型
    summary="获取所有待办事项",         # API 文档摘要
    description="详细描述...",          # API 文档描述
    tags=["todos"],                    # 文档分组
    status_code=200                    # 成功状态码
)
```

#### 参数类型

```python
# 路径参数 /todo/{id}
@router.get("/{todo_id}")
async def get_todo(todo_id: int):  # 从 URL 路径中提取
    pass

# 查询参数 /todo?skip=0&limit=10
@router.get("/")
async def get_todos(
    skip: int = 0,      # 带默认值
    limit: int = 100
):
    pass

# 请求体（POST/PUT）
@router.post("/")
async def create_todo(todo: TodoCreate):  # JSON 请求体
    pass

# 依赖注入
async def func(session: Session = Depends(get_session)):
    pass  # FastAPI 自动调用 get_session()
```

### 5. 应用主入口

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import create_db_and_tables
from .routers import todo_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期管理
    
    startup: 应用启动时执行
    shutdown: 应用关闭时执行
    """
    # Startup - 创建数据库表
    create_db_and_tables()
    yield  # 应用运行期间
    # Shutdown - 清理资源（如果需要）
    pass


# 创建 FastAPI 应用实例
app = FastAPI(
    title="Todo API",           # API 标题
    description="简单Todo的API", # API 描述
    version="2.0.0",            # API 版本
    lifespan=lifespan           # 生命周期管理
)

# CORS 配置 - 允许前端访问
origins = [
    "http://localhost:5173",  # 前端开发服务器
    "http://localhost:4173",  # 前端预览服务器
    "http://localhost:3000",  # 备用端口
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # 允许的域名
    allow_credentials=True,     # 允许携带凭证（cookies）
    allow_methods=["*"],        # 允许所有 HTTP 方法
    allow_headers=["*"],        # 允许所有请求头
)

# 注册路由
app.include_router(todo_router)


@app.get(path="/", tags=["root"])
async def read_root():
    """根路径 - 健康检查"""
    return {
        "message": "欢迎使用ToDo待办API",
        "version": "2.0.0"
    }
```

---

## 代码逐行讲解

### 数据流完整流程

```
用户请求
    ↓
GET /todo/1
    ↓
┌─────────────────────────────────────┐
│ 1. FastAPI 路由匹配                  │
│    @router.get("/{todo_id}")        │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. 依赖注入 - 获取数据库会话          │
│    session: Session = Depends(...)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. 调用服务层                        │
│    todo_service = TodoService(...)  │
│    todo = todo_service.get_todo...  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. 数据库查询                        │
│    session.get(Todo, todo_id)       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. 数据验证（Pydantic）              │
│    自动验证 response_model          │
└─────────────────────────────────────┘
    ↓
JSON 响应
{
    "id": 1,
    "item": "学习 FastAPI",
    ...
}
```

---

## 最佳实践

### 1. 模型设计原则

```python
# ✅ 好的做法：明确的模型分离
class TodoBase(SQLModel):
    """共享字段"""
    item: str
    priority: int

class TodoCreate(TodoBase):
    """创建用 - 不需要 id"""
    pass

class TodoResponse(TodoBase):
    """响应用 - 包含所有字段"""
    id: int
    created_at: datetime

# ❌ 避免：一个模型到处用
class Todo(SQLModel, table=True):
    # 混淆了数据库模型和 API 模型
    pass
```

### 2. 错误处理

```python
# ✅ 在服务层返回 None，在路由层抛出异常
# service.py
def get_todo(self, id: int) -> Optional[Todo]:
    return self.session.get(Todo, id)  # 找不到返回 None

# router.py
@router.get("/{id}")
async def get_todo(id: int):
    todo = service.get_todo(id)
    if not todo:
        raise HTTPException(status_code=404, detail="Not found")
    return todo

# ❌ 避免在服务层直接抛 HTTP 异常
```

### 3. 日志记录

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/")
async def create_todo(todo: TodoCreate):
    logger.info(f"Creating todo: {todo.item}")
    try:
        new_todo = service.create_todo(todo)
        logger.info(f"Created todo with id: {new_todo.id}")
        return new_todo
    except Exception as e:
        logger.error(f"Failed to create todo: {e}")
        raise
```

### 4. 配置管理

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./todos.db"
    debug: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()

# 使用
engine = create_engine(settings.database_url)
```

---

## 常见错误与解决方案

### 错误 1: ImportError: cannot import name 'Field' from 'sqlmodel'

**原因**：SQLModel 版本不兼容

**解决**：
```bash
pip install --upgrade sqlmodel
```

### 错误 2: sqlalchemy.exc.OperationalError: no such table

**原因**：数据库表未创建

**解决**：
```python
# 启动时确保调用
create_db_and_tables()
```

### 错误 3: CORS 错误

**原因**：前端域名不在允许列表中

**解决**：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 添加你的前端地址
    # ...
)
```

### 错误 4: Validation Error

**原因**：请求数据不符合模型定义

**解决**：检查请求数据格式，查看自动生成的文档 `/docs`

---

## 进阶学习路线

### 第一阶段：巩固基础

- [ ] 阅读 FastAPI 官方文档
- [ ] 练习 CRUD 操作
- [ ] 理解异步编程

### 第二阶段：进阶功能

- [ ] 用户认证（JWT）
- [ ] 数据库迁移（Alembic）
- [ ] 测试编写（pytest）

### 第三阶段：生产部署

- [ ] Docker 容器化
- [ ] 使用 PostgreSQL
- [ ] Nginx 反向代理

### 推荐资源

1. **FastAPI 官方文档**: https://fastapi.tiangolo.com/
2. **SQLModel 文档**: https://sqlmodel.tiangolo.com/
3. **SQLAlchemy 文档**: https://docs.sqlalchemy.org/

---

## 总结

通过本教程，你应该已经理解了：

✅ FastAPI 的基本工作原理  
✅ SQLModel 的模型定义和使用  
✅ 分层架构的设计思想  
✅ RESTful API 的设计规范  
✅ 依赖注入和数据库会话管理  

下一步：[查看前端教程](./frontend-tutorial.md) 了解 React 如何与后端交互！

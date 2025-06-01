from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import create_db_and_tables
from .routers import todo_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
    pass


app = FastAPI(
    title="Todo API", description="简单Todo的API", version="2.0.0", lifespan=lifespan
)

origins = [
    "http://localhost:5173",  # 前端开发服务器
    "http://localhost:4173",  # 前端预览服务器
    "http://localhost:3000",  # 备用端口
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_router)


@app.get(path="/", tags=["root"])
async def read_root():
    return {"message": "欢迎使用ToDo待办API", "version": "2.0.0"}

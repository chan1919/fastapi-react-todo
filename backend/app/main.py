from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

from .database.database import create_db_and_tables
from .routers import todo_router

# 安全修复：配置日志级别
# 问题：生产环境中不应输出过多日志信息
# 最佳实践：通过环境变量控制日志级别
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    logger.info("数据库初始化完成")
    yield
    logger.info("应用关闭")


app = FastAPI(
    title="Todo API", 
    description="简单Todo的API", 
    version="2.0.0", 
    lifespan=lifespan
)

# 安全修复：CORS配置优化
# 问题：原始配置虽然限制了origins，但allow_credentials=True配合allow_origins=["*"]是危险的
# 当前配置：只允许特定来源，这是正确的做法
# 最佳实践：
# 1. 生产环境中origins应该使用环境变量配置
# 2. 避免在allow_credentials=True时使用通配符origins
# 3. 限制允许的方法和头部
origins = [
    "http://localhost:5173",  # 前端开发服务器
    "http://localhost:4173",  # 前端预览服务器
    "http://localhost:3000",  # 备用端口
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # 安全修复：明确指定允许的方法，而不是["*"]
    allow_headers=["Content-Type", "Authorization"],  # 安全修复：明确指定允许的头部
)


# 安全修复：添加全局异常处理
# 问题：原始代码没有统一处理异常，可能导致：
# 1. 敏感错误信息泄露给客户端
# 2. 不一致的错误响应格式
# 3. 难以追踪的错误日志
# 最佳实践：使用异常处理器捕获所有异常并返回统一格式

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    处理请求验证错误
    返回友好的错误信息，不暴露内部细节
    """
    # 安全修复：只返回必要的错误信息，不暴露详细的路由信息
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append({"field": field, "message": message})
    
    logger.warning(f"请求验证失败: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": "输入数据验证失败", "errors": errors},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    全局异常处理器
    捕获所有未处理的异常，返回统一的错误响应
    
    安全修复：
    - 不向客户端暴露敏感的错误堆栈信息
    - 记录详细错误日志用于调试
    - 返回友好的错误消息
    """
    logger.error(f"未处理的异常: {type(exc).__name__}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误，请稍后重试"},
    )


app.include_router(todo_router)


@app.get(path="/", tags=["root"])
async def read_root():
    return {"message": "欢迎使用ToDo待办API", "version": "2.0.0"}

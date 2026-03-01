from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
from typing import Generator
import os
import logging

# 安全修复：配置日志
logger = logging.getLogger(__name__)

# 获取根目录
Base_DIR = Path(__file__).resolve().parent.parent.parent

# 确保数据库目录存在
DB_DIR = Base_DIR / "app" / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)

# 安全修复：数据库文件位置安全检查
# 问题：SQLite数据库文件存储在应用代码目录内，可能存在以下风险：
# 1. 数据库文件可能被版本控制系统意外提交（敏感数据泄露）
# 2. 应用更新时可能覆盖数据库文件（数据丢失）
# 最佳实践：
# - 生产环境应使用环境变量配置数据库路径
# - 数据库文件应存储在独立的数据目录
# - 确保数据库文件权限设置正确
DB_PATH = DB_DIR / 'todos.db'

# 安全修复：支持环境变量配置数据库路径
# 允许通过环境变量覆盖默认数据库路径
env_db_path = os.environ.get("DATABASE_PATH")
if env_db_path:
    DB_PATH = Path(env_db_path)
    logger.info(f"使用环境变量配置的数据库路径: {DB_PATH}")

# sqlite
SQLITE_URL = f"sqlite:///{DB_PATH}"

# 安全修复：关闭生产环境中的SQL日志
# 问题：echo=True会在日志中输出所有SQL语句，可能暴露敏感数据
# 解决：根据环境变量控制日志输出
# 最佳实践：生产环境应设置 echo=False
ECHO_SQL = os.environ.get("ECHO_SQL", "true").lower() == "true"
if os.environ.get("ENVIRONMENT", "development") == "production":
    ECHO_SQL = False
    logger.info("生产环境：已禁用SQL日志")

engine = create_engine(
    SQLITE_URL, 
    echo=ECHO_SQL, 
    connect_args={"check_same_thread": False}
)


def create_db_and_tables():
    """
    创建数据库和表
    
    安全修复：添加异常处理
    - 问题：原始代码没有处理数据库创建失败的情况
    - 解决：捕获异常并记录日志
    """
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("数据库表创建/验证完成")
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")
        raise


# 依赖函数,方便自动管理session会话
def get_session() -> Generator[Session, None, None]:
    """
    获取数据库会话
    
    安全修复：添加异常处理和资源清理
    - 问题：原始代码没有处理会话异常
    - 解决：使用上下文管理器确保资源正确释放
    """
    with Session(engine) as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"数据库会话错误: {e}")
            session.rollback()
            raise

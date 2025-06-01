from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
from typing import Generator

# 获取根目录
Base_DIR = Path(__file__).resolve().parent.parent.parent

# sqlite
SQLITE_URL = f"sqlite:///{(Base_DIR / 'app' / 'todos.db')}"

engine = create_engine(SQLITE_URL, echo=True, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# 依赖函数,方便自动管理session会话
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# 前端开发教程

本教程将带你从零开始理解这个 Todo 应用的前端部分，包括 React 核心概念、TypeScript 类型系统、状态管理等。

## 📚 目录

1. [React 基础概念](#react-基础概念)
2. [TypeScript 入门](#typescript-入门)
3. [项目结构解析](#项目结构解析)
4. [组件详解](#组件详解)
5. [状态管理](#状态管理)
6. [样式处理](#样式处理)
7. [常见问题与解决方案](#常见问题与解决方案)

---

## React 基础概念

### 什么是 React？

React 是 Facebook（现 Meta）开发的用于构建用户界面的 JavaScript 库。它的核心思想是：

**组件化**：将 UI 拆分成独立、可复用的小块
**声明式**：你只需要描述 UI 应该长什么样，React 负责更新 DOM
**单向数据流**：数据从父组件流向子组件，易于追踪和管理

### JSX 语法

JSX 是一种 JavaScript 的语法扩展，看起来像 HTML：

```tsx
// 这是一个 JSX 组件
const Hello = () => {
  return <h1>Hello, World!</h1>;
};
```

**关键规则**：
- 必须有一个根元素包裹所有内容
- 使用 `className` 代替 `class`
- 使用 `{}` 嵌入 JavaScript 表达式
- 标签必须闭合

### 函数组件 vs 类组件

现代 React 推荐使用**函数组件**配合 Hooks：

```tsx
// ✅ 推荐：函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// ❌ 不推荐：类组件（代码更冗长）
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Props（属性）

Props 是组件之间传递数据的方式，**只读**（不能修改）：

```tsx
interface GreetingProps {
  name: string;
  age?: number;  // ? 表示可选
}

const Greeting: React.FC<GreetingProps> = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
};

// 使用组件
<Greeting name="Alice" age={25} />
<Greeting name="Bob" />  // age 是可选的
```

### State（状态）

State 是组件内部管理的数据，当 state 变化时，组件会重新渲染：

```tsx
import { useState } from 'react';

const Counter = () => {
  // useState 返回 [当前值, 更新函数]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
};
```

**重要原则**：
- State 是异步更新的
- 不要直接修改 state，始终使用 setter 函数
- 更新对象/数组时，创建新引用而非修改原值

### 常用 Hooks

#### useEffect - 副作用处理

用于处理数据获取、订阅、手动 DOM 操作等：

```tsx
import { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 组件挂载时执行
    fetchUsers().then(data => setUsers(data));

    // 可选：清理函数（组件卸载时执行）
    return () => {
      console.log('Component unmounting...');
    };
  }, []); // 空依赖数组 = 只在挂载时执行

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

**依赖数组说明**：
- `[]`：只在组件挂载和卸载时执行
- `[prop]`：prop 变化时执行
- 不写：每次渲染都执行

#### useContext - 上下文

用于跨组件共享数据，避免 props drilling：

```tsx
// 1. 创建 Context
const ThemeContext = createContext('light');

// 2. 提供者组件
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. 消费者组件
const ThemedButton = () => {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
};
```

---

## TypeScript 入门

### 为什么使用 TypeScript？

- **类型安全**：在编码阶段捕获错误
- **智能提示**：IDE 自动补全和文档提示
- **重构友好**：重命名变量时自动更新所有引用
- **自文档化**：类型定义本身就是文档

### 基础类型

```typescript
// 基本类型
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;

// 数组
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// 对象
interface Person {
  name: string;
  age: number;
  email?: string;  // 可选属性
}

let person: Person = {
  name: "Alice",
  age: 25
};

// 联合类型
let id: string | number = "abc123";
id = 123;  // 也可以

// 字面量类型
type Status = "pending" | "completed" | "cancelled";
let status: Status = "pending";
```

### 接口 (Interface)

定义对象的形状：

```typescript
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// 继承
interface TodoWithPriority extends Todo {
  priority: 1 | 2 | 3 | 4 | 5;
}

// 可选属性 & 只读属性
interface Config {
  readonly apiUrl: string;  // 初始化后不能修改
  timeout?: number;          // 可选
}
```

### 泛型 (Generics)

创建可复用的组件/函数：

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("hello");  // T 是 string
identity<number>(42);       // T 是 number

// 泛型接口
interface ApiResponse<T> {
  data: T;
  error?: string;
}

const todoResponse: ApiResponse<Todo> = {
  data: { id: 1, title: "Learn TS", completed: false }
};
```

### React 中的 TypeScript

```tsx
// 组件 Props 类型
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// 事件类型
const Input = () => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked!');
  };

  return <input onChange={handleChange} />;
};
```

---

## 项目结构解析

```
frontend/
├── src/
│   ├── api/           # API 请求封装
│   │   └── todoApi.ts
│   ├── components/    # UI 组件
│   │   ├── Header.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoItem.tsx
│   │   └── Todos.tsx
│   ├── context/       # React Context
│   │   └── TodoContext.tsx
│   ├── layouts/       # 布局组件
│   │   └── MainLayout.tsx
│   ├── types/         # TypeScript 类型定义
│   │   └── todo.ts
│   ├── App.tsx        # 根组件
│   └── main.tsx       # 应用入口
├── public/            # 静态资源
└── package.json       # 项目配置
```

### 目录组织原则

1. **按功能分组**：相关文件放在一起
2. **分离关注点**：UI、逻辑、API 分层
3. **类型集中**：类型定义统一放在 types 目录

---

## 组件详解

### 1. App.tsx - 应用入口

```tsx
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import { TodoProvider } from "./context/TodoContext";
import MainLayout from "./layouts/MainLayout";
import Todos from "./components/Todos";

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: "#1890ff", borderRadius: 10 },
      }}
    >
      <TodoProvider>
        <MainLayout>
          <Todos />
        </MainLayout>
      </TodoProvider>
    </ConfigProvider>
  );
};
```

**要点**：
- `ConfigProvider`：Ant Design 的全局配置
- `TodoProvider`：提供全局状态
- 组件嵌套形成层级结构

### 2. Todos.tsx - 主组件

这是应用的核心组件，展示待办列表并处理交互：

```tsx
const Todos: React.FC = () => {
  const { todos, loading, error } = useTodoContext();
  
  // 本地状态管理筛选条件
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'alpha'>('date');

  // 根据条件过滤和排序
  const filteredTodos = useMemo(() => {
    let result = [...todos];
    
    // 状态筛选
    if (filterStatus === 'active') {
      result = result.filter(t => !t.isCompleted);
    } else if (filterStatus === 'completed') {
      result = result.filter(t => t.isCompleted);
    }
    
    // 排序逻辑...
    return result;
  }, [todos, filterStatus, sortBy]);

  return (
    <div className="todos-container">
      {/* UI 渲染 */}
    </div>
  );
};
```

**useMemo 的作用**：
- 缓存计算结果，避免不必要的重计算
- 只有依赖项变化时才重新计算

### 3. TodoItem.tsx - 单项组件

展示单个待办事项，支持编辑和删除：

```tsx
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updates: Partial<Todo>) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
      {/* 渲染逻辑 */}
    </div>
  );
};
```

---

## 状态管理

### 为什么选择 Context？

对于中小型应用，Context 足够好用：

✅ **优点**：
- 无需额外库，React 内置
- 学习曲线平缓
- 适合全局状态不多的场景

❌ **缺点**：
- 频繁更新时性能不佳
- 没有中间件、时间旅行等高级功能

### TodoContext 实现解析

```tsx
// 1. 定义 Context 类型
interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchAllTodos: () => Promise<void>;
  addTodo: (todo: TodoCreateRequest) => Promise<void>;
  updateTodoItem: (id: number, todo: TodoUpdateRequest) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
}

// 2. 创建 Context
const TodoContext = createContext<TodoContextType>({
  // 默认值...
});

// 3. Provider 组件
export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 各种操作方法...
  const fetchAllTodos = async () => {
    setLoading(true);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TodoContext.Provider value={{ todos, loading, error, fetchAllTodos, ... }}>
      {children}
    </TodoContext.Provider>
  );
};

// 4. 自定义 Hook 简化使用
export const useTodoContext = () => useContext(TodoContext);
```

### 使用 Context

```tsx
const MyComponent = () => {
  const { todos, addTodo, loading } = useTodoContext();

  if (loading) return <Spin />;

  return (
    <div>
      {todos.map(todo => <TodoItem key={todo.id} {...todo} />)}
    </div>
  );
};
```

---

## 样式处理

### CSS Modules vs 普通 CSS

本项目使用普通 CSS 文件 + BEM 命名规范：

```css
/* TodoItem.css */
.todo-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.todo-item--completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.todo-item__title {
  flex: 1;
  font-size: 16px;
}

.todo-item__actions {
  display: flex;
  gap: 8px;
}
```

**BEM 命名法**：
- `.block`：块级元素
- `.block__element`：块内的元素
- `.block--modifier`：修饰符（状态/变体）

### Ant Design 组件定制

通过 `ConfigProvider` 和组件 props 定制主题：

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 10,
    },
  }}
>
  <Button type="primary">主要按钮</Button>
</ConfigProvider>
```

---

## 常见问题与解决方案

### Q1: 为什么我的组件无限重新渲染？

**原因**：useEffect 依赖设置不当，或每次渲染都创建新的对象/函数引用。

**解决**：
```tsx
// ❌ 错误：每次渲染都创建新对象
useEffect(() => {
  fetchData({ page: 1, size: 10 });
}, []);

// ✅ 正确：使用 useMemo 缓存配置
const config = useMemo(() => ({ page: 1, size: 10 }), []);
useEffect(() => {
  fetchData(config);
}, [config]);
```

### Q2: 如何处理表单输入？

```tsx
const [form, setForm] = useState({ title: '', description: '' });

const handleChange = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
};

<Input 
  value={form.title}
  onChange={e => handleChange('title', e.target.value)}
/>
```

### Q3: 如何实现防抖搜索？

```tsx
import { useState, useEffect } from 'react';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // 延迟 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm) {
      performSearch(debouncedTerm);
    }
  }, [debouncedTerm]);

  return <Input onChange={e => setSearchTerm(e.target.value)} />;
};
```

### Q4: 如何优化列表渲染性能？

```tsx
// 1. 使用正确的 key（不要用 index）
{todos.map(todo => (
  <TodoItem key={todo.id} {...todo} />  // ✅ 使用唯一 ID
))}

// 2. 使用 React.memo 防止不必要重渲染
const TodoItem = React.memo(({ todo, onUpdate }) => {
  return <div>{todo.title}</div>;
});

// 3. 使用 useCallback 缓存回调函数
const handleUpdate = useCallback((id: number) => {
  updateTodo(id);
}, [updateTodo]);
```

---

## 最佳实践总结

1. **组件设计**
   - 单一职责：每个组件只做一件事
   - Props 最小化：只传递必要数据
   - 容器组件 vs 展示组件分离

2. **状态管理**
   - 优先使用本地状态
   - 真正需要共享的状态才放 Context
   - 避免过度使用 Context

3. **性能优化**
   - 合理使用 useMemo/useCallback
   - 列表使用正确的 key
   - 懒加载大型组件

4. **TypeScript**
   - 严格启用 strict mode
   - 避免使用 any
   - 善用类型推断

---

## 扩展学习资源

- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Ant Design 组件库](https://ant.design/)
- [React Patterns](https://reactpatterns.com/)

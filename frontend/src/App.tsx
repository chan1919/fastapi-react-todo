import React from "react";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import { TodoProvider } from "./context/TodoContext";
import MainLayout from "./layouts/MainLayout";
import Todos from "./components/Todos";
import "./App.css";

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 10,
        },
        algorithm: theme.defaultAlgorithm,
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

export default App;

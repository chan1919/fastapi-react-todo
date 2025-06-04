import React from "react";
import { Layout, Typography, theme } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import "./Header.css";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <Header className="app-header" style={{ backgroundColor: token.colorPrimary }}>
      <div className="header-content">
        <CheckCircleOutlined className="header-icon" />
        <Title level={3} className="header-title">
          待办事项管理
        </Title>
      </div>
    </Header>
  );
};

export default AppHeader;

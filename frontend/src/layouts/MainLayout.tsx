import React, { ReactNode } from 'react';
import { Layout } from 'antd';
import Header from '../components/Header';
import './MainLayout.css';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className="main-layout">
      <Header />
      <Content className="main-content">
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;

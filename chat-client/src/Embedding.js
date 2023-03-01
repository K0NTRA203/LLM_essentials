import { useState, useEffect } from 'react';
import { Menu, Layout, Modal, Input, Checkbox, List, Spin, message, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

const EMBEDDING_TYPES = ['folder', 'website', 'pdf', 'online pdf'];

const Embedding = () => {
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedEmbeddings, setSelectedEmbeddings] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addModalType, setAddModalType] = useState('');
  const [addModalResult, setAddModalResult] = useState('');
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [addModelName, setAddModelName] = useState('');
  const [addModelBase, setAddModelBase] = useState('');
  const [addModelEmbeddings, setAddModelEmbeddings] = useState([]);

  useEffect(() => {
    // Fetch menu items
    fetch('/embedding/menu-items')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch menu items.');
        }
        return res.json();
      })
      .then(data => {
        setMenuItems(data);
      })
      .catch(error => {
        console.error(error);
        message.error('Failed to fetch menu items.');
      });

    // Fetch models
    fetch('/embedding/models')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch models.');
        }
        return res.json();
      })
      .then(data => {
        setModels(data);
      })
      .catch(error => {
        console.error(error);
        message.error('Failed to fetch models.');
      });
  }, []);


  const handleAddClick = type => {
    setAddModalType(type);
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    // Send request to create embedding
    setAddModalLoading(true);
    try {
      const response = await fetch('/embedding/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addModalResult,
          location: addModalType
        })
      });
      const data = await response.json();
      setAddModalResult(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to create embedding.');
    } finally {
      setAddModalLoading(false);
    }
  };

  const handleEmbedClick = async () => {
    // Send request to embed model
    setAddModalLoading(true);

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addModelName,
          base: addModelBase,
          embeddings: addModelEmbeddings,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add model.');
      }

      message.success('Model added successfully.');
      setIsAddModalVisible(false);
      setAddModelName('');
      setAddModelBase('');
      setAddModelEmbeddings([]);
    } catch (error) {
      console.error(error);
      message.error('Failed to add model.');
    } finally {
      setAddModalLoading(false);
    }
  };
  return (
        <Layout>
        <Sider width={300}>
            <Menu mode="inline">
            <SubMenu key="embeddings" title="All existing embeddings">
                <Menu.Item key="add-embedding" icon={<PlusOutlined />} onClick={() => handleAddClick('')}>
                + ADD
                </Menu.Item>
                {menuItems.map(item => (
                <Menu.Item key={item.id} onClick={() => handleAddClick(item.type)}>
                    {item.name}
                </Menu.Item>
                ))}
            </SubMenu>
            </Menu>
            </Sider>
        <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            </div>
        </Content>
        </Layout>
    </Layout>

);
}

export default Embedding;
     

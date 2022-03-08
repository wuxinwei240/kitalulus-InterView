import React, { Fragment, useEffect, useState } from 'react';
import { Table, Button, InputNumber, Input, Form, Popconfirm, Modal } from 'antd';
import { EditOutlined, FormOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import './interview.scss';

const { info } = Modal;

interface Item {
  id: number;
  descriptions?: string
  title?: string
  genre?: string
  views?: number
  type? : string 
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'input' | 'textarea';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
} : { editing: any, dataIndex: any, title: any, inputType: string, record: any, index: any, children : any  }) => {
  let value, typeList, inputNode;
  if(dataIndex && record) {
    value = record[dataIndex];
  }
  typeList = {
    'number':  <InputNumber value={value || 0}/>,
    'input': <Input value={value || ""}/>,
    'textarea': <Input.TextArea value={value || ""}/>
  } as any;
  inputNode = typeList[inputType];
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};





const Interview = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([] as Item[]);
  const [editingId, setEditingId] = useState(0);
  const [filter, setFilter] = useState(false);
  const [filterTilteValue, setFilterTilteValue] = useState('');
  const [filterGenreValue, setFilterGenreValue] = useState('');


  const isEditing = (record: Item) => record.id === editingId;

  const edit = (record: Partial<Item> & { id: number }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingId(record.id);
  };
  const cancel = () => {
    setEditingId(0);
  };
  
  useEffect(() => {
    axios.get('https://andywiranata-42555.firebaseio.com/test-frontend/items.json')
    .then(res => {
      const list = res.data.map((item: Item, index: number) => {
        return {
          ...item,
          id: index + 1
        }
      });
      //过滤的时候取这份数据
      localStorage.setItem('list', JSON.stringify(list));
      setData(list);
    })
  },[])

  const save = async (id: number) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...data] as Item[];
      const index = newData.findIndex((item: Item) => id === item.id);
      if (index > -1) {
        const item: Item = newData[index];
        const rowData = {...item, ...row} as Item;
        const newRowData = {...rowData} as Item;
        axios.put('https://andywiranata-42555.firebaseio.com/test-frontend/items/0.json', newRowData)
        .then((res) => {
          if(res.data){
            newData.splice(index, 1, rowData);
            setData(newData);
            setEditingId(0);
          }
        })
       
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  }
  const handleConfirm = (text: string) => {
    info({
      title: text,
      icon: null,
      okText: '关闭',
    });
  };
  
  const filterTilte = (e: any) => {
    const { value }= e.target;
    const localList = localStorage.getItem('list') || '';
    const list = JSON.parse(localList) || [];
    const filterList = list.filter((item: any) => 
      item.title.indexOf(value) > -1
    )
    filterList.unshift({id: -1})
    setFilterTilteValue(value);
    setData(filterList);
    setFilter(true);
  };
  const filtergGenre = (e: any) => {
    const { value }= e.target;
    const localList = localStorage.getItem('list') || '';
    const list = JSON.parse(localList) || [];
    const filterList = list.filter((item: any) => 
      item.genre.indexOf(value) > -1
    )
    filterList.unshift({id: -1})
    setFilterGenreValue(value);
    setData(filterList);
    setFilter(true);
  };
  const columns = [
    {
      title: 'no',
      dataIndex: 'id',
      key: 'id',
      width: '50px',
      render: (text: string, record: Item) => {
        if(record.id === -1 ){
          return ''
        }
        return text;
      }
    },
    {
      title: 'title',
      dataIndex: 'title',
      key: 'title',
      editable: true,
      width: '150px',
      render: (text: string, record: Item) => {
        if(record.id === -1 ){
          return <Input placeholder="过滤title" value={filterTilteValue} onInput={filterTilte}/>
        }
        return text;
      }
    },
    {
      title: 'views',
      dataIndex: 'views',
      key: 'views',
      editable: true,
      width: '100px',
    },
    {
      title: 'genre',
      dataIndex: 'genre',
      key: 'genre',
      editable: true,
      width: '150px',
      render: (text: string, record: Item) => {
        if(record.id === -1 ){
          return <Input placeholder="过滤genre" value={filterGenreValue} onInput={filtergGenre}/>
        }
        return text;
      }
    },
    {
      title: 'descriptions',
      dataIndex: 'descriptions',
      key: 'descriptions',
      editable: true,
      width: '150px',
      render: (text: string, record: Item) =>{
        if(record.id === -1) {
          return ""
        }
        return <>
          <p className="descriptions">{text}</p>
          <ExclamationCircleOutlined  onClick={() =>handleConfirm(text)}/>
        </>
      } 
    },
    {
      title: 'option',
      dataIndex: '',
      key: 'option',
      width: '200px',
      render:(_: any, record: Item) => {
        if(record.id === -1) {
          return ""
        }
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button 
              type="primary" 
              onClick={() => save(record.id)} 
              style={{ marginRight: 8 }} 
              shape="round" 
              icon={<SaveOutlined />} 
              size='small'>保存</Button>
            <Popconfirm title="确定取消?" onConfirm={cancel}>
              <Button type="primary" shape="round" icon={<EditOutlined />} size='small'>取消</Button>
            </Popconfirm>
          </span>
        ) : (
          <Button 
            type="primary" 
            shape="round" 
            disabled={editingId !== 0} 
            onClick={() => edit(record)} 
            icon={<FormOutlined />} 
            size='small'>编辑
          </Button>
        );
      }
    }
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    const hash: any = {
      "descriptions": "textarea",
      "title": "input",
      "views": "number",
      "genre": "input",
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: hash[col.dataIndex],
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const FilterSwitch = () => {
    if(filter) {
      data.shift();
      setFilter(false);
      setFilterTilteValue('');
      setFilterGenreValue('');
      setData([...data]);
    }else {
      data.unshift({id: -1})
      setFilter(true);
      setData([...data]);
    }
  }
  return(
    <div className="interview">
      <div className="main">
        <Button type="primary" onClick={FilterSwitch}>过滤</Button>
        <Form form={form} component={false}>
          <Table 
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            rowKey={(record)=> record.id}
            columns={mergedColumns}
            bordered 
            rowClassName="editable-row"
            dataSource={data}
            pagination={{
              onChange: cancel,
            }}>
          </Table>
        </Form>
      </div>
    </div>
  )
}

export default Interview
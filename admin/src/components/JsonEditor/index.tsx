import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import { Form, Input, Button, Modal, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { isJSON } from '@/utils';
import { isString } from 'lodash';
// import Ajv from 'ajv';

// const ajv = new Ajv({ allErrors: true, verbose: true });
// export default function JsonEditor(props) {

//   return <Editor value={props.value} onChange={props.onChange } />;
// }

const JsonEditorFormItem = ({ value, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [jsonValue, setJsonValue] = useState(value || {});
  const [jsonValue, setJsonValue] = useState(value || {}); // 格式化 JSON

  // 打开 Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭 Modal
  const handleOk = () => {
    setIsModalVisible(false);
    // setInputValue(JSON.stringify(jsonValue, null, 2)); // 同步 JSON 编辑器的值到 Input
    onChange(isJSON(jsonValue) ? JSON.stringify(jsonValue) : jsonValue)
  };


  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const handleChange = (e) => {
    setJsonValue(e);
  };

  useEffect(() => {
    if(value){
      //TODO 适配多种情况
      // isJSON(jsonValue) ? JSON.stringify(jsonValue) : jsonValue
      setJsonValue(JSON.parse(value))
    }
  },[])

  const inputValue = useMemo(() => {
    return isString(jsonValue) ? jsonValue : JSON.stringify(jsonValue)
  }, [jsonValue]);
  // // 处理 JSON 编辑器中的修改
  // const handleJsonChange = (edit) => {
  //   setJsonValue(edit.updated_src); // 更新 JSON 数据
  // };

  return (
    <>
      <Space direction="horizontal">
        <Input style={{width:'150px'}}  value={inputValue} onChange={(e) => setInputValue(e.target.value)} readOnly />
        <Button onClick={showModal}>编辑</Button>
      </Space>

      <Modal
        title="JSON 编辑器"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <div style={{ height: '70vh' }}>
          <Editor
            mode="code"
            value={jsonValue}
            onChange={handleChange}
            tag="span"
            style={{ height:'100%' }}
          />
        </div>
      </Modal>
    </>
  );
};

export default JsonEditorFormItem;

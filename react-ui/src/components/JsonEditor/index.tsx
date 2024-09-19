import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import { Form, Input, Button, Modal } from 'antd';
import { useState } from 'react';
// import Ajv from 'ajv';

// const ajv = new Ajv({ allErrors: true, verbose: true });
// export default function JsonEditor(props) {

//   return <Editor value={props.value} onChange={props.onChange } />;
// }

const JsonEditorFormItem = ({ value, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jsonValue, setJsonValue] = useState(value || {});
  const [inputValue, setInputValue] = useState(JSON.stringify(value || {}, null, 2)); // 格式化 JSON

  // 打开 Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭 Modal
  const handleOk = () => {
    setIsModalVisible(false);
    setInputValue(JSON.stringify(jsonValue, null, 2)); // 同步 JSON 编辑器的值到 Input
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理 JSON 编辑器中的修改
  const handleJsonChange = (edit) => {
    setJsonValue(edit.updated_src); // 更新 JSON 数据
  };

  return (
    <>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        addonAfter={<Button onClick={showModal}>编辑</Button>}
        readOnly
      />
      <Modal
        title="JSON 编辑器"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
      <div style={{height:"80vh"}} >
        <Editor mode="code" value={value} onChange={onChange} style={{ height: '100vh', overflow: 'auto' }} />
      </div>
      </Modal>
    </>
  );
};

export default JsonEditorFormItem;

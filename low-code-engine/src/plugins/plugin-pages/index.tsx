import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { getProjectSchema } from 'src/services/mockService';
import './index.scss';

import type { TreeDataNode } from 'antd';
import { Tree } from 'antd';
import actions from 'src/utils/state';
// import { useModel } from 'umi';
import { event } from '@alilc/lowcode-engine';

const { DirectoryTree } = Tree;

// const buildTreeMenu = (menu) => {
//   return menu.map((item) => {
//     let children = [];
//     if (item.children) {
//       children = buildTreeMenu(item.children);
//     }
//     return {
//       title: item.meta.title,
//       key: item.path,
//       schema: item.query ? item.query : null,
//       children: children,
//     };
//   });
// };

const buildTreeMenu = (menu) => {
  return menu.map((item) => {
    return {
      title: item.menuName,
      key: item.menuId,
      schema: item.query ? JSON.parse(item.query) : null,
      children: buildTreeMenu(item.children || []),
      raw:item
    };
  });
};

const listBuildTree = <T extends Record<string, any> & { children?: T[] }>(
  data: T[],
  currentNodeKey: keyof T,
  parentKey: keyof T,
) => {
  const treeList: any[] = [];
  // 生成一个以 currentNodeKey 为键值的 对象
  const treeNode: Map<string, T> = new Map();
  data.forEach((item) => {
    const currentNodeId = `${item[currentNodeKey]}`;
    treeNode.set(currentNodeId, item);
  });
  data.forEach((item) => {
    const parentNodeId = `${item[parentKey]}`;
    const node = item;
    const parentNode = treeNode.get(parentNodeId);
    if (parentNode) {
      if ('children' in parentNode) {
        parentNode.children && parentNode.children.push(node);
      } else {
        parentNode.children = [];
        parentNode.children.push(node);
      }
    } else {
      treeList.push(node);
    }
  });
  return treeList;
};

let treeData: TreeDataNode[] = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
    ],
  },
];

const PagesPlugin = (ctx: IPublicModelPluginContext) => {
  return {
    async init() {
      const { skeleton, project, config } = ctx;
      const defaultPage = 'login';
      config.set('scenarioName', defaultPage);
      config.set('scenarioDisplayName', defaultPage);
      config.set('scenarioInfo', {});

      // const res = await actions.getState().getRouters();
      const res2 = await actions.getState().getMenuList();
      const menuList = res2.data.filter((item) => item.menuType !== 'F');
      // console.log('menu', res.data, listBuildTree(menuList, 'menuId', 'parentId'));
      const treeList = listBuildTree(menuList, 'menuId', 'parentId')
      treeData = buildTreeMenu(treeList);
      console.log('treeData: ', treeData);
      // globalState.getMenuList()
      // let menuNav: React.JSX.Element[] = [];
      // await createFetch({url: '/onlinecode-api/process/run', method: 'POST', data: {
      //     procCode: 'menuList'
      //   }})
      //   .then((res: any) => {
      //     if (res.status === 200 && res.data && res.data.code === 200) {
      //       const menus = res.data.data;
      //       menuNav = toNav(menus);
      //     }
      //   })
      //   .catch((err: any) => {});

      // function toNav(menus: any[]) {
      //   if (!menus || menus.length === 0) {
      //     return [];
      //   }
      //   let arr: React.JSX.Element[] = [];
      //   menus.forEach(m => {
      //     // 菜单组
      //     if (m.type === '0') {
      //       arr.push(<Nav.SubNav label={m.name}>{toNav(m.children)}</Nav.SubNav>);
      //     } else { // 菜单
      //       if (m.mode === '0') { // schema
      //         arr.push(<Item key={m.code}>{m.name}</Item>);
      //       }
      //     }
      //   });
      //   return arr;
      // }
      let menuItem = {};
      const onSelect = async (keys, event) => {
        console.log('keys, event: ', keys, event.node.schema);
        const key = keys[0];
        let schema = event.node.schema;
        menuItem = event.node.raw;
        //   console.log('selected', key);
        //   // 保存在 config 中用于引擎范围其他插件使用
        config.set('scenarioName', key);
        config.set('scenarioDisplayName', key);
        config.set('scenarioInfo', {});

        if (!schema) {
          schema = await getProjectSchema();
        }
        project.importSchema(schema as any);
        project.simulatorHost?.rerender();
        //   let scenarioSchema = await getProjectSchemaFromDb(key);
        //   if (!scenarioSchema) {
        //     scenarioSchema = await getProjectSchema();
        //     let schema = scenarioSchema?.componentsTree?.[0];
        //     if (schema) {
        //       scenarioSchema.componentsTree[0]['meta'] = {title: key, locator: key, router: '/' + key};
        //     }
        //   }
        //   // 加载schema
        //   project.importSchema(scenarioSchema as any);
        //   project.simulatorHost?.rerender();
      };

      event.on('common:schema', async () => {
        console.log('saveSchema', project.exportSchema(IPublicEnumTransformStage.Save), menuItem);
        menuItem.query = JSON.stringify(project.exportSchema(IPublicEnumTransformStage.Save))
        await actions.getState().updateMenu(menuItem);
      });
      // console.log('event',event);
      // const masterProps = useModel('@@qiankunStateFromMaster');

      // 注册组件面板
      const pagesPane = skeleton.add(
        {
          area: 'leftArea',
          type: 'PanelDock',
          name: 'pagesPane',
          content: () => {
            return (
              <>
                <DirectoryTree
                  multiple
                  showLine
                  height={'85vh'}
                  defaultExpandAll
                  onSelect={onSelect}
                  // onExpand={}
                  treeData={treeData}
                />
              </>
            );
          },
          contentProps: {},
          props: {
            align: 'top',
            icon: 'list',
            description: '页面管理',
          },
        },
        { index: -999 },
      );
      pagesPane?.disable?.();
      project.onSimulatorRendererReady(() => {
        pagesPane?.enable?.();
      });
    },
  };
};
PagesPlugin.pluginName = 'PagesPlugin';
export default PagesPlugin;
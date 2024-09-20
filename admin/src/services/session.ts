import { createIcon } from '@/utils/IconUtil';
import { MenuDataItem } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import React, { lazy } from 'react';

let remoteMenu: any = null;

export function getRemoteMenu() {
  return remoteMenu;
}

export function setRemoteMenu(data: any) {
  remoteMenu = data;
}

const componentMap = {
  PageRender: '@/components/PageRender/index.tsx',
};

function patchRouteItems(route: any, menu: any, parentPath: string) {
  for (const menuItem of menu) {
    if (menuItem.component === 'Layout' || menuItem.component === 'ParentView') {
      if (menuItem.routes) {
        let hasItem = false;
        let newItem = null;
        for (const routeChild of route.routes) {
          if (routeChild.path === menuItem.path) {
            hasItem = true;
            newItem = routeChild;
          }
        }
        if (!hasItem) {
          newItem = {
            path: menuItem.path,
            routes: [],
            children: [],
          };
          route.routes.push(newItem);
        }
        patchRouteItems(newItem, menuItem.routes, parentPath + menuItem.path + '/');
      }
    } else {
      const names: string[] = menuItem.component.split('/');
      let path = '';

      // 普通路径
      if (names.length > 1) {
        names.forEach((name) => {
          if (path.length > 0) {
            path += '/';
          }
          if (name !== 'index') {
            path += name.at(0)?.toUpperCase() + name.substr(1);
          } else {
            path += name;
          }
        });
        if (!path.endsWith('.tsx')) {
          path += '.tsx';
        }
      } else {
        // 内置路径
        path = names[0];
      }

      if (route.routes === undefined) {
        route.routes = [];
      }
      if (route.children === undefined) {
        route.children = [];
      }
      let lastFullPath = lazy(() => import('@/pages/' + path));
      if (componentMap[path]) {
        if (path === 'PageRender') {
          lastFullPath = lazy(() => import('@/components/PageRender/index.tsx'));
        }
      }
      const newRoute = {
        element: React.createElement(lastFullPath),
        path: parentPath + menuItem.path,
      };
      route.children.push(newRoute);
      route.routes.push(newRoute);
    }
  }
}

export function patchRouteWithRemoteMenus(routes: any) {
  if (remoteMenu === null) {
    return;
  }
  let proLayout = null;
  for (const routeItem of routes) {
    if (routeItem.id === 'ant-design-pro-layout') {
      proLayout = routeItem;
      break;
    }
  }
  patchRouteItems(proLayout, remoteMenu, '');
}

/** 获取当前的用户 GET /api/getUserInfo */
export async function getUserInfo(options?: Record<string, any>) {
  return request<API.UserInfoResult>('/api/system/user/getInfo', {
    method: 'GET',
    ...(options || {}),
  });
}

// 刷新方法
export async function refreshToken() {
  return request('/api/auth/refresh', {
    method: 'post',
  });
}

export async function getRouters(): Promise<any> {
  return request('/api/system/menu/getRouters');
}

//  后端query字符串解析后的格式
type RoutersMenuItemQuery = {
  route: {
    [key: string]: any;
  };
  lowcode: {
    schema: {
      [key: string]: any;
    };
  };
};

// 转换为前端需要的路由格式
export function convertCompatRouters(childrens: API.RoutersMenuItem[]): any[] {
  return childrens.map((item: API.RoutersMenuItem) => {
    // 扩展属性 通过json设置
    let extendProps;
    if (
      item.query &&
      JSON.parse(item.query) &&
      (JSON.parse(item.query) as RoutersMenuItemQuery).route
    ) {
      extendProps = JSON.parse(item.query).route;
    } else {
      extendProps = {};
    }

    const res = {
      path: item.path,
      icon: createIcon(item.meta.icon),
      //  icon: item.meta.icon,
      name: item.meta.title,
      routes: item.children ? convertCompatRouters(item.children) : undefined,
      hideChildrenInMenu: item.hidden,
      hideInMenu: item.hidden,
      // component: item.component,
      authority: item.perms,
      query: item.query,
      ...extendProps,
    };
    if(item.component){
      res.component = item.component
    }
    return res
  });
}

export async function getRoutersInfo(): Promise<MenuDataItem[]> {
  return getRouters().then((res) => {
    if (res.code === 200) {
      return convertCompatRouters(res.data);
    } else {
      return [];
    }
  });
}

export function getMatchMenuItem(
  path: string,
  menuData: MenuDataItem[] | undefined,
): MenuDataItem[] {
  if (!menuData) return [];
  let items: MenuDataItem[] = [];
  menuData.forEach((item) => {
    if (item.path) {
      if (item.path === path) {
        items.push(item);
        return;
      }
      if (path.length >= item.path?.length) {
        const exp = `${item.path}/*`;
        if (path.match(exp)) {
          if (item.routes) {
            const subpath = path.substr(item.path.length + 1);
            const subItem: MenuDataItem[] = getMatchMenuItem(subpath, item.routes);
            items = items.concat(subItem);
          } else {
            const paths = path.split('/');
            if (paths.length >= 2 && paths[0] === item.path && paths[1] === 'index') {
              items.push(item);
            }
          }
        }
      }
    }
  });
  return items;
}

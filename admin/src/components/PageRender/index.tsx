import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import  mergeWith  from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { buildComponents, assetBundle, AssetLevel, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import appHelper from './appHelper';
import { getPackagesFromAssets } from './utils';
import { useAppData, useLocation, useParams, useRouteProps, useSelectedRoutes } from '@umijs/max';
import { getRemoteMenu } from '@/services/session';
import { findTreeNodeByProperty } from '@/utils/tree';

function customizer(objValue: [], srcValue: []) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue || []);
  }
}

const Renderer = (props) => {
  const { page } = props;
  const [data, setData] = useState({});
  const { pathname } = useLocation();
  let menuList = getRemoteMenu();

  const [, path1, path2] = pathname.split('/');
  const parentItem = findTreeNodeByProperty(menuList, 'path', '/' + path1, 'routes');
  const targetItem = findTreeNodeByProperty(parentItem, 'path', path2, 'routes');

  let projectSchema;
  if (targetItem.query) {
    projectSchema = JSON.parse(targetItem.query)?.lowcode?.schema;
  }

  async function init() {
    const packages = await getPackagesFromAssets();
    setData({});
    const {
      componentsMap: componentsMapArray,
      componentsTree,
      i18n,
      dataSource: projectDataSource,
    } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const pageSchema = componentsTree[0];

    const libraryMap = {};
    const libraryAsset = [];
    packages.forEach(({ package: _package, library, urls, renderUrls }) => {
      libraryMap[_package] = library;
      if (renderUrls) {
        libraryAsset.push(renderUrls);
      } else if (urls) {
        libraryAsset.push(urls);
      }
    });

    // const vendors = [assetBundle(libraryAsset, AssetLevel.Library)];

    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);
    const components = await injectComponents(buildComponents(libraryMap, componentsMap));

    setData({
      schema: pageSchema,
      components,
      i18n,
      projectDataSource,
    });
  }

  useEffect(() => {
    setData({});
    init();
  }, [page]);

  const { schema, components, i18n = {}, projectDataSource = {} } = data as any;

  if (!schema) {
    return (
      <Spin fullscreen tip={<span style={{ color: '#5584ff' }}>Loading...</span>}>
        <div className="lowcode-plugin-sample-preview" style={{ minHeight: '90vh' }}></div>
      </Spin>
    );
  }

  return (
    <div className="lowcode-plugin-sample-preview" style={{ minHeight: '90vh' }}>
      {!schema ? (
        <Spin style={{ width: '100%', height: '90vh' }} />
      ) : (
        <ReactRenderer
          className="lowcode-plugin-sample-preview-content"
          style={{ height: '100%' }}
          schema={{
            ...schema,
            dataSource: mergeWith(schema.dataSource, projectDataSource, customizer),
          }}
          components={components}
          messages={i18n}
          appHelper={appHelper}
        />
      )}
    </div>
  );
};

export default Renderer;

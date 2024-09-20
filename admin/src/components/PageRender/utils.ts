import { injectAssets, filterPackages } from '@alilc/lowcode-plugin-inject';
import assets from './assets.json';

export const getPackagesFromAssets = async () => {
  const assetsObj = await injectAssets(assets);
  return await filterPackages(assetsObj?.packages);
}

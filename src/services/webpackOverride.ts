import type { WebpackOverrideFn } from '@remotion/bundler'

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    // 添加自定义 webpack 配置
  }
}

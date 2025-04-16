const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 使用 setupMiddlewares 替代之前的 before 选项（适用于 webpack-dev-server v4）
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const express = require('express');
      // 设置 Linux 系统中的录制文件夹绝对路径
      const recordFolder = '/home/ecdav/DRM_Modu_bin/record';
      // 将此目录映射为网页中的 "/record" 路径
      devServer.app.use('/record', express.static(recordFolder));
      return middlewares;
    }
  }
})




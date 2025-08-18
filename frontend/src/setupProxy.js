const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/counter',
    createProxyMiddleware({
      target: 'https://counter-service-2-0.onrender.com',
      changeOrigin: true,
      pathRewrite: { '^/counter': '' },
      secure: true,
      logLevel: 'silent'
    })
  );
};

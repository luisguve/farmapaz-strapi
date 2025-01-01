module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/import-products',
      handler: 'import-products.importProducts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

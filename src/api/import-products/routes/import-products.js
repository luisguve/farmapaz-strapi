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
    {
      method: 'PUT',
      path: '/edit-product/:id',
      handler: 'import-products.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

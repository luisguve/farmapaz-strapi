module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/generate-order',
     handler: 'generate-order.create',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

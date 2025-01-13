module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/create-order',
     handler: 'create-order.create',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/find-orders-to-deliver/:userId',
     handler: 'find-orders-to-deliver.findOne',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/find-orders-to-deliver',
     handler: 'find-orders-to-deliver.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

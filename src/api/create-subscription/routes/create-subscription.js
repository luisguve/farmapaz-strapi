module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/create-subscription',
     handler: 'create-subscription.create',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

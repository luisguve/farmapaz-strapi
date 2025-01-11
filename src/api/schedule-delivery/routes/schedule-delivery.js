module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/schedule-delivery',
     handler: 'schedule-delivery.create',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

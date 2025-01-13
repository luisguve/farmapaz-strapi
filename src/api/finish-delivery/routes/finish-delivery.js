module.exports = {
  routes: [
    {
     method: 'PUT',
     path: '/finish-delivery/:documentId',
     handler: 'finish-delivery.update',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};

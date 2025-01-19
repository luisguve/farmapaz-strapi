module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/subscriptions/cron/generate-orders',
      handler: 'api::subscription.subscription.cronGenerateOrders',
    },
  ],
};

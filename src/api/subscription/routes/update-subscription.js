module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/subscriptions/cancel-subscription/:subscriptionId',
      handler: 'api::subscription.subscription.cancelSubscription',
    },
    {
      method: 'PUT',
      path: '/subscriptions/pause-subscription/:subscriptionId',
      handler: 'api::subscription.subscription.pauseSubscription',
    },
    {
      method: 'PUT',
      path: '/subscriptions/resume-subscription/:subscriptionId',
      handler: 'api::subscription.subscription.resumeSubscription',
    },
  ],
};

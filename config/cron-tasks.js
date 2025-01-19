module.exports = {
  /**
   * Simple example.
   * Every day at 10am.
   */

  generateOrders: {
    task: async ({ strapi }) => {
      // Find subscriptions with nextOrderDate less than or equal to today
      const subscriptions = await strapi.documents('api::subscription.subscription').findMany({
        filters: {
          nextOrderDate: {
            $lte: new Date().toISOString(),
          },
        },
      });
      // For each subscription, create an order
      for (const subscription of subscriptions) {
        await strapi.service('api::order.order').createOrder(subscription);
      }
    },
    options: {
      rule: "0 0 10 * * *",
    },
  },
};

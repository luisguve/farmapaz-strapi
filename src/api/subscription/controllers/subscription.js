'use strict';

/**
 * subscription controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscription.subscription', ({ strapi }) => ({
  async cronGenerateOrders(ctx) {
    // Find subscriptions with nextOrderDate less than or equal to today
    const subscriptions = await strapi.documents('api::subscription.subscription').findMany({
      filters: {
        nextOrderDate: {
          $lte: new Date().toISOString(),
        },
      },
      populate: {
        user: true,
        products: true
      }
    });
    // For each subscription, create an order
    for (const subscription of subscriptions) {
      await strapi.service('api::order.order').createOrder(subscription);
    }
    ctx.body = 'ok';
  }
}));

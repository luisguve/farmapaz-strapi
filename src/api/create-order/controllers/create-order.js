'use strict';

/**
 * A set of functions called "actions" for `create-order`
 */

module.exports = {
  create: async (ctx, next) => {
    const inputData = ctx.request.body.data;
    try {
      // Create new order.
      const newOrderDate = new Date();
      const data = await strapi.documents('api::order.order').create({
        data: {
          ...inputData,
          orderStatus: 'Pendiente',
          orderDate: newOrderDate.toISOString(),
        },
        populate: {
          subscription: true
        }
      })
      // Get subscription and update the next order date.
      const subscription = await strapi.documents('api::subscription.subscription').findOne({
        documentId: data.subscription.documentId
      });
      const frequency = subscription.frequency;
      switch (frequency) {
        case 'Mensual':
          subscription.nextOrderDate = new Date(newOrderDate.setMonth(newOrderDate.getMonth() + 1));
          break;
        case 'Semanal':
          subscription.nextOrderDate = new Date(newOrderDate.setDate(newOrderDate.getDate() + 7));
          break;
      }
      // Update subscription.
      await strapi.documents('api::subscription.subscription').update({
        documentId: subscription.documentId,
        data: {
          nextOrderDate: subscription.nextOrderDate
        }
      })
      ctx.body = data;
    } catch (err) {
      ctx.body = err;
    }
  }
};

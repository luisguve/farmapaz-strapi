'use strict';

/**
 * A set of functions called "actions" for `create-order`
 */

module.exports = {
  create: async (ctx, next) => {
    const inputData = ctx.request.body.data;
    try {
      const { subscription } = inputData;

      // Check if subscription exists.
      const subscriptionData = await strapi.documents('api::subscription.subscription').findOne({
        documentId: subscription,
        populate: {
          user: true,
          products: true
        }
      });
      if (!subscriptionData) {
        return ctx.notFound('Error en la solicitud: la suscripción no fue encontrada.');
      }

      const order = await strapi.service('api::order.order').createOrder(subscriptionData);

      ctx.body = order;
    } catch (err) {
      ctx.body = err;
    }
  }
};

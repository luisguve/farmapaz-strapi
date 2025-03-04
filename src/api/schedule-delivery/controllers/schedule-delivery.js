'use strict';

/**
 * A set of functions called "actions" for `schedule-delivery`
 */

module.exports = {
  create: async (ctx, next) => {
    try {
      const inputData = ctx.request.body.data;
      const data = await strapi.documents('api::delivery.delivery').create({
        data: inputData,
        deliveryStatus: 'En espera'
      })
      // Change status of every order to "En proceso" and deliveryDate to now
      const ordersIds = inputData.orders;
      for (let i = 0; i < ordersIds.length; i++) {
        await strapi.db.query('api::order.order').update({
          where: { id: ordersIds[i] },
          data: {
            orderStatus: "En proceso",
            deliveryDate: new Date()
          },
        });
      }

      ctx.body = { data };
    } catch (err) {
      ctx.body = err;
    }
  }
};

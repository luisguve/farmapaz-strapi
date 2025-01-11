'use strict';

/**
 * A set of functions called "actions" for `schedule-delivery`
 */

module.exports = {
  create: async (ctx, next) => {
    try {
      const inputData = ctx.request.body.data;
      const data = await strapi.documents('api::delivery.delivery').create({
        data: inputData
      })
      // Change status of every order to "En proceso"
      const ordersIds = inputData.orders;
      for (let i = 0; i < ordersIds.length; i++) {
        await strapi.db.query('api::order.order').update({
          where: { id: ordersIds[i] },
          data: {
            orderStatus: "En proceso"
          },
        });
      }

      ctx.body = { data };
    } catch (err) {
      ctx.body = err;
    }
  }
};

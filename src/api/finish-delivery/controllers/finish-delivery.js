'use strict';

/**
 * A set of functions called "actions" for `finish-delivery`
 */

module.exports = {
  update: async (ctx, next) => {
    const inputData = ctx.request.body.data;
    const documentId = ctx.params.documentId;
    try {
      const data = await strapi.documents('api::delivery.delivery').update({
        documentId: documentId,
        data: {
          deliveryStatus: "Finalizada"
        },
        populate: {
          orders: true
        }
      })
      const { orders } = data;
      // Change status of every order that wasn't delivered to "Pospuesta"
      await Promise.all(orders.map(async order => {
        if (["En proceso", "En espera"].includes(order.orderStatus)) {
          await strapi.documents('api::order.order').update({
            documentId: order.documentId,
            data: {
              orderStatus: "Pospuesta"
            }
          })
        }
      }))
      ctx.body = { data };
    } catch (err) {
      ctx.body = err;
    }
  }
};

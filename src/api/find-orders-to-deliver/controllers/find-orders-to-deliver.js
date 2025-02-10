'use strict';

module.exports = {
  findOne: async (ctx, next) => {
    const userId = ctx.params.userId;
    const page = ctx.query.page || 1;
    let orders = await strapi.documents('api::order.order').findMany({
      filters: {
        orderStatus: {
          $in: ['Pagada', 'Pospuesta']
        },
        user: {
          id: userId
        }
      },
      populate: {
        deliveries: true,
        user: true,
        products: true
      },
      limit: 10,
      start: (page - 1) * 10
    })
    orders = orders.filter(order => {
      // Check if the order has an ongoing delivery.
      const hasOngoingDelivery = order.deliveries.some(delivery => delivery.deliveryStatus !== 'Finalizada');
      // If not, this order is able to be delivered.
      return !hasOngoingDelivery;
    })
    try {
      ctx.body = orders;
    } catch (err) {
      ctx.body = err;
    }
  },
  find: async (ctx, next) => {
    const page = ctx.query.page || 1;
    let orders = await strapi.documents('api::order.order').findMany({
      filters: {
        orderStatus: {
          $in: ['Pagada', 'Pospuesta']
        }
      },
      populate: {
        deliveries: true,
        user: true,
        products: true
      },
      limit: 10,
      start: (page - 1) * 10
    })
    orders = orders.filter(order => {
      // Check if the order has an ongoing delivery.
      const hasOngoingDelivery = order.deliveries.some(delivery => delivery.deliveryStatus !== 'Finalizada');
      // If not, this order is able to be delivered.
      return !hasOngoingDelivery;
    })
    try {
      ctx.body = orders;
    } catch (err) {
      ctx.body = err;
    }
  }
};

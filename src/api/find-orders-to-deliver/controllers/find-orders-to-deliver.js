'use strict';

module.exports = {
  find: async (ctx, next) => {
    const page = ctx.query.page || 1;
    let orders = await strapi.documents('api::order.order').findMany({
      filters: {
        orderStatus: 'Pagada'
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
      const dateInput = new Date(order.deliveryDate);

      // Get today's date without time.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get the date without time.
      const orderDate = new Date(dateInput);
      orderDate.setHours(0, 0, 0, 0);
      
      // Check if the order date is less than or equal to today's date.
      const isValidDate = orderDate <= today;
      // If not, this order is not able to be delivered.
      if (!isValidDate) {
        return false;
      }
      // Check if the order has an ongoing delivery.
      const hasOngoingDelivery = order.deliveries.some(delivery => delivery.deliveryStatus !== 'Finalizado');
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

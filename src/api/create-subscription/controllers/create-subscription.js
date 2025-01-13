'use strict';

/**
 * A set of functions called "actions" for `create-subscription`
 */

module.exports = {
  create: async (ctx, next) => {
    const inputData = ctx.request.body.data;
    try {
      const { totalAmount, productsDetails } = inputData;
      delete inputData.totalAmount;
      delete inputData.productsDetails;
      // Create new subscription
      const frequency = inputData.frequency;
      const now = new Date();
      const startDate = new Date(inputData.startDate);
      let nextOrderDate = startDate;
      // In order to set the next order date, check if now is later than startDate.
      // If so, set the next order date to the next period (today + frequency).
      if (now >= startDate) {
        switch (frequency) {
          case 'Mensual':
            nextOrderDate = new Date(now.setMonth(now.getMonth() + 1));
            break;
          case 'Semanal':
            nextOrderDate = new Date(now.setDate(now.getDate() + 7));
            break;
        }
      }
      const newSubscription = await strapi.documents('api::subscription.subscription').create({
        data: {
          ...inputData,
          nextOrderDate: nextOrderDate.toISOString(),
        }
      })
      // Create new order.
      await strapi.documents('api::order.order').create({
        data: {
          subscription: newSubscription.id,
          user: inputData.user,
          products: inputData.productsDetails,
          productsDetails: productsDetails,
          totalAmount: totalAmount,
          orderStatus: 'Pendiente',
          orderDate: now.toISOString(),
        }
      })
      ctx.body = newSubscription;
    } catch (err) {
      ctx.body = err;
    }
  }
};

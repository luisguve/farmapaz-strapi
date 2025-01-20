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
        subscriptionStatus: {
          $eq: 'Activa'
        }
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
  },
  async cancelSubscription(ctx) {
    try {
      const subscriptionId = ctx.params.subscriptionId;
      const subscription = await strapi.documents('api::subscription.subscription').findOne({
        documentId: subscriptionId,
        populate: {
          orders: true
        }
      });
      if (!subscription) {
        return ctx.notFound('Error en la solicitud: la suscripción no fue encontrada.');
      }

      // Cancel orders that were not delivered
      const orders = subscription.orders.filter(order => order.orderStatus !== "Entregada");
      for (const order of orders) {
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: {
            orderStatus: "Cancelada"
          },
        });
      }

      // Update subscription status and next order date
      await strapi.documents('api::subscription.subscription').update({
        documentId: subscriptionId,
        data: {
          subscriptionStatus: "Cancelada",
          nextOrderDate: null
        }
      })

      ctx.body = 'ok';
    } catch(err) {
      ctx.body = err;
    }
  },
  async pauseSubscription(ctx) {
    try {
      const subscriptionId = ctx.params.subscriptionId;
      const subscription = await strapi.documents('api::subscription.subscription').findOne({
        documentId: subscriptionId,
        populate: {
          orders: true
        }
      });
      if (!subscription) {
        return ctx.notFound('Error en la solicitud: la suscripción no fue encontrada.');
      }

      // Cancel pending and unsatisfied orders
      const orders = subscription.orders.filter(order => ['Pendiente', 'Insatisfecha'].includes(order.orderStatus));
      for (const order of orders) {
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: {
            orderStatus: "Cancelada"
          },
        });
      }

      // Update subscription status and next order date
      await strapi.documents('api::subscription.subscription').update({
        documentId: subscriptionId,
        data: {
          subscriptionStatus: "Pausada",
          nextOrderDate: null
        }
      })

      ctx.body = 'ok';
    } catch(err) {
      ctx.body = err;
    }
  },
  async resumeSubscription(ctx) {
    try {
      const subscriptionId = ctx.params.subscriptionId;
      const subscription = await strapi.documents('api::subscription.subscription').findOne({
        documentId: subscriptionId,
        populate: {
          products: true,
          user: true
        }
      });
      if (!subscription) {
        return ctx.notFound('Error en la solicitud: la suscripción no fue encontrada.');
      }

      // Create new order
      await strapi.service('api::order.order').createOrder(subscription);
      // Update subscription status
      await strapi.documents('api::subscription.subscription').update({
        documentId: subscriptionId,
        data: {
          subscriptionStatus: "Activa"
        }
      })
      ctx.body = 'ok';
    } catch(err) {
      ctx.body = err;
    }
  }
}));

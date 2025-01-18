'use strict';

/**
 * order service
 */


const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order.order', ({ strapi }) => ({
  async createOrder(subscriptionData) {
    let totalAmount = 0;
    const productsDetails = {};
    let selectedProducts = subscriptionData.products.map(product => {
      totalAmount += product.price * subscriptionData.quantities[product.id];
      productsDetails[product.id] = {
        quantity: subscriptionData.quantities[product.id],
        price: product.price,
        outOfStock: product.stock < subscriptionData.quantities[product.id]
      };
      return product;
    });

    let outOfStock = false;
    let productsStock = {};
    // Check stock for each product. If any is out of stock, order status will be 'Insatisfecha'.
    selectedProducts.map(product => {
      let _outOfStock = false;
      if (product.stock < subscriptionData.quantities[product.id]) {
        _outOfStock = true;
        outOfStock = true;
      }
      productsStock[product.id] = { stock: product.stock, outOfStock: _outOfStock };
    })

    // Create new order.
    const newOrderDate = new Date();
    const order = await strapi.documents('api::order.order').create({
      data: {
        subscription: subscriptionData.id,
        user: subscriptionData.user.id,
        products: selectedProducts,
        productsDetails: JSON.stringify(productsDetails),
        totalAmount: totalAmount,
        orderStatus: outOfStock ? 'Insatisfecha' : 'Pendiente',
        orderDate: newOrderDate.toISOString(),
      }
    })

    // Update stock for each product.
    await Promise.all(selectedProducts.map(async (product) => {
      if (productsStock[product.id].outOfStock) {
        return;
      }
      await strapi.documents('api::product.product').update({
        documentId: product.documentId,
        data: {
          stock: product.stock - subscriptionData.quantities[product.id]
        },
      });
    }))

    // Update next order date and last order date in subscription.
    let nextOrderDate = new Date(subscriptionData.nextOrderDate);
    let lastOrderDate = newOrderDate.toISOString();
    const { frequency } = subscriptionData;
    switch (frequency) {
      case 'Mensual':
        nextOrderDate = new Date(newOrderDate.setMonth(newOrderDate.getMonth() + 1));
        break;
      case 'Semanal':
        nextOrderDate = new Date(newOrderDate.setDate(newOrderDate.getDate() + 7));
        break;
    }
    // Update subscription.
    await strapi.documents('api::subscription.subscription').update({
      documentId: subscriptionData.documentId,
      data: {
        nextOrderDate: nextOrderDate,
        lastOrderDate: lastOrderDate
      }
    })

    return order;
  }
}));

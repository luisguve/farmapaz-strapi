'use strict';

/**
 * product service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product.product', ({ strapi }) => ({
  async getProductsFolder() {
    // Get products folder
    let productsFolder = await await strapi.db.query("plugin::upload.folder").findOne({ where: { name: 'Products' } });
    if (!productsFolder) {
      // Datos para la nueva carpeta
      const folderData = {
        name: 'Products',
        parent: null, // Puede ser null si es una carpeta raíz
      };
      const opts = {};
      // Llama al servicio de creación de carpetas
      productsFolder = await strapi.plugins['upload'].services.folder.create(folderData, opts);
    }
    return productsFolder;
  },
  async createProduct(productData, image, categoryId) {
    let imageEntry = null;
    if (image) {
      // Get products folder
      const productsFolder = await this.getProductsFolder();

      const imageBuffer = image.buffer;
      const uploadResponse = await strapi.plugins['upload'].services.upload.upload({
        data: {
          fileInfo: {
            name: image.name,
            folder: productsFolder.id
          },
        },
        files: {
          path: imageBuffer,
          filepath: imageBuffer,
          name: image.name,
          type: `${image.type}/${image.extension}`,
          mimetype: `${image.type}/${image.extension}`,
          size: imageBuffer.length,
        },
      });
      imageEntry = uploadResponse[0];
    }
    const product = await strapi.documents('api::product.product').create({
      data: {
        ...productData,
        image: imageEntry,
        category: categoryId,
        status: 'published'
      },
      status: 'published'
    })
    return product;
  }
}));

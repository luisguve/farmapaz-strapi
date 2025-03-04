'use strict';
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');

function sanitize_title(str) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	var from = "àáäâèéëêìíïîòóöôùúüûñçěščřžýúůďťň·/_,:;";
	var to   = "aaaaeeeeiiiioooouuuuncescrzyuudtn------";

	for (var i=0, l=from.length ; i<l ; i++)
	{
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str.replace('.', '-') // replace a dot by a dash 
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by a dash
		.replace(/-+/g, '-') // collapse dashes
		.replace( /\//g, '' ); // collapse all forward-slashes

	return str;
}

/**
 * A set of functions called "actions" for `import-products`
 */

module.exports = {
  update: async (ctx, next) => {
    try {
      const productId = ctx.params.id;
      const productData = ctx.request.body.data;

      const product = await strapi.documents('api::product.product').update({
        documentId: productId,
        data: productData
      })

      // Find each order that could not be processed for insufficient stock
      let unsatisfiedOrders = await strapi.documents('api::order.order').findMany({
        filters: {
          orderStatus: {
            $eq: 'Insatisfecha'
          }
        },
        populate: ['products']
      });

      // Filter unsatisfied orders that have the updated product
      unsatisfiedOrders = unsatisfiedOrders.filter(order => order.products.some(product => product.documentId === productId));
      unsatisfiedOrders.map(async order => {
        const { productsDetails } = order;
        await Promise.all(order.products.map(async product => {
          if (productsDetails[product.id].outOfStock) {
            // check if product stock is sufficient
            if (product.stock >= productsDetails[product.id].quantity) {
              // update product stock, then set outOfStock to false in productsDetails
              await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                  stock: product.stock - productsDetails[product.id].quantity,
                }
              });
              productsDetails[product.id].outOfStock = false;
            }
          }
        }));
        const newOrderData = {
          productsDetails: JSON.stringify(productsDetails)
        }
        // Check if every product in the order is able to be delivered.
        const isOrderReady = Object.values(productsDetails).every(product => !product.outOfStock);
        if (isOrderReady) {
          newOrderData.orderStatus = 'Pendiente';
        }
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: newOrderData
        });
      });

      ctx.body = product;
    } catch (err) {
      ctx.body = err;
    }
  },
  importProducts: async (ctx, next) => {
    try {
      const excelFile = ctx.request.files.file;
      if (!excelFile) {
        return ctx.badRequest('File is required');
      }
      const workbook = xlsx.readFile(excelFile.filepath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const _workbook = new ExcelJS.Workbook();
      await _workbook.xlsx.readFile(excelFile.filepath);
      const _worksheet = _workbook.getWorksheet(1); // Accede a la primera hoja

      // Mapear imágenes a sus rangos
      const imageMap = {};
      _worksheet.getImages().forEach((image) => {
        const imageId = image.imageId;
        const range = image.range.tl.nativeRow + 1; // Fila superior izquierda (1-indexed)
        const product = data[range - 2];

        const _image = _workbook.getImage(+imageId);
        imageMap[product.name] = _image;
      });

      const uniqueCategories = new Set();
      data.forEach((row) => {
        uniqueCategories.add(row.category);
      });

      const storedCategories = {};
      const categoriesKeys = [...uniqueCategories];
      // Find each category. If it doesn't exist, create it
      await Promise.all(categoriesKeys.map(async category => {
        const fn = async () => {
          // Get the category.
          const existingCategory = await strapi.db.query('api::category.category').findOne({
            where: {
              name: category
            }
          })
          if (!existingCategory) {
            const newCategory = await strapi.documents('api::category.category').create({
              data: {
                name: category,
                slug: sanitize_title(category)
              }
            })
            storedCategories[category] = newCategory.id;
          } else {
            storedCategories[category] = existingCategory.id;
          }
        }
        return fn();
      }))

      // Init products image folder.
      await strapi.service('api::product.product').getProductsFolder();

      // Find each order that could not be processed for insufficient stock
      const unsatisfiedOrders = await strapi.documents('api::order.order').findMany({
        filters: {
          orderStatus: {
            $eq: 'Insatisfecha'
          }
        },
        populate: ['products']
      });

      // Create products
      const products = await Promise.all(data.map(async productData => {
        // Find product by name. if it doesn't exist, create it.
        let product = await strapi.db.query('api::product.product').findOne({
          where: {
            name: productData.name
          }
        })
        if (!product) {
          const image = imageMap[productData.name];
          product = await strapi.service('api::product.product').createProduct(productData, image, storedCategories[productData.category]);
        } else {
          product = await strapi.documents('api::product.product').update({
            documentId: product.documentId,
            data: {
              ...productData,
              category: storedCategories[productData.category]
            }
          })
        }
        return product;
      }));

      unsatisfiedOrders.map(async order => {
        const { productsDetails } = order;
        await Promise.all(order.products.map(async product => {
          if (productsDetails[product.id].outOfStock) {
            // check if product stock is sufficient
            if (product.stock >= productsDetails[product.id].quantity) {
              // update product stock, then set outOfStock to false in productsDetails
              await strapi.documents('api::product.product').update({
                documentId: product.documentId,
                data: {
                  stock: product.stock - productsDetails[product.id].quantity,
                }
              });
              productsDetails[product.id].outOfStock = false;
            }
          }
        }))
        const newOrderData = {
          productsDetails: JSON.stringify(productsDetails)
        }
        // Check if every product in the order is able to be delivered.
        const isOrderReady = Object.values(productsDetails).every(product => !product.outOfStock);
        if (isOrderReady) {
          newOrderData.orderStatus = 'Pendiente';
        }
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: newOrderData
        });
      });

      ctx.body = {
        success: true,
        products
      };
    } catch (err) {
      return ctx.internalServerError(err);
    }
  }
};

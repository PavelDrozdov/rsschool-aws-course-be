import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';

import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE_NAME;
const stockTable = process.env.STOCKS_TABLE_NAME;

export const headers = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if(!productsTable || !stockTable) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Internal Server Error'}),
    };
  }

  try {
    if(event.pathParameters && event.pathParameters.productId) {
      const productId = event.pathParameters.productId;
      const [products, stocks ] = await Promise.all( [
        db.get({TableName: productsTable,Key: { id: productId }}).promise(),
        db.get({TableName: stockTable,Key: { productId: productId }}).promise()
      ]);

      if (products.Item && stocks.Item) {
        const productResponse = {
          ...products.Item,
          count: stocks.Item.count,
        }
        return {
          ...headers,
          statusCode: 200,
          body: JSON.stringify(productResponse),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({message: 'Product not found'}),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({message: 'Invalid product ID'}),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Internal Server Error'}),
    };
  }
}

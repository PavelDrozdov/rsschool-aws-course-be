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

export const handler: APIGatewayProxyHandler = async ( event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {

  if (productsTable !== undefined && stockTable !== undefined) {
    try{
      const [products, stocks ] = await Promise.all( [db.scan({TableName: productsTable}).promise(), db.scan({TableName: stockTable}).promise()]);
      if(products.Items !== undefined) {
        const result = products.Items.map(product => {
          if (stocks !== undefined && stocks.Items !== undefined) {
            const stock = stocks.Items.find(i => i.productId === product.id);
            if (stock && stock.count) {
              return {
                ...product,
                count: stock.count,
              }
            }
          }
          return undefined;
        })
        return {
          ...headers,
          statusCode: 200,
          body: JSON.stringify(result),
        };
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({message: 'Internal Server Error'}),
      };
    }
  }
  return {
    statusCode: 500,
    body: JSON.stringify({message: 'Internal Server Error'}),
  };
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();
const uuidv4 = () => {
  let u='',m='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',i=0,rb=Math.random()*0xffffffff|0;
  while(i++<36) {
    const c=m[i-1],r=rb&0xf,v=c=='x'?r:(r&0x3|0x8);
    u+=(c=='-'||c=='4')?c:v.toString(16);rb=i%8==0?Math.random()*0xffffffff|0:rb>>4;
  }
  return u;
}
export const handler: APIGatewayProxyHandler = async (event) => {
  const { name, title, description, price, count } = JSON.parse(event.body || '{}');

  if (
    !name || typeof name !== "string" ||
    !title || typeof title !== "string" ||
    !description || typeof description !== "string" ||
    !price || typeof price !== "number" ||
    !count || typeof count !== "number"
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields or data is invalid" })
    };
  }

  const productsTable = process.env.PRODUCTS_TABLE_NAME!;
  const stocksTable = process.env.STOCKS_TABLE_NAME!;
  const productId = uuidv4();



  const productItem = { id: productId, name,title,description, price };
  const stockItem = { productId, count };
  try {
    await db.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: productsTable,
            Item: productItem
          }
        },
        {
          Put: {
            TableName: stocksTable,
            Item: stockItem
          }
        }
      ]
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Product created successfully" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating product", error: error })
    };
  }
};

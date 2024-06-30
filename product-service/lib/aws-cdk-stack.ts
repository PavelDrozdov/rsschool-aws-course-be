import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { addCorsOptions } from './aws-cdk-add-option-method';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, 'Products', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });
    const stocksTable = new dynamodb.Table(this, 'Stocks', {
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING }
    });
    const dynamoPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
      resources: [productsTable.tableArn, stocksTable.tableArn],
    });

    const getProductsListFunction = new lambda.Function(this, 'rs-lambda-get-products', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('./src/getProductsList'),
      handler: 'index.handler',
      environment: {
        PRODUCTS_TABLE_NAME:productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      }
    });
    productsTable.grantReadData(getProductsListFunction);
    stocksTable.grantReadData(getProductsListFunction);
    getProductsListFunction.addToRolePolicy(dynamoPolicy);

    const getProductsByIdFunction = new lambda.Function(this, 'rs-lambda-get-product-by-id', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('./src/getProductById'),
      handler: 'index.handler',
      environment: {
        PRODUCTS_TABLE_NAME:productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      }
    });
    productsTable.grantReadData(getProductsByIdFunction);
    stocksTable.grantReadData(getProductsByIdFunction);
    getProductsByIdFunction.addToRolePolicy(dynamoPolicy);

    const createProductFunction = new lambda.Function(this, 'rs-lambda-create-product', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('./src/createProduct'),
      handler: 'index.handler',
      environment: {
        PRODUCTS_TABLE_NAME:productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      }
    });
    productsTable.grantReadData(createProductFunction);
    stocksTable.grantReadData(createProductFunction);
    createProductFunction.addToRolePolicy(dynamoPolicy);

    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'rs-api',
      description: 'This service serves product data.',
    });

    const products = api.root.addResource('products');
    const getAllProductsIntegration = new apigateway.LambdaIntegration(getProductsListFunction, {
      requestTemplates: { "application/json": '{"statusCode": 200}' }
    });
    products.addMethod('GET', getAllProductsIntegration);

    const createProductsIntegration = new apigateway.LambdaIntegration(createProductFunction, {
      requestTemplates: { "application/json": '{"statusCode": 200}' }
    });
    products.addMethod('POST', createProductsIntegration);

    const productById = products.addResource('{productId}');
    const getProductByIdIntegration = new apigateway.LambdaIntegration(getProductsByIdFunction, {
      requestTemplates: { "application/json": '{"statusCode": 200}' }
    });
    productById.addMethod('GET', getProductByIdIntegration);
    addCorsOptions(productById);
  }
}

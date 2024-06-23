import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunction = new lambda.Function(this, 'rs-lambda-get-products', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('./src/getProductsList'),
      handler: 'index.handler',
    });

    const getProductsByIdFunction = new lambda.Function(this, 'rs-lambda-get-product-by-id', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('./src/getProductById'),
      handler: 'index.handler',
    });

    const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
      restApiName: 'rs-api',
      description: 'This service serves product data.',
    });

    const products = api.root.addResource('products');
    const getAllProductsIntegration = new apigateway.LambdaIntegration(getProductsListFunction, {
      requestTemplates: { "application/json": '{"statusCode": 200}' }
    });
    products.addMethod('GET', getAllProductsIntegration);
    this.addCorsOptions(products);

    const productById = products.addResource('{productId}');
    const getProductByIdIntegration = new apigateway.LambdaIntegration(getProductsByIdFunction, {
      requestTemplates: { "application/json": '{"statusCode": 200}' }
    });
    productById.addMethod('GET', getProductByIdIntegration);
    this.addCorsOptions(productById);
  }

  private addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Access-Control-Allow-Origin'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseModels: {
          'application/json': apigateway.Model.EMPTY_MODEL,
        },
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }]
    });
  }
}

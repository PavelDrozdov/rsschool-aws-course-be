const products = [
  {
    "id": 1,
    "title": "Refreshing Body Lotion",
    "description": "A body lotion that refreshes and moisturizes your skin.",
    "price": 20
  },
  {
    "id": 2,
    "title": "Soothing Eye Gel",
    "description": "A cooling gel to reduce puffiness and dark circles.",
    "price": 30,
  },
  {
    "id": 3,
    "title": "Revitalizing Night Serum",
    "description": "A serum that revitalizes your skin overnight for a glowing complexion.",
    "price": 45
  },
  {
    "id": 4,
    "title": "Gentle Foaming Cleanser",
    "description": "A gentle cleanser that removes impurities without drying out your skin.",
    "price": 20
  },
  {
    "id": 5,
    "title": "Nourishing Day Cream",
    "description": "A rich day cream that nourishes and protects your skin.",
    "price": 35
  }
];

export const headers = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  },
};


export const handler = async (event) => {
  try {
    const productId = parseInt(event.pathParameters.productId, 10);
    if (isNaN(productId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: 'Invalid product ID'}),
      };
    }
    const product = products.find(p => p.id === productId);

    if (product) {
      return {
        ...headers,
        statusCode: 200,
        body: JSON.stringify(product),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({message: 'Product not found'}),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Internal Server Error'}),
    };
  }
}

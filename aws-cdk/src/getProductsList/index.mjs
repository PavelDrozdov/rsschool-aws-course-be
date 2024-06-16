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
  return {
    ...headers,
    statusCode: 200,
    body: JSON.stringify(products),
  };
};

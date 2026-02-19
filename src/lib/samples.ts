/**
 * Built-in sample JSON documents for quick testing.
 * Each sample demonstrates different type inference features.
 */

export interface Sample {
  name: string;
  description: string;
  json: string;
}

export const SAMPLES: Sample[] = [
  {
    name: "Simple User Profile",
    description: "Basic object with string, number, and boolean fields",
    json: JSON.stringify(
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        age: 30,
        active: true,
      },
      null,
      2
    ),
  },
  {
    name: "E-commerce Order",
    description: "Nested object with arrays, shipping address, and line items",
    json: JSON.stringify(
      {
        orderId: "ORD-2025-001",
        customer: {
          id: 42,
          name: "Bob Smith",
          email: "bob@shop.com",
        },
        items: [
          {
            productId: "SKU-100",
            name: "Wireless Headphones",
            quantity: 2,
            price: 59.99,
            category: {
              id: 5,
              name: "Electronics",
            },
          },
          {
            productId: "SKU-200",
            name: "Laptop Stand",
            quantity: 1,
            price: 39.99,
            category: {
              id: 8,
              name: "Accessories",
            },
          },
        ],
        shipping: {
          method: "express",
          address: {
            street: "123 Main St",
            city: "Portland",
            state: "OR",
            zip: "97201",
            country: "US",
          },
          trackingNumber: "1Z999AA10123456784",
        },
        total: 159.97,
        currency: "USD",
      },
      null,
      2
    ),
  },
  {
    name: "Optional Fields (Array)",
    description:
      "Array of objects where some objects omit keys — detects optional fields",
    json: JSON.stringify(
      [
        {
          id: 1,
          name: "Alice",
          email: "alice@example.com",
          phone: "+1-555-0100",
        },
        {
          id: 2,
          name: "Bob",
          email: "bob@example.com",
        },
        {
          id: 3,
          name: "Charlie",
          phone: "+1-555-0300",
          nickname: "Chuck",
        },
      ],
      null,
      2
    ),
  },
  {
    name: "Mixed Array Types",
    description: "Arrays with mixed element types — generates union types",
    json: JSON.stringify(
      {
        mixedPrimitives: [1, "two", true, null],
        tags: ["alpha", "beta", "gamma"],
        scores: [95, 87, 92, 100],
        metadata: {
          values: [42, "hello", false],
        },
      },
      null,
      2
    ),
  },
  {
    name: "Nullables + Dates",
    description:
      "Fields with null values and ISO-8601 date strings (enable 'Detect ISO dates' in Settings)",
    json: JSON.stringify(
      {
        user_id: 1001,
        user_name: "Diana Prince",
        created_at: "2025-01-15T09:30:00.000Z",
        updated_at: "2025-06-20T14:45:30.000Z",
        deleted_at: null,
        last_login: "2025-12-01T08:00:00Z",
        bio: null,
        avatar_url: "https://example.com/avatars/diana.jpg",
        settings: {
          theme: "dark",
          notifications_enabled: true,
          language: "en",
        },
      },
      null,
      2
    ),
  },
];

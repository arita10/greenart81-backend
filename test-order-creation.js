// Test order creation field normalization
const testOrderFieldNormalization = () => {
  console.log('🧪 Testing Order Creation Field Normalization\n');

  // Simulate frontend request with camelCase
  const frontendRequest = {
    items: [
      { productId: 14, quantity: 2, price: 105 },
      { productId: 15, quantity: 1, price: 350 }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Bangkok',
      postalCode: '10100',
      country: 'Thailand'
    },
    paymentMethod: 'qr_payment',
    totalAmount: 560
  };

  console.log('1️⃣  Frontend sends (camelCase):');
  console.log(JSON.stringify(frontendRequest, null, 2));

  // Simulate backend normalization
  const body = {};
  for (const key in frontendRequest) {
    body[key.toLowerCase().trim()] = frontendRequest[key];
  }

  const items = frontendRequest.items || frontendRequest.Items;
  const shipping_address = body.shipping_address ?? body.shippingaddress ?? frontendRequest.shippingAddress;
  const payment_method = body.payment_method ?? body.paymentmethod ?? frontendRequest.paymentMethod;
  const total_amount = body.total_amount ?? body.totalamount ?? frontendRequest.totalAmount;

  console.log('\n2️⃣  Backend extracts (after normalization):');
  console.log({
    items: items,
    shipping_address: shipping_address,
    payment_method: payment_method,
    total_amount: total_amount
  });

  // Normalize items
  const normalizedItems = items.map(item => ({
    product_id: item.product_id ?? item.productId ?? item.id,
    quantity: item.quantity ?? item.qty,
    price: item.price
  }));

  console.log('\n3️⃣  Normalized items:');
  console.log(JSON.stringify(normalizedItems, null, 2));

  // Validation
  const hasItems = !!items && Array.isArray(items) && items.length > 0;
  const hasShippingAddress = !!shipping_address;
  const hasPaymentMethod = !!payment_method;
  const hasTotalAmount = !!total_amount;

  console.log('\n4️⃣  Validation results:');
  console.log({
    hasItems,
    hasShippingAddress,
    hasPaymentMethod,
    hasTotalAmount,
    allValid: hasItems && hasShippingAddress && hasPaymentMethod && hasTotalAmount
  });

  if (hasItems && hasShippingAddress && hasPaymentMethod && hasTotalAmount) {
    console.log('\n✅ SUCCESS: All fields extracted correctly!');
    console.log('The order creation will work with camelCase fields.\n');
  } else {
    console.log('\n❌ FAIL: Some fields missing');
  }

  // Test with snake_case too
  console.log('\n--- Testing snake_case input ---\n');

  const backendRequest = {
    items: [{ product_id: 14, quantity: 2, price: 105 }],
    shipping_address: { street: '123 Main St' },
    payment_method: 'qr_payment',
    total_amount: 210
  };

  console.log('5️⃣  Backend sends (snake_case):');
  console.log(JSON.stringify(backendRequest, null, 2));

  const body2 = {};
  for (const key in backendRequest) {
    body2[key.toLowerCase().trim()] = backendRequest[key];
  }

  const shipping2 = body2.shipping_address ?? body2.shippingaddress ?? backendRequest.shippingAddress;
  const payment2 = body2.payment_method ?? body2.paymentmethod ?? backendRequest.paymentMethod;
  const total2 = body2.total_amount ?? body2.totalamount ?? backendRequest.totalAmount;

  console.log('\n6️⃣  Extracted values:');
  console.log({
    shipping_address: shipping2,
    payment_method: payment2,
    total_amount: total2
  });

  if (shipping2 && payment2 && total2) {
    console.log('\n✅ SUCCESS: snake_case also works!');
    console.log('The fix supports both naming conventions.\n');
  }
};

testOrderFieldNormalization();

# API Documentation

## Models

### Product
```typescript
interface Product {
  id: number;
  barcode: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sale
```typescript
interface Sale {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  cashierId: number;
  createdAt: Date;
  details: SaleDetail[];
}
```

### SaleDetail
```typescript
interface SaleDetail {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

### Supplier
```typescript
interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  balance: number;
  isActive: boolean;
}
```

For full API documentation, visit `/api` when the server is running.

import React from "react";

type Product = {
  barcode: string;
  name: string;
  price: number;
  available?: number;
};

type Props = {
  products: Product[];
  onAddToCart: (product: Product) => void;
  hideImage?: boolean;
};

export default function ProductList({ products, onAddToCart }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div
          key={product.barcode}
          className="bg-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition"
          onClick={() => onAddToCart(product)}
        >
          {/* No image rendering */}
          <div className="text-white font-semibold">{product.name}</div>
          <div className="text-white/70 text-sm">Ksh{Number(product.price).toFixed(2)}</div>
          {product.available !== undefined && (
            <div className="text-xs text-blue-400">{Number(product.available)} available</div>
          )}
        </div>
      ))}
    </div>
  );
}

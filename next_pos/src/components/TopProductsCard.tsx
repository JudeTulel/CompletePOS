import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface TopProduct {
  productId: number;
  name: string;
  totalSales: number;
  quantitySold: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TopProductsCard: React.FC<{ topN?: number }> = ({ topN = 5 }) => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/sales/top-products?topN=${topN}`);
        if (!res.ok) throw new Error('Failed to fetch top products');
        const salesData = await res.json();
        // Transform salesData to aggregate by product
        const productMap: Record<number, TopProduct> = {};
        for (const sale of salesData) {
          for (const detail of sale.details) {
            const prod = detail.product;
            if (!prod) continue;
            if (!productMap[prod.id]) {
              productMap[prod.id] = {
                productId: prod.id,
                name: prod.name || 'Unnamed Product',
                totalSales: 0,
                quantitySold: 0,
              };
            }
            productMap[prod.id].totalSales += Number(detail.total || 0);
            productMap[prod.id].quantitySold += Number(detail.quantity || 0);
          }
        }
        // Convert to array and sort by totalSales desc
        const topProducts = Object.values(productMap)
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, topN);
        setProducts(topProducts);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, [topN]);

  return (
    <div className="card border border-light-grey/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-off-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-maroon" />
          <span>Top Grossing Products</span>
        </h3>
      </div>
      {loading ? (
        <div className="text-warm-grey">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-warm-grey">No data available</div>
      ) : (
        <ul className="divide-y divide-light-grey/10">
          {products.map((p, idx) => (
            <li key={p.productId} className="py-3 flex items-center justify-between">
              <span className="font-medium text-off-white">
                {idx + 1}. {p.name}
              </span>
              <span className="text-maroon font-bold">Ksh{Number(p.totalSales).toLocaleString()}</span>
              <span className="text-warm-grey text-xs ml-2">({Number(p.quantitySold)} sold)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopProductsCard;

import { SingletonRouter } from 'next/router';
import { Product } from '../lib/prisma';
import ProductCard from './ProductCard';

interface Props {
  url: SingletonRouter;
  products: Product[];
  addProductToOrder;
  addProductToOrderFallback;
}

export default function ProductList(props: Props) {
  const {
    products,
    addProductToOrder,
    addProductToOrderFallback,
    url,
  } = props;

  return (
    <section className="ProductList">
      {products.map((product: any) => {
        const fallback = addProductToOrderFallback(product, url.asPath);
        return <ProductCard {...{key: product.id, fallback, product, addProductToOrder}} />;
      })}

      <style jsx>{`
        section {
          display: flex;
          flex-wrap: wrap;
        }
      `}</style>
    </section>
  );
}

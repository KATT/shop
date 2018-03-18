import { SingletonRouter } from 'next/router';
import { Product } from '../lib/prisma';
import ProductCard from './ProductCard';

interface Props {
  orderId: string;
  url: SingletonRouter;
  products: Product[];
}

export default function ProductList(props: Props) {
  const {
    products,
    url,
    orderId,
  } = props;

  return (
    <section className="ProductList" itemScope itemType="http://schema.org/ItemList">
      {products.map((product: any) => {
        return <ProductCard {...{key: product.id, product, orderId, url}} />;
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

import { useEffect, useState } from "react";
import { ProductType } from "../../../api/src/utils/types";
import { addToCart, fetchAllProducts } from "../utils/api";

const AllProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const loadProducts = () => {
    fetchAllProducts().then((response) => {
      if (!response.success) {
        alert(response.message);
      } else {
        setProducts(response.data);
      }
    });
  };
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-10">
      <div className="mt-10 border">
        <h1>All Products</h1>
        {products?.map((product: any) => (
          <div
            key={product._id}
            className="border w-40 h-40 flex flex-col justify-center items-center"
          >
            <img src={product.image} alt={product.name} className="w-20 h-20" />
            <div>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
            <span
              className="border cursor-pointer bg-blue-300"
              onClick={() => {
                addToCart(product._id, 1);
              }}
            >
              add to cart
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@gomarket:products');

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  async function storeProducts(updatedProducts: Product[]): Promise<void> {
    await AsyncStorage.setItem(
      '@gomarket:products',
      JSON.stringify(updatedProducts),
    );
    setProducts(updatedProducts);
  }

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex !== -1) {
        const updatedArray = [...products];
        updatedArray[productIndex].quantity += 1;
        storeProducts(updatedArray);
      } else {
        storeProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex !== -1) {
        const updatedArray = [...products];
        updatedArray[productIndex].quantity += 1;
        storeProducts(updatedArray);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex !== -1) {
        const updatedArray = [...products];

        if (products[productIndex].quantity === 1) {
          updatedArray.splice(productIndex, 1);
        } else {
          updatedArray[productIndex].quantity -= 1;
        }

        storeProducts(updatedArray);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

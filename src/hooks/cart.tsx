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
      // Não entendi muito bem a lógica do getItem nesse trecho
      const cart = await AsyncStorage.getItem('@GoMarket:cart');
      // Caso exista o objeto JSON será repassado ao Array de produtos
      if (cart) setProducts(JSON.parse(cart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const newCart = [...products];
      // Verifica no Array se já contém algum item igual
      const dataProduct = newCart.findIndex(item => item.id === product.id);

      // Caso possua, a quantidade é incrementada, senão um novo é adicionado ao Array de produtos do carrinho
      dataProduct >= 0
        ? (newCart[dataProduct].quantity += 1)
        : newCart.push({ ...product, quantity: 1 });
      // Seta o produto contidos no Array de produtos
      setProducts(newCart);
      // Atualiza o carrinho
      await AsyncStorage.setItem('@GoMarket: cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementedCart = [...products];

      const dataProduct = incrementedCart.findIndex(item => item.id === id);

      dataProduct >= 0 ? (incrementedCart[dataProduct].quantity += 1) : null;

      setProducts(incrementedCart);

      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const decrementedCart = [...products];

      const dataProduct = decrementedCart.findIndex(item => item.id === id);

      dataProduct >= 0 && decrementedCart[dataProduct].quantity > 1
        ? (decrementedCart[dataProduct].quantity -= 1)
        : null;

      setProducts(decrementedCart);

      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
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

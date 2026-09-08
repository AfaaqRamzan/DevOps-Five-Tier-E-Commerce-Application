import { IRootState } from "@/store";
import {
  addToCart as addToCartAction,
  clearAllCart as clearAllCartAction,
  decrementQuantity as decrementQuantityAction,
  incrementQuantity as incrementQuantityAction,
  removeFromCart as removeFromCartAction,
} from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart.types";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../types/product.types";

export function useCart() {
  const reduxCart = useSelector((state: IRootState) => state.cart);

  const items: CartItem[] = reduxCart.items;
  const dispatch = useDispatch();

  const addProductToCart = async (product: Product) => {
    dispatch(addToCartAction(product));
  };

  const decrementProductQuantity = async (productId: string) => {
    dispatch(decrementQuantityAction(productId));
  };

  const incrementProductQuantity = async (productId: string) => {
    dispatch(incrementQuantityAction(productId));
  };

  const removeProductFromCart = async (productId: string) => {
    dispatch(removeFromCartAction(productId));
  };

  const clearAllCart = async () => {
    dispatch(clearAllCartAction());
  };

  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: reduxCart.totalPrice,
    addProductToCart,
    decrementProductQuantity,
    incrementProductQuantity,
    removeProductFromCart,
    clearAllCart,
  };
}

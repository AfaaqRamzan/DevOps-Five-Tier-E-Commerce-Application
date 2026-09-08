"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../hooks/useCart";
import { CartItemType } from "../../../types/cart.types";
import styles from "./cart-item.module.scss";

export default function CartItem({ item }: { item: CartItemType }) {
  const {
    decrementProductQuantity,
    incrementProductQuantity,
    removeProductFromCart,
  } = useCart();
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;
  const handleDecrement = async () => {
    await decrementProductQuantity(product.id);
  };
  const handleIncrement = async () => {
    if (quantity < product.stock) {
      await incrementProductQuantity(product.id);
    } else {
      alert(`Only ${product.stock} items available in stock`);
    }
  };
  const handleRemove = async () => {
    if (window.confirm(`Remove ${product.name} from cart? `)) {
      await removeProductFromCart(product.id);
    }
  };

  return (
    <div className={styles.cartItem}>
      <Link className={styles.imageWrapper} href={product.id}>
        <Image
          src={
            product.imageUrl.trimEnd() ??
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa"
          }
          alt={product.name}
          width={120}
          height={120}
        />
      </Link>

      <div className={styles.details}>
        <div className={styles.info}>
          <Link className={styles.name} href={`/${product.id}`}>
            {product.name}
          </Link>
          <span className={styles.category}>{product.categoryId}</span>
          <span className={styles.price}>{product.price.toFixed(2)}</span>
          {product.stock <= 5 && (
            <span className={styles.lowStock}>
              Only {product.stock} left in stock
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.quantityControl}>
            <button
              className={styles.quantityButton}
              onClick={handleDecrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              aria-label="Decrease quantity"
            >
              +
            </button>
          </div>

          <div className={styles.itemTotal}>${itemTotal.toFixed(2)}</div>

          <button
            className={styles.removeButton}
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

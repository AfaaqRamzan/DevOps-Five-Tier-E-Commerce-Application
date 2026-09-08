"use client";

import { Product } from "@/types/product.types";
import Link from "next/link";
import React from "react";
import styles from "./product-card.module.scss";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
  const id = product.id;
  const isInStock = product.stock > 0;
  return (
    <Link href={`/${id}`} className={styles.card}>
      {/* image  */}
      <div className={styles.imageWrapper}>
        <Image
          src={
            product.imageUrl.trimEnd() ??
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa"
          }
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
        />
      </div>

      {/* content  */}
      <div className={styles.content}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <span
            className={`${styles.stock} ${!isInStock ? styles.outOfStock : ""}`}
          >
            {isInStock ? product.stock + " In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}

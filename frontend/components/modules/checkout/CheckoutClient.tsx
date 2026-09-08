"use client";

import { Check, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import { useOrder } from "../../../hooks/useOrder";
import { usePayment } from "../../../hooks/usePayment";
import { OrderItem } from "../../../types/orders.types";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutSteps from "./CheckoutSteps";
import PaymentMethodCard from "./PaymentMethodCard";
import styles from "./checkout.module.scss";
import {
  StripePaymentForm,
  StripePaymentProvider,
} from "./stripe-payment-form";

type Step = 1 | 2 | 3;
export default function CheckoutClient() {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { totalPrice, items, clearAllCart } = useCart();
  const { clientSecret, confirmPayment, createPaymentIntent } = usePayment();
  const [orderId, setOrderId] = useState<string>("");
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPayment(method);
    setStripeError(null);
  };
  const { createOrder } = useOrder();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (items.length == 0 && !orderId) {
      router.push("/cart");
    }
  }, [orderId, items, router]);

  useEffect(() => {
    const createOrderAutomatically = async () => {
      if (selectedPayment && !orderId && !isCreatingOrder && !clientSecret) {
        setIsCreatingOrder(true);
        setStripeError(null);

        try {
          const cartItems: OrderItem[] = items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          }));

          const order = await createOrder({
            items: cartItems,
            shippingAddress:
              "Emily Johnson 1250 Market Street, Apt 48 San Francisco",
          });

          if (!order) {
            throw new Error("Failed to create order");
          }

          setOrderId(order.id);

          if (selectedPayment === "stripe") {
            const paymentCreated = await createPaymentIntent({
              orderId: order.id,
              amount: totalPrice,
              description: "Order payment for ecommerce purchase",
              currency: "usd",
            });

            if (!paymentCreated) {
              throw new Error("Failed to create payment intent");
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create payment intent";
          setStripeError(errorMessage);
          console.log("Order creation error:", error);
        } finally {
          setIsCreatingOrder(false);
        }
      }
    };
    createOrderAutomatically();
  }, [
    selectedPayment,
    orderId,
    isCreatingOrder,
    clientSecret,
    items,
    createOrder,
    createPaymentIntent,
    totalPrice,
  ]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setCurrentStep(3);

      const confirmed = await confirmPayment({
        orderId,
        paymentIntentId,
      });

      if (!confirmed) {
        throw new Error("Failed to confirm payment");
      }

      await clearAllCart();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to confirm payment";
      setStripeError(errorMessage);
    }
  };

  const handlePaymentError = async (error: string) => {
    setStripeError(error);
  };

  return (
    <section className={styles.section}>
      {/* container */}
      <div className={styles.container}>
        <CheckoutHeader />
        <CheckoutSteps currentStep={currentStep} />
        <div className={styles.content}>
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2>Select Payment Method</h2>

              <div className={styles.paymentMethods}>
                {/* stripe  */}
                <PaymentMethodCard
                  method="stripe"
                  selectedMethod={selectedPayment}
                  onSelect={handlePaymentMethodSelect}
                  icon={<CreditCard />}
                  title="Credit / Debit Card"
                  description="Pay securely with stripe"
                >
                  {stripeError && (
                    <div className={styles.errorMessage}>{stripeError}</div>
                  )}

                  {isCreatingOrder && !clientSecret && (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <div className={styles.loadingText}>
                        Creating your order
                      </div>
                    </div>
                  )}

                  {clientSecret && (
                    <StripePaymentProvider
                      clientSecret={clientSecret}
                      amount={totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    >
                      <StripePaymentForm
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </StripePaymentProvider>
                  )}
                </PaymentMethodCard>

                {/* other payments methods  */}
              </div>

              {/* Summary  */}
              <div className={styles.summary}>
                <h3>Order summary</h3>
                <div className={styles.summaryRow}>
                  <span>Items ({items.length}) </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <hr className={styles.divider} />
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.success}>
                <Check size={80} strokeWidth={2} />
                <h2>Order placed successfully</h2>
                <p>Your order #{orderId} has been confirmed</p>
                <p className={styles.shippingInfo}>
                  Shipping to
                  <strong>
                    Emily Johnson 1258 Market Street, Apt 4B San Francisco, CA
                    94103 United States
                  </strong>
                </p>

                <button
                  onClick={() => router.push("/user/orders")}
                  className={styles.continueButton}
                >
                  Go to my orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

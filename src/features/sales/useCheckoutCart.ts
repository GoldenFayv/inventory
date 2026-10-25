import { useState } from "react";
import type IProduct from "../products/types/product.types";

export interface ICartItem {
    product: IProduct;
    quantity: number;
    unit_price: number;
}

export function useCheckoutCart() {
    const [items, setItems] = useState<ICartItem[]>([]);

    function addProduct(product: IProduct) {
        if (!product.is_active || product.quantity <= 0) {
            return;
        }

        setItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.product.id === product.id,
            );

            if (existingItem) {
                if (existingItem.quantity >= product.quantity) {
                    return currentItems;
                }

                return currentItems.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [...currentItems, {
                product,
                quantity: 1,
                unit_price: product.selling_price,
            }];
        });
    }

    function updateQuantity(productId: Id, quantity: number, amount?: number | null) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.product.id === productId
                    ? {
                        ...item,
                        quantity: Math.min(
                            item.product.quantity,
                            Math.max(1, Math.floor(quantity) || 1),
                        ),
                        unit_price: amount ?? item.product.selling_price,
                    }
                    : item,
            ),
        );
    }

    function removeProduct(productId: Id) {
        setItems((currentItems) =>
            currentItems.filter((item) => item.product.id !== productId),
        );
    }

    function clearCart() {
        setItems([]);
    }

    const totalAmount = items.reduce(
        (total, item) => total + item.unit_price * item.quantity,
        0,
    );

    return {
        items,
        totalAmount,
        addProduct,
        updateQuantity,
        removeProduct,
        clearCart,
    };
}

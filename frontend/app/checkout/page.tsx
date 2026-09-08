import React from 'react';
import CheckoutClient from '../../components/modules/checkout/CheckoutClient';

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page(){
    return (
        <CheckoutClient/>
    );
};

// Nextjs dynamic metadata
export function generateMetadata() {
    return {
        title: `Page - Title here`,
        description: `Page - Description here`,
        icons: {
            icon: `path to asset file`,
        },
    };
}

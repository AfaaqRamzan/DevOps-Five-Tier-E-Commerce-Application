import LoginForm from "@/components/modules/auth/LoginForm";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page() {
  return <LoginForm/>;
}

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

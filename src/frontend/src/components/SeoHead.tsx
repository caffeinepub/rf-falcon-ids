import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

interface RouteMetadata {
  title: string;
  description: string;
  structuredData?: object;
}

const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'Falcon IDs - Next-Gen Blockchain Identification System',
    description: 'Secure, fast, and decentralized identification powered by Internet Computer blockchain. Professional ID cards with AI-powered design and tamper-proof verification.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Falcon IDs',
      description: 'Next-generation blockchain identification system with secure processing',
      url: typeof window !== 'undefined' ? window.location.origin : '',
    },
  },
  '/about': {
    title: 'About Us - Falcon IDs',
    description: 'Learn about Falcon IDs mission to revolutionize identification through blockchain technology, decentralized systems, and user-centric design.',
  },
  '/features': {
    title: 'Features - Falcon IDs',
    description: 'Discover powerful features: AI-powered design, blockchain security, instant processing, privacy protection, and global delivery with tracking.',
  },
  '/contact': {
    title: 'Contact Us - Falcon IDs',
    description: 'Get in touch with Falcon IDs. Send us a message and we\'ll respond as soon as possible. Email, social links, and support information.',
  },
  '/signin': {
    title: 'Sign In - Falcon IDs',
    description: 'Sign in to Falcon IDs using Internet Identity for secure, decentralized authentication.',
  },
  '/signup': {
    title: 'Sign Up - Falcon IDs',
    description: 'Create your Falcon IDs account using Internet Identity for secure access to our identification ordering system.',
  },
  '/dashboard': {
    title: 'Dashboard - Falcon IDs',
    description: 'View and manage your ID orders, track status, and access order details.',
  },
  '/orders/new': {
    title: 'New Order - Falcon IDs',
    description: 'Create a new identification order with custom details and photo upload.',
  },
  '/admin': {
    title: 'Admin Panel - Falcon IDs',
    description: 'Administrative dashboard for managing orders, security settings, and system configuration.',
  },
};

export default function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    // Determine current route metadata
    let metadata = routeMetadata['/'];
    
    // Check for exact match first
    if (routeMetadata[location.pathname]) {
      metadata = routeMetadata[location.pathname];
    } else if (location.pathname.startsWith('/orders/') && location.pathname !== '/orders/new') {
      // Order detail page
      metadata = {
        title: 'Order Details - Falcon IDs',
        description: 'View your identification order details, status, and tracking information.',
      };
    }

    // Update document title
    document.title = metadata.title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metadata.description);

    // Update or create canonical link
    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Handle structured data (only for landing page)
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (location.pathname === '/' && metadata.structuredData) {
      if (!existingStructuredData) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(metadata.structuredData);
        document.head.appendChild(script);
      } else {
        existingStructuredData.textContent = JSON.stringify(metadata.structuredData);
      }
    } else if (existingStructuredData && location.pathname !== '/') {
      // Remove structured data on non-landing pages
      existingStructuredData.remove();
    }
  }, [location.pathname]);

  return null;
}

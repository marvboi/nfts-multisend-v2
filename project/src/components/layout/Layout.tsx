import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
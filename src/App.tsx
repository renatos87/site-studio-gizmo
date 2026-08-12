import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { About } from './components/public/About';
import { WorksGrid } from './components/public/WorksGrid';
import { ProjectDetailModal } from './components/public/ProjectDetailModal';
import { ClientsSection } from './components/public/ClientsSection';
import { ContactForm } from './components/public/ContactForm';
import { Footer } from './components/public/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { Notification } from './components/common/Notification';

const AppContent: React.FC = () => {
  const { activeSection, isAdmin, selectedProject, notification } = usePortfolio();

  // If in admin mode
  if (activeSection === 'admin') {
    if (isAdmin) {
      return (
        <>
          <AdminLayout />
          {notification && <Notification notification={notification} />}
        </>
      );
    } else {
      return (
        <>
          <AdminLogin />
          {notification && <Notification notification={notification} />}
        </>
      );
    }
  }

  // Public Portfolio View
  return (
    <div className="min-h-screen bg-[#050505] text-[#f9f9f9] selection:bg-[#c5a47e] selection:text-[#050505] transition-colors duration-300 font-sans">
      
      {/* Sticky Top Navigation Bar */}
      <Navbar />

      {/* Main Sections */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* About Section & Trajectory Modal */}
        <About />

        {/* Works & Projects Filterable Grid */}
        <WorksGrid />

        {/* Clients & Partners Showcase */}
        <ClientsSection />

        {/* Contact Form & Social Links */}
        <ContactForm />
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Detail Modal */}
      {selectedProject && <ProjectDetailModal />}

      {/* Toast Notification */}
      {notification && <Notification notification={notification} />}

    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

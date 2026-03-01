"use client"; // <--- OVO JE KLJUČNO ZA NEXT.JS

import React from 'react';
import { useRouter } from 'next/navigation'; // Koristimo Next.js navigaciju
import Header from '@/components/header';
import Footer from '@/components/footer';

const steps = [
  {
    number: "01",
    title: "Find Your Service",
    description: "Browse through our wide range of professional categories to find exactly what you need fixed."
  },
  {
    number: "02",
    title: "Check Available Servicers",
    description: "View profiles of eligible handymen in your area. Check their ratings, expertise, and availability."
  },
  {
    number: "03",
    title: "Describe & Arrange",
    description: "Explain the issue directly to the servicer and arrange a convenient time for an initial inspection."
  },
  {
    number: "04",
    title: "Payment & Materials",
    description: "Receive a detailed breakdown of costs for labor and materials. Everything is transparent before work starts."
  },
  {
    number: "05",
    title: "Confirm & Rate",
    description: "Once the job is done, confirm the completion, make the final payment, and leave a review for the servicer."
  }
];

const HowItWorks = () => {
  const router = useRouter(); // Next.js verzija navigacije

  const isLoggedIn = false; 

  const handleStartRequest = () => {
    if (isLoggedIn) {
      router.push('/client/new-request'); 
    } else {
      router.push('/login');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Header />
      <main style={styles.mainContent}>
        <div style={styles.dashboardCard}>
          <div style={styles.headerArea}>
            <h1 style={styles.title}>How <span style={styles.highlight}>GetItFixed</span> Works</h1>
            <p style={styles.subtitle}>Your step-by-step guide to getting things done.</p>
          </div>

          <div style={styles.stepperContainer}>
            {steps.map((step, index) => (
              <div key={index} style={styles.stepRow}>
                <div style={styles.indicatorWrapper}>
                  <div style={styles.circle}>{step.number}</div>
                  {index !== steps.length - 1 && <div style={styles.verticalLine}></div>}
                </div>
                <div style={styles.textWrapper}>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.ctaArea}>
            <button 
              style={styles.btnPrimary}
              onClick={handleStartRequest}
            >
              Start Your First Request
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ... stilovi ostaju isti kao prošli put ...
const styles = {
    pageWrapper: { backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
    mainContent: { flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    dashboardCard: { backgroundColor: '#ffffff', maxWidth: '700px', width: '100%', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    headerArea: { textAlign: 'center' as const, marginBottom: '50px' },
    title: { fontSize: '28px', color: '#1e293b', fontWeight: '800', margin: '0 0 10px 0' },
    highlight: { color: '#3b82f6' },
    subtitle: { color: '#64748b', fontSize: '16px' },
    stepperContainer: { paddingLeft: '10px' },
    stepRow: { display: 'flex', gap: '24px', minHeight: '100px' },
    indicatorWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' as const },
    circle: { width: '36px', height: '36px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', zIndex: 2 },
    verticalLine: { width: '2px', backgroundColor: '#e2e8f0', flexGrow: 1, margin: '4px 0' },
    textWrapper: { paddingBottom: '40px' },
    stepTitle: { fontSize: '18px', color: '#1e293b', margin: '0 0 8px 0', fontWeight: '700' },
    stepDescription: { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 },
    ctaArea: { textAlign: 'center' as const, marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' },
    btnPrimary: { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};

export default HowItWorks;
import React, { useEffect } from "react"

import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"


import Header from '../parts/Header'
import SearchBars from '../parts/SearchBars'
import { useRouter } from 'next/router'
import Footer from '../parts/Footer'
import AIOverlayComponent from "../parts/AIOverlayComponent"
import GoogleAnalytics from '../parts/GoogleAnalytics';
import { GoogleTagManager } from '@next/third-parties/google';
import { CityProvider } from '../parts/CityContext'
import AppWrapper from './AppWrapper'





function FrontLayout({ children }) {
  const router = useRouter();

  const isHome = router && (router.pathname === '/' || router.asPath === '/');

  return (
    <AppWrapper>
      <CityProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Sticky header - using fixed position for reliability */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'white', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <SearchBars/>
          </div>

          {/* Spacer to account for fixed header - no background color */}
          <div style={{ height: '80px', background: 'transparent' }}></div>

          <GoogleAnalytics />
          <GoogleTagManager id="GTM-WNKQBXPR" />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </CityProvider>
    </AppWrapper>
  );
}

export default FrontLayout

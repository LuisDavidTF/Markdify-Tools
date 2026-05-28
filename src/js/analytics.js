/* ==========================================================================
   GOOGLE ANALYTICS & COOKIE CONSENT MODULE (analytics.js)
   Enfoque modular premium que maneja consentimiento RGPD y carga de scripts.
   ========================================================================== */

const GA_MEASUREMENT_ID = 'G-XNR3W2JHZJ';
const CONSENT_STORAGE_KEY = 'markdify_cookie_consent';

/**
 * Carga e inicializa el script de Google Analytics
 */
function loadGoogleAnalytics() {
  if (window.gtag) return; // Prevenir duplicidades

  // 1. Inyectar dinámicamente el script gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // 2. Inicializar el objeto dataLayer y la función gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  // 3. Configurar el rastreo y registrar la visita de página
  window.gtag('js', new Date());
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`[Google Analytics Debug] Rastreo de GA activado con ID: ${GA_MEASUREMENT_ID}`);
  }
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    cookie_flags: 'SameSite=None;Secure',
    anonymize_ip: true // Mayor privacidad de los usuarios
  });
}

/**
 * Inyecta los estilos estéticos para el Banner de Consentimiento
 */
function injectBannerStyles() {
  const styleId = 'markdify-cookie-banner-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .cookie-banner-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      max-width: 420px;
      background: rgba(13, 18, 30, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      z-index: 99999;
      transform: translateY(100px) scale(0.95);
      opacity: 0;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .cookie-banner-wrapper.show {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    
    .cookie-banner-gradient-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(to right, #8B5CF6, #D946EF);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
    
    .cookie-banner-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      margin-top: 4px;
    }
    
    .cookie-banner-icon {
      font-size: 1.5rem;
    }
    
    .cookie-banner-title {
      font-weight: 700;
      font-size: 1.05rem;
      color: #FFFFFF;
      margin: 0;
    }
    
    .cookie-banner-desc {
      font-size: 0.88rem;
      color: #A0AEC0;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    
    .cookie-banner-desc a {
      color: #D946EF;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    
    .cookie-banner-desc a:hover {
      color: #C084FC;
      text-decoration: underline;
    }
    
    .cookie-banner-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cookie-btn {
      padding: 8px 18px;
      font-size: 0.84rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    
    .cookie-btn-accept {
      background: linear-gradient(to right, #8B5CF6, #D946EF);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
    }
    
    .cookie-btn-accept:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
      filter: brightness(1.15);
    }
    
    .cookie-btn-accept:active {
      transform: translateY(0);
    }
    
    .cookie-btn-reject {
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cookie-btn-reject:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 600px) {
      .cookie-banner-wrapper {
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
        padding: 20px;
        transform: translateY(100%);
      }
      .cookie-banner-gradient-bar {
        border-radius: 0;
      }
      .cookie-banner-actions {
        flex-direction: column-reverse;
        width: 100%;
        gap: 8px;
      }
      .cookie-btn {
        width: 100%;
        text-align: center;
        padding: 10px;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Muestra el banner estético de consentimiento de cookies
 */
function showConsentBanner() {
  injectBannerStyles();

  // Determinar rutas relativas de acuerdo a la ubicación del documento
  const isBlog = window.location.pathname.includes('/blog/');
  const privacyUrl = isBlog ? '../privacy.html' : 'privacy.html';
  const termsUrl = isBlog ? '../terms.html' : 'terms.html';

  const banner = document.createElement('div');
  banner.className = 'cookie-banner-wrapper';
  banner.innerHTML = `
    <div class="cookie-banner-gradient-bar"></div>
    <div class="cookie-banner-header">
      <span class="cookie-banner-icon">🛡️</span>
      <h4 class="cookie-banner-title">Control de Privacidad</h4>
    </div>
    <p class="cookie-banner-desc">
      Utilizamos cookies analíticas para entender cómo utilizas nuestro visor y mejorar la maquetación PDF local. 
      Tus datos de texto Markdown nunca salen de tu equipo. Consulta nuestra 
      <a href="${privacyUrl}">Política de Privacidad</a> y los <a href="${termsUrl}">Términos de Servicio</a>.
    </p>
    <div class="cookie-banner-actions">
      <button class="cookie-btn cookie-btn-reject" id="btn-cookie-reject">Rechazar</button>
      <button class="cookie-btn cookie-btn-accept" id="btn-cookie-accept">Aceptar Cookies</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Animación de entrada suave
  setTimeout(() => {
    banner.classList.add('show');
  }, 300);

  // Evento Aceptar
  document.getElementById('btn-cookie-accept').addEventListener('click', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
    loadGoogleAnalytics();
    closeBanner(banner);
  });

  // Evento Rechazar
  document.getElementById('btn-cookie-reject').addEventListener('click', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
    closeBanner(banner);
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Google Analytics] Consentimiento rechazado por el usuario.');
    }
  });
}

/**
 * Cierra y remueve el banner con transición suave
 * @param {HTMLElement} bannerElement 
 */
function closeBanner(bannerElement) {
  bannerElement.classList.remove('show');
  setTimeout(() => {
    if (document.body.contains(bannerElement)) {
      document.body.removeChild(bannerElement);
    }
  }, 500);
}

// ==========================================================================
// FLUJO DE INICIALIZACIÓN
// ==========================================================================
(function initConsentManager() {
  const currentConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

  if (currentConsent === 'granted') {
    // Si ya aceptó, cargamos GA directamente
    loadGoogleAnalytics();
  } else if (currentConsent === null) {
    // Si no ha tomado una decisión, mostramos el banner
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
      showConsentBanner();
    }
  }
})();

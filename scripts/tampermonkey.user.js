// ==UserScript==
// @name         Autofill Camerfirma - Hyperion Integration
// @namespace    http://localhost:3000/
// @version      1.0
// @description  Autocompleta solicitudes en Camerfirma extrayendo datos desde Hyperion API
// @author       Hyperion
// @match        https://secure.camerfirma.com/solicitudes_status/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Agrega un botón flotante en la interfaz de Camerfirma para disparar la carga
    const btn = document.createElement('button');
    btn.innerText = '⚡ Auto-rellenar desde Hyperion';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:12px 20px;background:#00668c;color:#fff;font-weight:bold;border:none;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer;';
    
    btn.onclick = function() {
        const certId = prompt('Introduce el ID / Código del expediente en Hyperion:');
        if (!certId) return;

        const script = document.createElement('script');
        script.src = `http://localhost:3000/injector.js?id=${encodeURIComponent(certId)}&v=${Date.now()}`;
        document.head.appendChild(script);
    };

    document.body.appendChild(btn);
})();
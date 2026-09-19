// injector.js - Inyector que corre en la ventana de Camerfirma
(function iniciarReceptorHyperion() {
  console.log("Hyperion Inyector Activo: Esperando señales desde la consola de Next.js...");

  window.addEventListener("message", async (event) => {
    // Escuchar únicamente mensajes dirigidos de inyección
    if (event.data && event.data.type === "HYPERION_START_INJECTION") {
      const { apiUrl, acceptTerms } = event.data;
      console.log("Orden de autocompletado recibida:", event.data);

      const cleanStr = (str) =>
        (str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .trim();

      function fillInput(target, val) {
        if (!val) return false;
        let el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
          el.focus();
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
        return false;
      }

      function fillInputByArray(selectors, val) {
        if (!val) return false;
        for (const selector of selectors) {
          if (fillInput(selector, val)) return true;
        }
        return false;
      }

      function selectOption(selectors, textToFind, codeToFind) {
        let selectEl = null;
        for (const s of selectors) {
          const found = document.querySelector(s);
          if (found) { selectEl = found; break; }
        }
        if (!selectEl || !selectEl.options) return false;

        const targetText = cleanStr(textToFind);
        const targetCode = cleanStr(codeToFind);
        const options = Array.from(selectEl.options);

        let option = options.find(opt => cleanStr(opt.value) === targetCode);
        if (!option && targetText) {
          option = options.find(opt => cleanStr(opt.textContent).includes(targetText));
        }

        if (option) {
          selectEl.value = option.value;
          if (typeof selectEl.onchange === 'function') selectEl.onchange();
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      }

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("No se pudo obtener datos del cliente.");
        const data = await res.json();

        // 1. PASO UBIGEO
        selectOption(['select[name="cmb_departamento"]'], data.departamento, data.ubigeoDept || '11');
        await new Promise(r => setTimeout(r, 1000));

        selectOption(['select[name="cmb_provincia"]'], data.provincia, data.ubigeoProv || '1101');
        await new Promise(r => setTimeout(r, 1000));

        selectOption(['select[name="cmb_distrito"]'], data.distrito, data.ubigeoDist || '110105');
        await new Promise(r => setTimeout(r, 500));

        // 2. PASO TEXTOS
        fillInputByArray(['input[name*="nombre"]', '#nombre'], data.nombre);
        fillInputByArray(['input[name*="primer_apellido"]'], data.primerApellido);
        fillInputByArray(['input[name*="segundo_apellido"]'], data.segundoApellido);

        selectOption(['select[name="tipodoc_id_solicitante"]'], data.tipoDocIdentificativo || 'DNI', '4');
        await new Promise(r => setTimeout(r, 300));

        fillInputByArray(['input[name="txt_num_doc"]', 'input[name="num_doc"]'], data.numDoc || data.numDocumento);
        fillInputByArray(['input[name="domicilio"]'], data.direccion || data.domicilio);
        fillInputByArray(['input[name="codigo_postal"]'], data.codigoPostal || '11003');
        fillInputByArray(['input[name="telefono"]'], data.telefono);

        const emails = document.querySelectorAll('input[type="email"], input[name*="email"]');
        if (emails.length >= 1) fillInput(emails[0], data.email);
        if (emails.length >= 2) fillInput(emails[1], data.email);

        // 3. PASO ACTIVAR CHECKBOX TÉRMINOS Y CONDICIONES
        if (acceptTerms) {
          const termsCheckbox = document.querySelector('input[type="checkbox"][name*="condiciones"], input[type="checkbox"][name*="terminos"], input[type="checkbox"][id*="chk"]');
          if (termsCheckbox && !termsCheckbox.checked) {
            termsCheckbox.click();
            console.log("✓ Términos y Condiciones aceptados.");
          }
        }

        // 4. PASO CARGA DE ARCHIVO PDF
        if (data.documentosAportar && data.documentosAportar.length > 0) {
          const doc = data.documentosAportar[0];
          selectOption(['select[name="tipo_doc"]'], doc.tipoCamerfirma);

          const fullPdfUrl = doc.url.startsWith('http') ? doc.url : `http://localhost:4000${doc.url}`;
          const pdfRes = await fetch(fullPdfUrl);
          const blob = await pdfRes.blob();

          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            const file = new File([blob], 'DNI_Adjunto.pdf', { type: 'application/pdf' });
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Responder al modal de Next.js confirmando el éxito
        if (window.opener) {
          window.opener.postMessage({ type: "HYPERION_INJECTION_SUCCESS" }, "*");
        }

        console.log("¡Inyección automatizada completada al 100%!");
      } catch (err) {
        console.error("Error durante la inyección:", err);
        if (window.opener) {
          window.opener.postMessage({ type: "HYPERION_INJECTION_ERROR", error: err.message }, "*");
        }
      }
    }
  });
})();
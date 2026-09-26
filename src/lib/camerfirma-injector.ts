export function injectCamerfirmaData(targetWindow: Window, certificateData: any) {
  const payload = {
    nombre: certificateData.applicantNames || '',
    primerApellido: certificateData.applicantSurname1 || '',
    segundoApellido: certificateData.applicantSurname2 || '',
    numDoc: certificateData.applicantDocNum || '',
    direccion: certificateData.address || '',
    codigoPostal: certificateData.postalCode || '11003',
    telefono: certificateData.applicantPhone || '',
    email: certificateData.applicantEmail || '',
    departamento: certificateData.department || 'ICA',
    provincia: certificateData.province || 'ICA',
    distrito: certificateData.district || 'PARCONA',
  };

  const scriptText = `
    (async function() {
      const data = ${JSON.stringify(payload)};

      function cleanStr(str) {
        return (str || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toUpperCase().trim();
      }

      function forceInputValue(el, val) {
        if (!el || !val) return false;
        el.disabled = false;
        el.readOnly = false;
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) { nativeSetter.call(el, val); } else { el.value = val; }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        el.blur();
        return true;
      }

      function fillInputByArray(selectors, val) {
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el && forceInputValue(el, val)) return true;
        }
        return false;
      }

      function selectOptionSmart(selectors, targetText) {
        let selectEl = null;
        for (const s of selectors) {
          const found = document.querySelector(s);
          if (found) { selectEl = found; break; }
        }
        if (!selectEl || !selectEl.options) return false;
        const target = cleanStr(targetText);
        const options = Array.from(selectEl.options);
        let option = options.find(opt => cleanStr(opt.textContent || '') === target) ||
                     options.find(opt => cleanStr(opt.textContent || '').includes(target));
        if (option) {
          selectEl.value = option.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      }

      // 1. Inyección Nombres
      fillInputByArray(['input[name*="nombre"]', '#nombre'], data.nombre);
      fillInputByArray(['input[name*="primer_apellido"]', 'input[name*="apellido1"]'], data.primerApellido);
      fillInputByArray(['input[name*="segundo_apellido"]', 'input[name*="apellido2"]'], data.segundoApellido);

      selectOptionSmart(['select[name="tipodoc_id_solicitante"]', 'select[name*="tipo_doc"]'], 'DNI');
      await new Promise(r => setTimeout(r, 500));

      // 2. Ubigeo Asíncrono
      selectOptionSmart(['select[name="cmb_departamento"]', 'select[name="dep_sol"]'], data.departamento);
      await new Promise(r => setTimeout(r, 1000));

      selectOptionSmart(['select[name="cmb_provincia"]', 'select[name="prov_sol"]'], data.provincia);
      await new Promise(r => setTimeout(r, 1000));

      selectOptionSmart(['select[name="cmb_distrito"]', 'select[name="dist_sol"]'], data.distrito);
      await new Promise(r => setTimeout(r, 800));

      // 3. Datos Personales
      fillInputByArray(['#nif_solicitante', 'input[name="nif_solicitante"]', 'input[name="txt_num_doc"]'], data.numDoc);
      fillInputByArray(['input[name="domicilio"]', 'input[name="direccion"]'], data.direccion);
      fillInputByArray(['input[name="cp_solicitante"]', 'input[name="codigo_postal"]', 'input[name="cp"]'], data.codigoPostal);
      fillInputByArray(['input[name="telefono"]'], data.telefono);

      const emails = document.querySelectorAll('input[type="email"], input[name*="email"]');
      if (emails[0]) forceInputValue(emails[0], data.email);
      if (emails[1]) forceInputValue(emails[1], data.email);

      // 4. Marca de Términos
      const termsCheck = document.querySelector('input[type="checkbox"]');
      if (termsCheck && !termsCheck.checked) {
        termsCheck.click();
      }
    })();
  `;

  try {
    const win = targetWindow as unknown as { eval?: (code: string) => void; document?: Document };
    if (typeof win.eval === 'function') {
      win.eval(scriptText);
    } else if (win.document && win.document.body) {
      const scriptEl = win.document.createElement('script');
      scriptEl.textContent = scriptText;
      win.document.body.appendChild(scriptEl);
    }
  } catch (e) {
    console.error('No se pudo inyectar automáticamente por seguridad del navegador:', e);
  }
}
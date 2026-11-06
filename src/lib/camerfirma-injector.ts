// frontend-hyperion/src/lib/camerfirma-injector.ts

export interface CamerfirmaCertificateData {
  applicantNames?: string;
  applicantSurname1?: string;
  applicantSurname2?: string;
  applicantDocNum?: string;
  address?: string;
  postalCode?: string;
  applicantPhone?: string;
  applicantEmail?: string;
  department?: string;
  province?: string;
  district?: string;
}

export function injectCamerfirmaData(targetWindow: Window, certificateData: CamerfirmaCertificateData) {
  // 1. Sanitización de datos para evitar caracteres de escape o inyecciones
  const sanitize = (val: string) => (val || '').replace(/[<>"']/g, '').trim();

  const payload = {
    nombre: sanitize(certificateData.applicantNames || ''),
    primerApellido: sanitize(certificateData.applicantSurname1 || ''),
    segundoApellido: sanitize(certificateData.applicantSurname2 || ''),
    numDoc: (certificateData.applicantDocNum || '').replace(/\D/g, ''),
    direccion: sanitize(certificateData.address || ''),
    codigoPostal: (certificateData.postalCode || '11003').replace(/\D/g, ''),
    telefono: (certificateData.applicantPhone || '').replace(/\D/g, ''),
    email: sanitize(certificateData.applicantEmail || ''),
    departamento: sanitize(certificateData.department || 'ICA'),
    provincia: sanitize(certificateData.province || 'ICA'),
    distrito: sanitize(certificateData.district || 'PARCONA'),
  };

  // 2. Función que se ejecutará en el contexto de targetWindow (mantiene tus tiempos y selects)
  function fillCamerfirmaForm(data: typeof payload) {
    function cleanStr(str: string) {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
    }

    function forceInputValue(el: HTMLInputElement | null, val: string) {
      if (!el || !val) return false;
      el.disabled = false;
      el.readOnly = false;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
      el.blur();
      return true;
    }

    function fillInputByArray(selectors: string[], val: string) {
      for (const s of selectors) {
        const el = document.querySelector<HTMLInputElement>(s);
        if (el && forceInputValue(el, val)) return true;
      }
      return false;
    }

    function selectOptionSmart(selectors: string[], targetText: string) {
      let selectEl: HTMLSelectElement | null = null;
      for (const s of selectors) {
        const found = document.querySelector<HTMLSelectElement>(s);
        if (found) { selectEl = found; break; }
      }
      if (!selectEl || !selectEl.options) return false;
      const target = cleanStr(targetText);
      const options = Array.from(selectEl.options);
      const option = options.find(opt => cleanStr(opt.textContent || '') === target) ||
                     options.find(opt => cleanStr(opt.textContent || '').includes(target));
      if (option) {
        selectEl.value = option.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }

    (async () => {
      // 1. Nombres y Tipo Documento
      fillInputByArray(['input[name*="nombre"]', '#nombre'], data.nombre);
      fillInputByArray(['input[name*="primer_apellido"]', 'input[name*="apellido1"]'], data.primerApellido);
      fillInputByArray(['input[name*="segundo_apellido"]', 'input[name*="apellido2"]'], data.segundoApellido);

      selectOptionSmart(['select[name="tipodoc_id_solicitante"]', 'select[name*="tipo_doc"]'], 'DNI');
      await new Promise(r => setTimeout(r, 500));

      // 2. Ubigeo Asíncrono en Cascada
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

      const emails = document.querySelectorAll<HTMLInputElement>('input[type="email"], input[name*="email"]');
      if (emails[0]) forceInputValue(emails[0], data.email);
      if (emails[1]) forceInputValue(emails[1], data.email);

      // 4. Marca de Términos
      const termsCheck = document.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (termsCheck && !termsCheck.checked) {
        termsCheck.click();
      }
    })();
  }

  // 3. Ejecución segura en el destino sin usar eval()
  try {
    const targetDoc = targetWindow.document;
    if (targetDoc && targetDoc.body) {
      // Inyección mediante script pasándole los argumentos sin eval()
      const scriptEl = targetDoc.createElement('script');
      scriptEl.textContent = `(${fillCamerfirmaForm.toString()})(${JSON.stringify(payload)});`;
      targetDoc.body.appendChild(scriptEl);
      scriptEl.remove(); // Limpieza del DOM tras ejecución
    }
  } catch (e) {
    console.warn('Same-Origin Policy activa: el navegador bloqueó la inyección directa en targetWindow.', e);
  }
}
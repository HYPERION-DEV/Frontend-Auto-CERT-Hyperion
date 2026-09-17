(async function runCamerfirmaInjector() {
  // Extrae el ID del certificado enviado como parámetro en la URL del script
  const scriptTag = document.currentScript || document.querySelector('script[src*="injector.js"]');
  const urlParams = new URLSearchParams(scriptTag?.src.split('?')[1]);
  const certId = urlParams.get('id');

  if (!certId) {
    alert('Error: No se proporcionó el ID del certificado a autocompletar.');
    return;
  }

  const API_URL = `http://localhost:3000/api/cliente/${certId}`;

  // Helper para forzar eventos nativos de JavaScript en el DOM
  function setElementValue(element, value) {
    if (!element) return;
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // Helper para esperar a que los selects dinámicos (Ubigeo) carguen sus opciones
  function selectOptionAsync(selectElement, valueToSelect, timeout = 3000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (!selectElement) {
          clearInterval(interval);
          return resolve(false);
        }

        const options = Array.from(selectElement.options);
        const match = options.find(
          (opt) =>
            opt.value.toUpperCase() === valueToSelect.toUpperCase() ||
            opt.textContent.trim().toUpperCase() === valueToSelect.toUpperCase()
        );

        if (match) {
          setElementValue(selectElement, match.value);
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          resolve(false);
        }
      }, 150);
    });
  }

  try {
    console.log(`[Hyperion] Solicitando datos para expediente: ${certId}...`);
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Respuesta HTTP incorrecta: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Hyperion] Datos recibidos correctamente:', data);

    // Mapeo exacto de los atributos 'name' o 'id' del formulario de Camerfirma
    const fields = {
      nombre: document.querySelector('input[name="nombre"], input[id*="nombre"]'),
      primerApellido: document.querySelector('input[name="primer_apellido"], input[name="apellido1"]'),
      segundoApellido: document.querySelector('input[name="segundo_apellido"], input[name="apellido2"]'),
      tipoDoc: document.querySelector('select[name="tipo_documento"], select[id*="tipo_doc"]'),
      numDoc: document.querySelector('input[name="numero_documento"], input[name="dni"]'),
      email: document.querySelector('input[name="email"], input[type="email"]'),
      emailRepeat: document.querySelector('input[name="email_confirm"], input[name*="repetir"]'),
      telefono: document.querySelector('input[name="telefono"], input[name="phone"]'),
      direccion: document.querySelector('input[name="direccion"], input[name="domicilio"]'),
      cp: document.querySelector('input[name="codigo_postal"], input[name="cp"]'),
      departamento: document.querySelector('select[name="departamento"]'),
      provincia: document.querySelector('select[name="provincia"]'),
      distrito: document.querySelector('select[name="distrito"]'),
    };

    // Asignación de inputs directos
    if (fields.nombre) setElementValue(fields.nombre, data.nombre);
    if (fields.primerApellido) setElementValue(fields.primerApellido, data.primerApellido);
    if (fields.segundoApellido) setElementValue(fields.segundoApellido, data.segundoApellido);
    if (fields.numDoc) setElementValue(fields.numDoc, data.numeroDocumento);
    if (fields.email) setElementValue(fields.email, data.email);
    if (fields.emailRepeat) setElementValue(fields.emailRepeat, data.email);
    if (fields.telefono) setElementValue(fields.telefono, data.telefono);
    if (fields.direccion) setElementValue(fields.direccion, data.direccion);
    if (fields.cp) setElementValue(fields.cp, data.codigoPostal);

    // Asignación en cascada para Selects dependientes (Ubigeo)
    if (fields.departamento) {
      await selectOptionAsync(fields.departamento, data.departamento);
      if (fields.provincia) {
        await selectOptionAsync(fields.provincia, data.provincia);
        if (fields.distrito) {
          await selectOptionAsync(fields.distrito, data.distrito);
        }
      }
    }

    alert('✅ Formulario de Camerfirma completado desde Hyperion con éxito.');
  } catch (error) {
    console.error('[Hyperion Error]', error);
    alert(`❌ No se pudieron inyectar los datos: ${error.message}`);
  }
})();
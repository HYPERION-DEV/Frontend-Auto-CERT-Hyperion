interface Step3Props {
  formData: any;
  setFormData: (data: any) => void;
}

export const Step3Authorization = ({ formData, setFormData }: Step3Props) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 my-4">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">
        Gestión Automatizada de Emisión
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Para agilizar la verificación de su certificado sin requerir su intervención manual en cada paso, crearemos una dirección de correo temporal asociada a su DNI.
      </p>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={formData.useTempEmail ?? true}
          onChange={(e) =>
            setFormData({ ...formData, useTempEmail: e.target.checked })
          }
        />
        <span className="text-sm text-gray-700">
          Autorizo la creación de un alias de correo temporal gestionado por la plataforma para realizar la auto-aceptación de enlaces de confirmación enviadamente por la entidad certificadora.
        </span>
      </label>
    </div>
  );
};
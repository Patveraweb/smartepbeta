-- Habilitar RLS en la tabla de medicamentos
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir que todos los usuarios autenticados y anónimos puedan leer medicamentos
-- (es información pública de una farmacia)
CREATE POLICY "Medicamentos son públicos para lectura" 
ON public.medicamentos 
FOR SELECT 
USING (true);

-- Solo permitir a usuarios autenticados gestionar el inventario (insertar/actualizar/eliminar)
-- En una implementación real, esto se limitaría a roles específicos como 'farmacista' o 'admin'
CREATE POLICY "Solo usuarios autenticados pueden gestionar medicamentos" 
ON public.medicamentos 
FOR ALL 
USING (false) 
WITH CHECK (false);
-- Crear tabla de medicamentos para Cetepfarma
CREATE TABLE public.medicamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  principio_activo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  disponible BOOLEAN NOT NULL DEFAULT true,
  categoria TEXT NOT NULL,
  presentacion TEXT NOT NULL,
  laboratorio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar medicamentos básicos de ejemplo para Cetepfarma
INSERT INTO public.medicamentos (nombre, principio_activo, descripcion, precio, stock, categoria, presentacion, laboratorio) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Analgésico y antipirético para el alivio del dolor y la fiebre', 8.50, 150, 'Analgésicos', 'Caja x 20 tabletas', 'Bayer'),
('Ibuprofeno 400mg', 'Ibuprofeno', 'Antiinflamatorio no esteroideo para dolor e inflamación', 12.75, 120, 'Antiinflamatorios', 'Caja x 24 cápsulas', 'Pfizer'),
('Amoxicilina 500mg', 'Amoxicilina', 'Antibiótico de amplio espectro para infecciones bacterianas', 18.90, 80, 'Antibióticos', 'Caja x 21 cápsulas', 'Abbott'),
('Loratadina 10mg', 'Loratadina', 'Antihistamínico para alergias sin causar somnolencia', 15.25, 95, 'Antihistamínicos', 'Caja x 30 tabletas', 'Bayer'),
('Omeprazol 20mg', 'Omeprazol', 'Inhibidor de la bomba de protones para acidez y reflujo', 22.40, 110, 'Gastroprotectores', 'Caja x 28 cápsulas', 'AstraZeneca'),
('Simvastatina 20mg', 'Simvastatina', 'Para reducir el colesterol y prevenir enfermedades cardiovasculares', 28.60, 70, 'Cardiovasculares', 'Caja x 30 tabletas', 'Merck'),
('Metformina 850mg', 'Metformina', 'Para el control de la diabetes tipo 2', 16.80, 90, 'Antidiabéticos', 'Caja x 30 tabletas', 'Teva'),
('Losartán 50mg', 'Losartán', 'Para el control de la presión arterial alta', 24.50, 85, 'Antihipertensivos', 'Caja x 28 tabletas', 'Merck'),
('Salbutamol Inhalador', 'Salbutamol', 'Broncodilatador para asma y enfermedades respiratorias', 32.90, 45, 'Respiratorios', 'Inhalador 200 dosis', 'GSK'),
('Diclofenaco Gel', 'Diclofenaco', 'Gel antiinflamatorio tópico para dolores musculares', 14.30, 60, 'Tópicos', 'Tubo 30g', 'Voltaren'),
('Cetirizina 10mg', 'Cetirizina', 'Antihistamínico de segunda generación para alergias', 11.20, 105, 'Antihistamínicos', 'Caja x 20 tabletas', 'UCB'),
('Atorvastatina 20mg', 'Atorvastatina', 'Estatina para reducir colesterol y triglicéridos', 35.70, 65, 'Cardiovasculares', 'Caja x 30 tabletas', 'Pfizer'),
('Fluconazol 150mg', 'Fluconazol', 'Antifúngico para infecciones por hongos', 19.85, 55, 'Antifúngicos', 'Cápsula única', 'Pfizer'),
('Ranitidina 150mg', 'Ranitidina', 'Antiácido para úlceras y problemas gástricos', 13.40, 75, 'Gastroprotectores', 'Caja x 20 tabletas', 'GSK'),
('Captopril 25mg', 'Captopril', 'Inhibidor ACE para hipertensión arterial', 21.10, 95, 'Antihipertensivos', 'Caja x 30 tabletas', 'Bristol');

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medicamentos_updated_at
    BEFORE UPDATE ON public.medicamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
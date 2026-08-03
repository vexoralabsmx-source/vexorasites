import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
export const metadata: Metadata = { title: "Privacidad" };
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Confianza"
      title="Política de privacidad"
      updated="3 de agosto de 2026"
      sections={[
        {
          title: "Datos que tratamos",
          body: "Podemos tratar datos de cuenta, proyectos, archivos que subes, registros técnicos y comunicaciones de soporte. No vendemos datos personales.",
        },
        {
          title: "Finalidades",
          body: "Usamos los datos para operar la cuenta, guardar y publicar proyectos, prevenir abuso, resolver errores, mejorar rendimiento y cumplir obligaciones legales.",
        },
        {
          title: "Proveedores",
          body: "El servicio puede apoyarse en Supabase para datos, Cloudinary para medios y la infraestructura de alojamiento configurada. Cada proveedor trata la información bajo sus propias condiciones y medidas de seguridad.",
        },
        {
          title: "Conservación y derechos",
          body: "Conservamos los datos mientras la cuenta esté activa o sean necesarios por obligaciones legítimas. Puedes solicitar acceso, corrección o eliminación mediante el canal de soporte que se publique en tu cuenta.",
        },
        {
          title: "Seguridad",
          body: "Aplicamos control de acceso, validación de entradas, encabezados de seguridad y separación de secretos. Ningún sistema es infalible; reportaremos incidentes cuando la legislación aplicable lo requiera.",
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
export const metadata: Metadata = { title: "Términos de uso" };
export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Términos de uso"
      updated="3 de agosto de 2026"
      sections={[
        {
          title: "1. Servicio",
          body: "Vexora Sites ofrece herramientas para crear, editar y publicar experiencias web. Durante la beta, algunas funciones pueden cambiar, interrumpirse o requerir configuración adicional.",
        },
        {
          title: "2. Tu contenido",
          body: "Conservas la propiedad del contenido que subes. Nos autorizas únicamente a procesarlo, almacenarlo y mostrarlo para prestar el servicio. Debes contar con derechos suficientes sobre textos, imágenes, videos y marcas.",
        },
        {
          title: "3. Uso aceptable",
          body: "No puedes usar el servicio para distribuir malware, suplantar identidades, infringir derechos, acosar, engañar o realizar actividades ilegales. Podemos suspender contenido que ponga en riesgo a usuarios o infraestructura.",
        },
        {
          title: "4. Disponibilidad y backups",
          body: "Trabajamos para mantener el servicio disponible, pero no garantizamos operación ininterrumpida. Debes conservar backups independientes de proyectos críticos; el editor permite exportarlos en formato JSON.",
        },
        {
          title: "5. Limitación",
          body: "En la medida permitida por la ley, Vexora Sites no responde por daños indirectos, pérdida de beneficios o pérdida de datos derivada del uso de una versión beta.",
        },
      ]}
    />
  );
}

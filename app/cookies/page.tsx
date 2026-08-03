import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
export const metadata: Metadata = { title: "Cookies" };
export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Preferencias"
      title="Política de cookies"
      updated="3 de agosto de 2026"
      sections={[
        {
          title: "Esenciales",
          body: "Guardan preferencias necesarias, como tu elección de privacidad y borradores locales de respaldo. No se pueden desactivar desde el banner porque permiten funciones básicas.",
        },
        {
          title: "Analíticas",
          body: "Solo se activan cuando eliges “Aceptar”. Registran visitas, ruta, tamaño de pantalla, sitio de referencia y un identificador aleatorio de sesión. No almacenan el contenido de formularios ni contraseñas.",
        },
        {
          title: "Control",
          body: "Puedes borrar las preferencias y datos locales desde la configuración de tu navegador. Al volver a entrar, Vexora Sites te pedirá elegir nuevamente.",
        },
        {
          title: "Duración",
          body: "La preferencia permanece en el dispositivo hasta que borres el almacenamiento del sitio. Los eventos operativos se conservan solo durante el periodo necesario para análisis y seguridad.",
        },
      ]}
    />
  );
}

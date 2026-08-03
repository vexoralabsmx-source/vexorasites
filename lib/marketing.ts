import { BarChart3, Blocks, Cloud, Globe2, Layers3, MousePointer2, Palette, Sparkles, Users, WandSparkles } from "lucide-react";

export const productFeatures = [
  { icon: MousePointer2, title: "Editor con criterio", text: "Edita contenido, estructura, color y movimiento sin perderte entre paneles técnicos." },
  { icon: Layers3, title: "Sitios multipágina", text: "Crea Inicio, Servicios, Nosotros y cualquier ruta adicional dentro del mismo proyecto." },
  { icon: WandSparkles, title: "Motion con intención", text: "Revelados, profundidad y scroll narrativo con reducción de movimiento incluida." },
  { icon: Palette, title: "Dirección visual real", text: "Plantillas con composición, voz, ritmo y sistemas de color diferentes; no simples recolores." },
  { icon: Cloud, title: "Medios en Cloudinary", text: "Fotos y videos optimizados, organizados y listos para reutilizar en todos tus sitios." },
  { icon: Blocks, title: "Bloques que no se rompen", text: "Construye con secciones responsive y controles seguros para móvil, tablet y escritorio." },
  { icon: Globe2, title: "Publicación separada", text: "Tu borrador puede seguir cambiando sin alterar la versión que ya está viendo el mundo." },
  { icon: BarChart3, title: "Base para crecer", text: "SEO, formularios, analíticas y dominios están planteados como capacidades del producto." },
];

export const plans = [
  { name: "Launch", eyebrow: "Para empezar", price: "$0", period: "para siempre", description: "Convierte tu primera idea en un sitio que ya se siente propio.", cta: "Crear gratis", featured: false, benefits: ["1 sitio activo", "Hasta 3 páginas", "Plantillas esenciales", "Cloudinary y responsive", "Publicación en subdominio Vexora"] },
  { name: "Studio", eyebrow: "Más elegido", price: "$29", period: "USD / mes", description: "Para marcas y freelancers que necesitan publicar con frecuencia.", cta: "Empezar con Studio", featured: true, benefits: ["5 sitios activos", "Hasta 20 páginas por sitio", "Todas las plantillas premium", "Dominio propio y SEO avanzado*", "Formularios y versiones por 30 días*", "Sin insignia de Vexora*"] },
  { name: "Scale", eyebrow: "Para equipos", price: "$79", period: "USD / mes", description: "Una operación creativa con más proyectos, control y colaboración.", cta: "Elegir Scale", featured: false, benefits: ["20 sitios activos", "Páginas ilimitadas", "5 colaboradores*", "Analíticas y formularios avanzados*", "Biblioteca compartida de medios", "Soporte prioritario*"] },
  { name: "Enterprise", eyebrow: "A tu medida", price: "Hablemos", period: "infraestructura dedicada", description: "Para organizaciones que requieren seguridad, gobierno y acompañamiento.", cta: "Contactar", featured: false, benefits: ["Sitios y equipos personalizados", "Roles, SSO y auditoría*", "Design system privado*", "Acuerdos de servicio*", "Migración y acompañamiento"] },
];

export const capabilityStats = [
  ["09", "direcciones visuales premium"],
  ["03", "páginas iniciales por plantilla"],
  ["08", "bloques narrativos esenciales"],
  ["03", "breakpoints siempre visibles"],
];

export const planNotice = "* Capacidades incluidas en la hoja de ruta comercial; se activarán durante la beta antes de iniciar cobros.";

export const valuePillars = [
  { icon: Sparkles, title: "Se siente caro", text: "Tipografía, ritmo, composición y microinteracciones al nivel de una dirección de arte senior." },
  { icon: MousePointer2, title: "Se construye fácil", text: "Decisiones complejas convertidas en controles claros, reversibles y seguros." },
  { icon: Users, title: "Crece contigo", text: "De una landing a una presencia multipágina sin reconstruir todo desde cero." },
];

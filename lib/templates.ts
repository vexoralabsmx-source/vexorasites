import type { SiteSchema, SiteSection, TemplateDefinition } from "@/types/site";

const section = (
  id: string,
  type: SiteSection["type"],
  title: string,
  body: string,
  bg: string,
  fg: string,
  accent: string,
  preset: SiteSection["animation"]["preset"] = "fade-up",
  align: "left" | "center" = "left",
  items?: SiteSection["content"]["items"],
  eyebrow?: string
): SiteSection => ({
  id,
  type,
  variant: `${type}-01`,
  content: {
    eyebrow: eyebrow ?? (type === "hero" ? "Diseño Cinematográfico Vexora" : undefined),
    title,
    body,
    cta: type === "hero" || type === "cta" ? "Descubrir más" : undefined,
    items,
  },
  styles: { background: bg, foreground: fg, accent, align, padding: 104 },
  responsive: { hideMobile: false, mobilePadding: 48 },
  animation: { preset, intensity: 55, scrub: preset === "parallax" },
  locked: false,
});

const makeSite = (
  id: string,
  name: string,
  palette: [string, string, string],
  sections: SiteSection[]
): SiteSchema => ({
  site: {
    id: `demo-${id}`,
    name,
    slug: id,
    description: name,
    templateId: id,
    status: "draft",
    theme: {
      colors: { background: palette[0], foreground: palette[1], accent: palette[2] },
      radius: 18,
    },
  },
  pages: [
    { id: `${id}-home`, name: "Inicio", slug: "", sections },
    {
      id: `${id}-services`,
      name: "Servicios",
      slug: "servicios",
      sections: [
        section(
          `${id}-sv-1`,
          "services",
          "Capacidades diseñadas para impactar.",
          `Un sistema integral alrededor de la visión de ${name}.`,
          palette[0],
          palette[1],
          palette[2],
          "fade-up",
          "left",
          [
            { title: "Estrategia de Marca", text: "Claridad narrativa, visión de mercado y posicionamiento." },
            { title: "Experiencia Digital", text: "Interfaces fluidas creadas para convertir en cada interacción." },
            { title: "Ejecución de Alto Rendimiento", text: "Tecnología robusta y escalable lista para crecer." },
          ]
        ),
        section(
          `${id}-sv-2`,
          "cta",
          "¿Listo para crear algo extraordinario?",
          "Comienza a construir tu nueva presencia digital hoy.",
          palette[2],
          palette[0],
          palette[0],
          "zoom-reveal",
          "center"
        ),
      ],
    },
    {
      id: `${id}-about`,
      name: "Nosotros",
      slug: "nosotros",
      sections: [
        section(
          `${id}-ab-1`,
          "story",
          "La intención define el resultado.",
          `En ${name} combinamos criterio creativo, dirección de arte y tecnología de vanguardia.`,
          palette[1],
          palette[0],
          palette[2],
          "slide-left"
        ),
        section(
          `${id}-ab-2`,
          "contact",
          "Transforma tu idea en realidad.",
          "Escríbenos para agendar una sesión inicial de trabajo.",
          palette[0],
          palette[1],
          palette[2],
          "blur-reveal",
          "center"
        ),
      ],
    },
  ],
});

export const templates: TemplateDefinition[] = [
  // 0. PLANTILLA EN BLANCO (BLANK CANVAS)
  {
    id: "blank-canvas",
    name: "Lienzo en Blanco",
    category: "General",
    description: "Comienza desde cero con una estructura limpia y sin restricciones.",
    palette: ["#050508", "#f8fafc", "#8b5cf6"],
    premium: false,
    schema: makeSite("blank-canvas", "Mi Proyecto Vexora", ["#050508", "#f8fafc", "#8b5cf6"], [
      section(
        "blank-1",
        "hero",
        "Diseña tu sitio desde cero.",
        "Añade bloques, ajusta estilos y crea una experiencia única.",
        "#050508",
        "#f8fafc",
        "#8b5cf6",
        "fade-up",
        "center",
        undefined,
        "Lienzo Inicial"
      ),
    ]),
  },
  // 1. NOIR ATELIER
  {
    id: "noir-atelier",
    name: "Noir Atelier",
    category: "Moda",
    description: "Editorial, silenciosa, minimalista y magnética.",
    palette: ["#0d0b0d", "#f4eee8", "#c084fc"],
    premium: true,
    schema: makeSite("noir-atelier", "Noir Atelier", ["#0d0b0d", "#f4eee8", "#c084fc"], [
      section(
        "na-1",
        "hero",
        "Vestir es construir una presencia.",
        "Piezas de edición limitada, trazadas entre arquitectura, movimiento y alta costura.",
        "#0d0b0d",
        "#f4eee8",
        "#c084fc",
        "blur-reveal",
        "left",
        undefined,
        "Colección Otoño / Invierno"
      ),
      section(
        "na-2",
        "story",
        "Texturas que permanecen en el tiempo.",
        "Cada prenda se confecciona artesanalmente con fibras orgánicas y patrones esculpidos.",
        "#171217",
        "#f4eee8",
        "#a78bfa",
        "parallax",
        "center"
      ),
      section(
        "na-3",
        "cta",
        "La nueva colección ya está disponible.",
        "Reserva una cita privada en nuestro showroom o explora el catálogo en línea.",
        "#1e1b4b",
        "#ffffff",
        "#c084fc",
        "zoom-reveal",
        "center"
      ),
    ]),
  },
  // 2. RITUAL BARBER
  {
    id: "ritual-barber",
    name: "Ritual 77",
    category: "Barbería",
    description: "Oscura, precisa, masculina y con carácter.",
    palette: ["#0a0812", "#f1e8dc", "#a78bfa"],
    premium: false,
    schema: makeSite("ritual-barber", "Ritual 77", ["#0a0812", "#f1e8dc", "#a78bfa"], [
      section(
        "rb-1",
        "hero",
        "El arte de la precisión y el estilo.",
        "Cortes de autor, tratamiento de toalla caliente y una experiencia exclusiva diseñada para ti.",
        "#0a0812",
        "#f1e8dc",
        "#a78bfa",
        "slide-left",
        "left",
        undefined,
        "Barbería & Grooming Club"
      ),
      section(
        "rb-2",
        "services",
        "Nuestros Servicios Signature",
        "Tradición artesanal combinada con lenguaje contemporáneo.",
        "#110c22",
        "#f1e8dc",
        "#c084fc",
        "fade-up",
        "left",
        [
          { title: "Corte Signature", text: "Diagnóstico capilar, lavado orgánico y perfilado con navaja." },
          { title: "Barba Ritual", text: "Toalla caliente, aceite botánico y esculpido a detalle." },
          { title: "Experiencia Total", text: "La combinación completa de corte, barba y facial revitalizante." },
        ]
      ),
      section(
        "rb-3",
        "cta",
        "Reserva tu asiento en Ritual 77.",
        "Agenda tu cita en menos de 60 segundos.",
        "#1e1b4b",
        "#ffffff",
        "#a78bfa",
        "zoom-reveal",
        "center"
      ),
    ]),
  },
  // 3. MESA NUEVE
  {
    id: "mesa-nueve",
    name: "Mesa Nueve",
    category: "Restaurante",
    description: "Narrativa gastronómica editorial e inmersiva.",
    palette: ["#07050e", "#f7f0e6", "#c084fc"],
    premium: false,
    schema: makeSite("mesa-nueve", "Mesa Nueve", ["#07050e", "#f7f0e6", "#c084fc"], [
      section(
        "mn-1",
        "hero",
        "Fuego, estación y memoria.",
        "Una propuesta gastronómica contemporánea nacida del respeto al ingrediente de origen.",
        "#07050e",
        "#f7f0e6",
        "#c084fc",
        "fade-up",
        "left",
        undefined,
        "Cocina de Autor"
      ),
      section(
        "mn-2",
        "story",
        "Cada platillo cuenta una historia de la tierra.",
        "Colaboramos directamente con agricultores y pescadores locales para ofrecer ingredientes frescos cada mañana.",
        "#120d24",
        "#ffffff",
        "#a78bfa",
        "parallax"
      ),
      section(
        "mn-3",
        "testimonial",
        "“Una experiencia gastronómica que se queda en la memoria.”",
        "— Crítica Gastronómica Internacional",
        "#07050e",
        "#f7f0e6",
        "#c084fc",
        "blur-reveal",
        "center"
      ),
    ]),
  },
  // 4. ORBITAL LABS
  {
    id: "orbital-labs",
    name: "Orbital Studio",
    category: "Agencia",
    description: "Tecnología, producto y profundidad visual.",
    palette: ["#050508", "#f8fafc", "#8b5cf6"],
    premium: true,
    schema: makeSite("orbital-labs", "Orbital Studio", ["#050508", "#f8fafc", "#8b5cf6"], [
      section(
        "ol-1",
        "hero",
        "Creamos productos digitales inolvidables.",
        "Estrategia, diseño y desarrollo web para marcas que lideran su industria.",
        "#050508",
        "#f8fafc",
        "#8b5cf6",
        "zoom-reveal",
        "left",
        undefined,
        "Estudio Digital Global"
      ),
      section(
        "ol-2",
        "stats",
        "Resultados comprobados que escalan",
        "Metodología probada para potenciar el crecimiento digital.",
        "#0c0818",
        "#f8fafc",
        "#c084fc",
        "fade-up",
        "left",
        [
          { title: "+180%", text: "Incremento en tasa de conversión" },
          { title: "2.4×", text: "Velocidad de carga mejorada" },
          { title: "32", text: "Premios internacionales de diseño" },
        ]
      ),
      section(
        "ol-3",
        "services",
        "Nuestras Áreas de Dominio",
        "Equipos multidisciplinarios integrados en tu negocio.",
        "#050508",
        "#f8fafc",
        "#a78bfa",
        "slide-left",
        "left",
        [
          { title: "Brand Strategy", text: "Claridad conceptual antes de escribir una sola línea de código." },
          { title: "UI/UX Design", text: "Interfaces fluidas, intuitivas y con estética cinematográfica." },
          { title: "Next.js Engineering", text: "Arquitectura frontend ultrarrápida optimizada para motores de búsqueda." },
        ]
      ),
    ]),
  },
  // 5. FORGE ATHLETIC
  {
    id: "forge-athletic",
    name: "Forge Athletic",
    category: "Gimnasio",
    description: "Energía cinematográfica, rendimiento y actitud.",
    palette: ["#090614", "#f2f0e9", "#c084fc"],
    premium: true,
    schema: makeSite("forge-athletic", "Forge Athletic", ["#090614", "#f2f0e9", "#c084fc"], [
      section(
        "fa-1",
        "hero",
        "Entrena para superar tus propios límites.",
        "Fuerza, rendimiento y comunidad en un centro de alto nivel.",
        "#090614",
        "#f2f0e9",
        "#c084fc",
        "blur-reveal",
        "left",
        undefined,
        "High Performance Training"
      ),
      section(
        "fa-2",
        "stats",
        "Disciplina y constancia operacional",
        "Un sistema diseñado para transformar tu rendimiento físico.",
        "#140c2a",
        "#f2f0e9",
        "#a78bfa",
        "zoom-reveal",
        "left",
        [
          { title: "60 MIN", text: "Duración por sesión intensa" },
          { title: "100%", text: "Coaching personalizado" },
          { title: "30 DÍAS", text: "Garantía de resultados" },
        ]
      ),
      section(
        "fa-3",
        "cta",
        "Obtén tu pase de evaluación sin costo.",
        "Ven a conocer nuestras instalaciones y prueba el sistema Forge.",
        "#8b5cf6",
        "#ffffff",
        "#090614",
        "slide-left",
        "center"
      ),
    ]),
  },
  // 6. MARA VISUAL
  {
    id: "mara-visual",
    name: "Mara Visual",
    category: "Portafolio",
    description: "Artístico, fotográfico, audaz y contemporáneo.",
    palette: ["#050508", "#ffffff", "#c084fc"],
    premium: false,
    schema: makeSite("mara-visual", "Mara Visual", ["#050508", "#ffffff", "#c084fc"], [
      section(
        "mv-1",
        "hero",
        "Fotografía y dirección de arte vanguardista.",
        "Capturando la esencia de marcas globales y campañas de moda.",
        "#050508",
        "#ffffff",
        "#c084fc",
        "slide-left",
        "left",
        undefined,
        "Visual Studio & Art Direction"
      ),
      section(
        "mv-2",
        "gallery",
        "Proyectos Destacados 2026",
        "Selección de campañas editoriales y proyectos cinematográficos.",
        "#0e091d",
        "#ffffff",
        "#a78bfa",
        "parallax"
      ),
      section(
        "mv-3",
        "contact",
        "Iniciemos una conversación creativa.",
        "Disponible para comisiones internacionales y proyectos especiales.",
        "#1e1b4b",
        "#ffffff",
        "#c084fc",
        "blur-reveal",
        "center"
      ),
    ]),
  },
  // 7. ZENITH WELLNESS (NUEVA)
  {
    id: "zenith-wellness",
    name: "Zenith Longevity",
    category: "Salud",
    description: "Centro holístico de bienestar y medicina preventiva.",
    palette: ["#080612", "#f7fafc", "#a78bfa"],
    premium: true,
    schema: makeSite("zenith-wellness", "Zenith Longevity", ["#080612", "#f7fafc", "#a78bfa"], [
      section(
        "zw-1",
        "hero",
        "Optimiza tu vitalidad y longevidad.",
        "Medicina preventiva personalizada, terapias de regeneración y biohacking avanzado.",
        "#080612",
        "#f7fafc",
        "#a78bfa",
        "fade-up",
        "left",
        undefined,
        "Wellness & Longevity Institute"
      ),
      section(
        "zw-2",
        "services",
        "Nuestras Terapias Integrales",
        "Tecnología médica de vanguardia al servicio de tu bienestar.",
        "#110a24",
        "#f7fafc",
        "#c084fc",
        "fade-up",
        "left",
        [
          { title: "Optimización Hormonal", text: "Evaluación celular y protocolos de rejuvenecimiento." },
          { title: "Crioterapia & Sauna Infrarrojo", text: "Recuperación muscular acelerada y desintoxicación." },
          { title: "Nutrición Intravenosa", text: "Cocteles de vitaminas e hidratación de alta absorción." },
        ]
      ),
      section(
        "zw-3",
        "cta",
        "Agenda tu valoración inicial de salud.",
        "Descubre tu edad biológica y diseña tu plan personalizado.",
        "#1e1b4b",
        "#ffffff",
        "#c084fc",
        "zoom-reveal",
        "center"
      ),
    ]),
  },
  // 8. AETHER 3D STUDIO (NUEVA)
  {
    id: "aether-design",
    name: "Aether Motion & VFX",
    category: "Tecnología",
    description: "Estudio de animación 3D, efectos visuales y render real.",
    palette: ["#05040a", "#f8fafc", "#c084fc"],
    premium: true,
    schema: makeSite("aether-design", "Aether Motion & VFX", ["#05040a", "#f8fafc", "#c084fc"], [
      section(
        "ad-1",
        "hero",
        "Renders fotorrealistas y animación 3D.",
        "Damos vida a conceptos hiperrealistas para arquitectura, producto y cinematografía.",
        "#05040a",
        "#f8fafc",
        "#c084fc",
        "zoom-reveal",
        "left",
        undefined,
        "3D & VFX Studio"
      ),
      section(
        "ad-2",
        "story",
        "Superando los límites del renderizado visual.",
        "Utilizamos pipelines de render por GPU de última generación para crear experiencias inmersivas.",
        "#120a26",
        "#f8fafc",
        "#a78bfa",
        "parallax"
      ),
      section(
        "ad-3",
        "cta",
        "¿Tienes una visión en 3D?",
        "Hablemos sobre tu siguiente producción visual.",
        "#8b5cf6",
        "#ffffff",
        "#05040a",
        "blur-reveal",
        "center"
      ),
    ]),
  },
];

export function cloneTemplate(templateId: string, name?: string): SiteSchema {
  const source = templates.find((item) => item.id === templateId) ?? templates[0];
  const schema = structuredClone(source.schema);
  if (name) schema.site.name = name;
  return schema;
}

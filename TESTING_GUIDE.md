# Testing Guide - Portfolio Interactivo

## Estadísticas del Proyecto

- **JavaScript**: 8,776 líneas (core + 5 módulos funcionales)
- **CSS**: 5,390+ líneas (11 archivos modularizados)
- **HTML**: 835 líneas (componentes + shell)
- **JSON Data**: 373 líneas (4 archivos)
- **Total Archivos**: 39 archivos nuevos/modificados

## Requisitos Previos

### Configuración de Formspree (IMPORTANTE)
Antes de probar el formulario, debes configurar tu Form ID:

1. Ve a [formspree.io](https://formspree.io)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo formulario y obtén tu ID (ejemplo: `YOUR_FORM_ID`)
4. Edita el archivo `components/forms.html`
5. Reemplaza `YOUR_FORM_ID` en la línea de acción del formulario:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

## Cómo Probar Localmente

### Opción 1: Servidor Python (Recomendado)
```bash
# En la raíz del proyecto
cd /Users/normancarrasco/Downloads/Potafolio
python3 -m http.server 8000

# Luego abre en navegador:
# http://localhost:8000
```

### Opción 2: Servidor Node.js
```bash
npx http-server

# O instala globalmente:
npm install -g http-server
http-server
```

### Opción 3: Live Server (VS Code)
- Instala la extensión "Live Server"
- Click derecho en `index.html`
- Selecciona "Open with Live Server"

## Features a Probar

### 1. Dark Mode ✨
- [ ] Busca el botón de tema en la navbar (sol/luna)
- [ ] Click para alternar entre claro/oscuro
- [ ] Verifica que persista después de recargar
- [ ] Verifica que el localStorage tenga `theme: dark` o `theme: light`

**Prueba en consola:**
```javascript
localStorage.getItem('theme') // Debe retornar 'dark' o 'light'
document.documentElement.classList.contains('dark-theme') // Debe retornar true/false
```

### 2. Validación de Formulario 📝
- [ ] Navega a la sección "Contacto"
- [ ] Intenta enviar sin llenar campos (debe mostrar errores)
- [ ] Escribe menos de 3 caracteres en nombre (error)
- [ ] Escribe un email inválido (error)
- [ ] Completa todos los campos correctamente
- [ ] Verifica que el botón se active
- [ ] Envía el formulario (debe mostrar "Enviando...")
- [ ] Después de envío exitoso, debe limpiar el formulario

**Campos validados:**
- Nombre: 3-50 caracteres
- Email: Formato válido
- Asunto: 5-100 caracteres
- Mensaje: 10-5000 caracteres

**Prueba en consola:**
```javascript
const form = document.querySelector('form')
const submitBtn = form.querySelector('[type="submit"]')
submitBtn.disabled // Debe retornar true mientras hay errores
```

### 3. Animaciones al Scroll 🎬
- [ ] Abre la página en el navegador
- [ ] Scroll hacia abajo lentamente
- [ ] Observa que las cards se desvanecen (fade-in)
- [ ] Los títulos se deslizan hacia arriba (slide-up)
- [ ] Los contadores de estadísticas se animan
- [ ] Verifica que sea suave sin saltos

**Elementos animados:**
- Cards de proyectos, testimonios, certificados
- Títulos de secciones
- Barras de skills
- Contadores numéricos

### 4. Filtros Interactivos 🔍
- [ ] Navega a la sección "Proyectos"
- [ ] Verifica botones de filtro (Data, BI, Analytics, etc.)
- [ ] Click en un filtro (debe resaltarse)
- [ ] Solo proyectos de esa categoría se muestran
- [ ] Verifica counter: "X de Y proyectos"
- [ ] Click en otro filtro (solo muestra proyectos de ambas)
- [ ] Click en "Limpiar filtros" (muestra todos)
- [ ] Prueba igual en sección "Skills"

**URL debe cambiar:**
```
http://localhost:8000/#proyectos?filters=Data
http://localhost:8000/#proyectos?filters=Data&BI
```

**Prueba en consola:**
```javascript
window.appState.getState('filters') // Retorna objeto con filtros activos
```

### 5. Búsqueda Global 🔎
- [ ] Busca el input de búsqueda en la navbar
- [ ] Escribe "python" (debe mostrar proyectos/skills con Python)
- [ ] Escribe "banreservas" (debe mostrar experiencia)
- [ ] Verifica que el match esté resaltado en <mark> tags
- [ ] Presiona ESC para cerrar resultados
- [ ] Navega resultados con arrow keys
- [ ] Presiona ENTER para ir al resultado

**Características:**
- Fuzzy matching (busca parcial)
- Debounce 300ms para performance
- Máximo 8 resultados mostrados
- Busca en: títulos, descripciones, skills, experiencia

### 6. Responsividad 📱
Prueba en diferentes tamaños:

**Desktop (1920x1080):**
- [ ] 3-column grid para proyectos
- [ ] Navbar horizontal con todos los links
- [ ] Layout óptimo

**Tablet (768x1024):**
- [ ] 2-column grid para proyectos
- [ ] Navbar se adapta
- [ ] Sin overflow

**Mobile (375x812):**
- [ ] 1-column grid para proyectos
- [ ] Hamburger menu en navbar
- [ ] Touch-friendly buttons
- [ ] Sin horizontal scroll

**Prueba en Chrome DevTools:**
```
F12 → Ctrl+Shift+M (Toggle device toolbar)
```

### 7. Accesibilidad ♿
- [ ] Navega con Tab key (debe funcionar)
- [ ] Focus indicators visibles
- [ ] Screen reader (si tienes NVDA/JAWS)
- [ ] Colores con suficiente contraste en ambos temas
- [ ] Alt text en imágenes

**Verificar contraste:**
```javascript
// En DevTools Inspector, selecciona elemento
// Verifica WCAG AA (4.5:1 para texto normal)
```

## Verificación Final

### 1. Console Check
Abre la consola (F12) y verifica:
- ✅ Sin errores rojos
- ✅ Sin advertencias críticas
- ✅ Mensaje `[APP] Portfolio loaded successfully` al cargar

### 2. Network Check
En DevTools → Network:
- ✅ Todos los archivos CSS/JS cargan (status 200)
- ✅ Sin requests fallidas (404, 500)
- ✅ Load time < 2 segundos

### 3. Lighthouse Check
DevTools → Lighthouse:
- ✅ Performance > 90
- ✅ Accessibility > 90
- ✅ Best Practices > 90
- ✅ SEO > 90

```bash
# O instala lighthouse globalmente:
npm install -g lighthouse
lighthouse http://localhost:8000 --view
```

## Troubleshooting

### "Componentes no cargan"
**Problema:** Ves elementos vacíos en la página
**Solución:**
1. Verifica que estés corriendo un servidor (no file://)
2. Abre DevTools (F12) → Console
3. Verifica si hay errores de CORS
4. Recarga la página (Ctrl+Shift+R)

### "Tema no persiste"
**Problema:** Dark mode se resetea al recargar
**Solución:**
1. Verifica localStorage no esté deshabilitado
2. En DevTools → Application → localStorage
3. Debe haber entrada con key `theme`

### "Formulario no funciona"
**Problema:** Botón submit deshabilitado o no envía
**Solución:**
1. Verifica que completaste la configuración Formspree
2. Abre DevTools → Console
3. Busca errores de validación
4. Verifica que email sea válido

### "Búsqueda no encuentra nada"
**Problema:** Search no retorna resultados
**Solución:**
1. Abre DevTools → Console
2. Escribe: `console.log(window.portfolioData)`
3. Verifica que los datos estén cargados
4. Intenta con palabras clave válidas

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Bundle Size**: < 150KB
- **CSS Minified**: ~45KB
- **JS Minified**: ~35KB

## Browser Support

Probado en:
- ✅ Chrome/Edge 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ iOS Safari 12.2+
- ✅ Android Chrome 76+

## Deployment (GitHub Pages)

El sitio está listo para desplegar a GitHub Pages:

```bash
# Ya está en main branch, solo push:
git push origin main

# Habilita GitHub Pages:
# Settings → Pages → Deploy from branch → main
# El sitio estará en: https://NCarrasco.github.io/norman-portafolio
```

## Checklist Final

- [ ] Dark mode funciona y persiste
- [ ] Formulario valida correctamente
- [ ] Animaciones suaves al scroll
- [ ] Filtros funcionan en proyectos y skills
- [ ] Búsqueda encuentra contenido
- [ ] Responsivo en mobile/tablet/desktop
- [ ] Sin errores en consola
- [ ] Lighthouse score > 90
- [ ] Formspree configurado
- [ ] Listo para deploy a GitHub Pages

---

¡Felicidades! Tu portfolio ahora es completamente interactivo y moderno. 🎉

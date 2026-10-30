# MATERIAL_EVALUACION.md

## Proyecto
**Spring Boot Learning Lab**

Aplicación web educativa e interactiva para la Evaluación Unidad 1 de la asignatura **Desarrollo de Software Web II**.

La aplicación no debe funcionar como un documento Word trasladado a una página web. Su objetivo es que cualquier estudiante pueda **aprender interactuando** con los contenidos exigidos por la evaluación.

---

## Objetivo general

Explicar de forma clara, visual e interactiva cómo funciona Spring Boot por dentro, su arquitectura MVC en capas, sus archivos de configuración, buenas prácticas y tendencias actuales.

La experiencia debe seguir esta lógica:

1. El estudiante aprende un concepto.
2. Interactúa con una demostración o ejemplo.
3. Observa qué ocurre.
4. Recibe una explicación.
5. Comprueba lo aprendido mediante una actividad breve.
6. Avanza al siguiente módulo.

---

## Caso práctico elegido

**Caso 3 — Sistema de Préstamo de Libros o Equipos del Instituto**

Un estudiante puede:
- consultar recursos disponibles;
- solicitar el préstamo de un libro, notebook u otro equipo;
- registrar una devolución;
- visualizar el estado de un préstamo.

Este caso debe mantenerse coherente en todos los ejemplos de la aplicación.

Clases principales recomendadas:
- `Alumno`
- `Recurso`
- `Prestamo`
- `PrestamoRepository`
- `PrestamoService`
- `PrestamoController`
- `PrestamoRequest`
- `PrestamoResponse`

---

# CONTENIDO OBLIGATORIO DE LA EVALUACIÓN

La evaluación se desarrolla mediante cuatro fases.

## FASE 1 — ¿Cómo funciona Spring Boot y su Arquitectura MVC en Capas?

### 1. Motor de Spring Boot
Debe enseñar:

- `@SpringBootApplication`
- `@Configuration`
- `@EnableAutoConfiguration`
- `@ComponentScan`
- Autoconfiguración
- Starters
- `spring-boot-starter-web`
- Inversión de Control (IoC)
- Inyección de Dependencias
- `ApplicationContext`
- Beans
- Servidor Tomcat embebido
- Diferencia frente al despliegue tradicional con Tomcat externo

### Interacción educativa sugerida

Botón:
**Ejecutar Spring Boot**

Mostrar paso a paso:

`@SpringBootApplication`
→ Autoconfiguración
→ Component Scan
→ ApplicationContext
→ creación de Beans
→ Inyección de Dependencias
→ inicio de Tomcat
→ Aplicación lista

Cada elemento debe poder abrir una explicación breve y un ejemplo.

---

### 2. Arquitectura MVC y recorrido de una petición

Debe enseñar el flujo:

Usuario / Navegador / Postman
→ Petición HTTP
→ DispatcherServlet
→ Controller
→ Service
→ Repository
→ Base de datos
→ Repository
→ Service
→ Controller
→ Respuesta HTTP
→ Usuario

Conceptos obligatorios:

- DispatcherServlet
- `@Controller`
- `@RestController`
- diferencia entre HTML y JSON
- `@Service`
- lógica de negocio
- `@Repository`
- `@Entity`
- Spring Data JPA
- métodos HTTP GET, POST, PUT, DELETE

### Interacción educativa sugerida

Caso:
**Ana solicita un notebook**

El estudiante pulsa:
**Enviar solicitud**

La aplicación muestra cada etapa del recorrido.

En ciertos pasos puede preguntar:

> ¿Qué componente debe recibir ahora la petición?

Opciones de ejemplo:
- Repository
- DispatcherServlet
- Entity

Luego explicar la respuesta correcta.

---

## FASE 2 — Archivos de Configuración y Ejemplos Aplicados al Caso

### 1. `pom.xml`

Debe enseñar para qué sirve Maven y explicar las dependencias principales:

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- H2 / MySQL / PostgreSQL como conector de base de datos

### Interacción sugerida

Mostrar las dependencias como tarjetas clickeables.
Cada tarjeta explica:
- qué agrega;
- para qué se utiliza;
- dónde se usa dentro del caso de préstamos.

---

### 2. `application.properties` y `application.yml`

Debe explicar:

- `server.port`
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.jpa.show-sql`
- `spring.jpa.hibernate.ddl-auto`

Debe comparar visualmente:

`application.properties`
vs.
`application.yml`

### Laboratorio interactivo sugerido

Permitir cambiar:

`server.port=8080`

a:

`server.port=8081`

Luego alternar entre:

**PROPERTIES** | **YAML**

para observar la misma configuración expresada en ambos formatos.

---

### 3. Profiles

Explicar:

- `application-dev.properties`
- `application-prod.properties`
- por qué una empresa utiliza configuraciones distintas en desarrollo y producción.

Ejemplo:

DEV:
- H2
- mostrar SQL
- configuración local

PROD:
- base de datos real
- variables de entorno
- ocultar información sensible

---

### 4. Ejemplo de código por capas

La evaluación exige un ejemplo pequeño pero completo que conecte:

`@Entity`
→ `@Repository`
→ `@Service`
→ `@RestController`

Caso:
**Registrar un préstamo**

Debe existir coherencia entre la teoría y el código.

IMPORTANTE:
- no devolver directamente la Entity desde el Controller;
- utilizar `PrestamoRequest` para entrada;
- utilizar `PrestamoResponse` para salida;
- mantener las reglas de negocio en `PrestamoService`.

Ejemplos de reglas:
- verificar que el recurso exista;
- verificar disponibilidad;
- evitar prestar un recurso que ya está ocupado.

---

## FASE 3 — Buenas Prácticas y Últimas Tendencias

### 1. Organización del código

Paquetes recomendados:

```text
controller
service
repository
entity
dto
exception
config
```

Explicar la responsabilidad de cada paquete.

---

### 2. DTOs

Explicar:

- qué es un DTO;
- por qué no se debe exponer directamente una Entity;
- ejemplo de un campo sensible como `password`.

Interacción sugerida:

Mostrar una Entity:

```java
@Entity
class Alumno {
    Long id;
    String nombre;
    String correo;
    String password;
}
```

Preguntar:

> ¿Enviarías esta Entity directamente al usuario?

Respuesta correcta:
**No**

Luego mostrar un DTO seguro.

---

### 3. Validaciones

Debe mostrar:

- `@Valid`
- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Min`

Ejemplo de interacción:

Formulario con datos inválidos.
Al enviarlo, explicar qué validación falló.

---

### 4. Manejo centralizado de errores

Debe enseñar:

- `@ControllerAdvice` o `@RestControllerAdvice`
- `@ExceptionHandler`
- códigos HTTP:
  - 200 OK
  - 201 Created
  - 400 Bad Request
  - 404 Not Found

---

### 5. Seguridad básica

Explicar por qué no se deben subir contraseñas reales a GitHub.

Ejemplo incorrecto:

```properties
spring.datasource.password=ClaveReal123
```

Ejemplo recomendado:

```properties
spring.datasource.password=${DB_PASSWORD}
```

Explicar variables de entorno.

---

# TENDENCIAS ACTUALES

La evaluación pide trabajar con Spring Boot 3.x y Java moderno.

## Java Records

Explicar su utilidad para DTOs compactos.

Ejemplo:

```java
public record PrestamoResponse(
    Long id,
    String alumno,
    String recurso,
    String estado
) {}
```

---

## Virtual Threads

Explicar:

- qué son;
- que son más livianos que los hilos tradicionales;
- que permiten manejar muchas tareas concurrentes que esperan I/O;
- que no hacen automáticamente más rápido un cálculo individual;
- que son especialmente útiles con muchas solicitudes concurrentes.

Configuración a mostrar:

```properties
spring.threads.virtual.enabled=true
```

Interacción sugerida:

Comparar visualmente:

**Hilos tradicionales**
vs.
**Virtual Threads**

Mostrar varias solicitudes esperando base de datos o servicios externos.

---

## Spring Boot Actuator

Debe explicar y, si es posible, demostrar:

`/actuator/health`

Ejemplo:

```json
{
  "status": "UP"
}
```

La aplicación puede incluir un botón:

**Consultar estado**

que haga una llamada real al endpoint.

---

## Swagger / OpenAPI

Debe explicar:

- documentación automática de APIs;
- visualización de endpoints;
- parámetros;
- request/response;
- códigos HTTP;
- posibilidad de probar endpoints.

Si SpringDoc está instalado, incluir acceso real a Swagger UI.

---

## Docker

Explicar:

Aplicación Spring Boot
+ entorno de ejecución
+ configuración
→ contenedor Docker

El proyecto puede incluir un `Dockerfile` como demostración real.

---

## FASE 4 — Conclusión y reflexión

La aplicación debe cerrar reforzando que:

- no basta con copiar código que funciona;
- comprender la arquitectura permite saber dónde realizar cambios;
- Controller, Service y Repository tienen responsabilidades diferentes;
- las configuraciones y validaciones forman parte de una aplicación profesional;
- buenas prácticas y herramientas modernas ayudan a mantener, documentar, monitorear y desplegar sistemas reales.

Puede incluir una actividad de reflexión y un pequeño desafío final.

---

# ESTRUCTURA DE LA EXPERIENCIA

## Splash

Nombre sugerido:

**Spring Boot Learning Lab**

Texto breve:

> Aprende cómo funciona una aplicación Spring Boot por dentro.

Botón:

**Comenzar aprendizaje**

El splash debe ser limpio y corto. No debe contener toda la materia.

---

## Página principal

Mostrar:

- progreso del estudiante;
- cuatro módulos;
- acceso claro a cada módulo.

Módulos:

1. **Spring Boot por dentro**
2. **Configura tu aplicación**
3. **Buenas prácticas y tendencias**
4. **Comprueba lo aprendido**

---

# PRINCIPIO PEDAGÓGICO

La aplicación debe sentirse como un pequeño laboratorio educativo.

NO debe ser:

- un Word dentro de una página web;
- una colección de párrafos largos;
- una app basada únicamente en preguntas;
- una interfaz llena de animaciones decorativas.

SÍ debe permitir:

- leer explicaciones breves;
- pulsar botones;
- recorrer procesos;
- observar cambios;
- comparar configuraciones;
- probar ejemplos;
- recibir retroalimentación;
- comprobar lo aprendido.

Cada interacción debe estar relacionada directamente con un contenido exigido por la evaluación.

---

# BACKEND DEMOSTRATIVO

El backend debe mantenerse pequeño y servir a la enseñanza.

Arquitectura:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
H2
```

Objetivo principal:
Demostrar un préstamo real sin convertir el proyecto en un sistema de gestión completo.

No desarrollar funciones innecesarias que no aporten a la evaluación.

---

# TECNOLOGÍAS DEL PROYECTO

- Java 21
- Spring Boot 3.x
- Maven
- Maven Wrapper obligatorio:
  - `.mvn/`
  - `mvnw`
  - `mvnw.cmd`
- Spring Web MVC
- Thymeleaf
- Spring Data JPA
- H2
- Validation
- HTML
- CSS
- JavaScript
- Spring Boot Actuator
- SpringDoc / Swagger UI
- Dockerfile

---

# CORRECCIONES IMPORTANTES DEL MATERIAL ORIGINAL

1. En el ejemplo de Fase 2, no devolver directamente `Prestamo` Entity desde el Controller.
2. Utilizar un DTO de salida `PrestamoResponse`.
3. Si el texto dice que el Service valida, el código debe mostrar al menos una validación real.
4. Incluir ejemplos concretos de `@Email` y `@Min` además de `@NotBlank` y `@NotNull`.
5. Mantener siempre los mismos nombres de clases y el mismo caso práctico.
6. Evitar repetir explicaciones completas en varios módulos.
7. El contenido largo debe convertirse en interacción, diagramas, pestañas y ejemplos breves.
8. Incluir bibliografía/fuentes dentro de la aplicación o en una sección final.

---

# ESTADO ACTUAL DEL PROYECTO

La aplicación Spring Boot ya levanta correctamente en `http://localhost:8080`.

Problema observado:

**El splash no aparece y la aplicación entra directamente a la pantalla principal.**

Antes de modificar archivos, se debe revisar la implementación actual del splash y determinar la causa.

---

# REGLA PARA CODEX

Cuando Codex reciba este archivo:

- primero debe analizar;
- no debe modificar nada sin aprobación;
- debe comparar el proyecto con este material;
- debe informar qué falta y qué está bien;
- debe proponer un plan antes de editar;
- debe mantener el alcance educativo de la aplicación;
- no debe convertirla en un CRUD grande ni alterar partes que ya funcionen sin necesidad.


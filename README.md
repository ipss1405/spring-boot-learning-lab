# Spring Boot Learning Lab

Aplicación educativa interactiva para la **Evaluación Unidad 1 de Desarrollo de Software Web II**. Enseña Spring Boot mediante el caso de préstamos de libros y equipos de un instituto: observar, comprender, interactuar, comprobar y recibir retroalimentación.

El recorrido tiene **cuatro módulos**, más Laboratorio, Vocabulario y Fuentes como páginas de apoyo. Combina simulaciones identificadas como educativas con un backend real que registra préstamos, permite devolverlos y conserva el historial en H2.

## Tecnologías y requisitos

| Tecnología | Uso real en el proyecto |
|---|---|
| Java 21 | Versión de compilación; Records para DTOs y Virtual Threads habilitados |
| Spring Boot 3.5.16 | Autoconfiguración y servidor Tomcat embebido |
| Spring Web MVC y Thymeleaf | API REST y plantilla de entrada `index.html` |
| Spring Data JPA / Hibernate | Repositories, mapeo de entidades y persistencia |
| Jakarta Validation | Validación de DTOs y del ID de devolución |
| H2 | Base de datos local persistente en archivo |
| Spring Boot Actuator | Salud e información de la aplicación |
| springdoc-openapi 2.10.0 | Descripción OpenAPI y Swagger UI |
| Maven 3.9.11 mediante Wrapper | Dependencias, compilación, pruebas y empaquetado |
| HTML, CSS y JavaScript sin framework adicional | Vistas educativas, Fetch y progreso local |
| Docker | Imagen de ejecución con Eclipse Temurin 21 JRE |

Las versiones declaradas están en [pom.xml](pom.xml), [mvnw.cmd](mvnw.cmd), [mvnw](mvnw) y [.mvn/wrapper/maven-wrapper.properties](.mvn/wrapper/maven-wrapper.properties).

Se necesita JDK 21 y un navegador moderno. No es necesario instalar Maven globalmente: los scripts descargan Maven la primera vez y reutilizan `~/.m2/wrapper/dists`. Se requiere conexión inicial para Maven y las dependencias. En Windows se utiliza PowerShell para descargar y extraer; en Linux/macOS, `curl` o `wget` y `unzip`.

## Ejecutar

Abrir una terminal **en la raíz del proyecto**. La ruta relativa de H2 depende de esa carpeta.

Windows / PowerShell:

```powershell
java -version
.\mvnw.cmd spring-boot:run
```

Linux / macOS:

```sh
java -version
sh ./mvnw spring-boot:run
```

Abrir [http://localhost:8080](http://localhost:8080). Detener con `Ctrl+C` en la terminal correspondiente.

| Ruta | Función |
|---|---|
| `/` | Aplicación educativa |
| `/api/recursos` | Consulta de recursos |
| `/api/prestamos` | Consulta y registro de préstamos |
| `/api/prestamos/{id}/devolucion` | Devolución mediante PATCH |
| `/actuator/health` | Estado real de salud |
| `/actuator/info` | Información configurada de la aplicación |
| `/swagger-ui.html` | Acceso a Swagger UI |
| `/v3/api-docs` | Documento OpenAPI en JSON |
| `/h2-console/` | Consola técnica de H2 |

Las pantallas internas se muestran mediante JavaScript dentro de la plantilla principal; no son rutas HTTP independientes.

## Arquitectura por capas

```text
Navegador / Fetch
    → Controller REST (DTO de entrada y salida)
    → Service (reglas y transacciones)
    → Repository (Spring Data JPA)
    → JPA / Hibernate (mapeo de Entities)
    → H2
```

Una Entity define el modelo persistente; no es un intermediario HTTP. Los DTOs, las excepciones y la configuración tienen responsabilidades de apoyo, no representan pasos consecutivos después de Entity.

| Paquete / componente | Responsabilidad |
|---|---|
| `controller/VistaController` | `@Controller`: GET `/` devuelve la vista Thymeleaf `index` |
| `controller/PrestamoController` y `RecursoController` | `@RestController`: reciben HTTP y devuelven DTOs JSON |
| `service/PrestamoService` | Registro y devolución transaccionales; listado de préstamos |
| `service/RecursoService` | Consulta de recursos y conversión a DTO |
| `repository` | `PrestamoRepository` y `RecursoRepository` extienden `JpaRepository` |
| `entity` | `Prestamo` y `Recurso` representan los datos almacenados |
| `dto` | Records `PrestamoRequest`, `PrestamoResponse` y `RecursoResponse` |
| `exception` | Excepciones de negocio y `GlobalExceptionHandler` |
| `config/DatosInicialesConfig` | Carga cuatro recursos únicamente si la tabla de recursos está vacía |

El paquete base es `com.rosita.learninglab`. La inyección de dependencias de Controllers y Services se realiza por constructor.

### Modelo y DTOs

| Tabla | Columnas |
|---|---|
| `PRESTAMO` | `ID`, `NOMBRE_ALUMNO`, `CORREO_ALUMNO`, `FECHA_PRESTAMO`, `ESTADO`, `RECURSO_ID` |
| `RECURSO` | `ID`, `NOMBRE`, `TIPO`, `DISPONIBLE` |

Los IDs usan generación `IDENTITY`. `Prestamo.recurso` es una relación `@ManyToOne(fetch = EAGER, optional = false)` hacia `Recurso`.

- `PrestamoRequest` recibe `nombreAlumno`, `correoAlumno` y `recursoId`.
- `PrestamoResponse` devuelve `id`, `nombreAlumno`, `correoAlumno`, `recursoId`, `recurso`, `tipoRecurso`, `estado` y `fechaPrestamo`.
- `RecursoResponse` devuelve `id`, `nombre`, `tipo` y `disponible`.

El nombre y el tipo del recurso que aparecen en `PrestamoResponse` provienen de la relación con `RECURSO`; no son columnas adicionales de `PRESTAMO`. `Alumno` y `AlumnoResponse` aparecen como ejemplos educativos del frontend, no como una Entity o DTO adicional del backend.

## API, validaciones y errores

| Método y endpoint | Resultado correcto |
|---|---|
| GET `/api/recursos` | `200 OK` con una lista de `RecursoResponse` |
| GET `/api/prestamos` | `200 OK` con el historial como lista de `PrestamoResponse` |
| POST `/api/prestamos` | `201 Created` con el préstamo registrado |
| PATCH `/api/prestamos/{id}/devolucion` | `200 OK` con el préstamo devuelto; sin body de entrada |

GET consulta información. POST y PATCH modifican datos reales de H2. No hay endpoints de eliminación ni un CRUD general de alumnos o recursos.

Validaciones reales del registro:

- Nombre: `@NotBlank` y `@Size(min = 3, max = 80)`.
- Correo: `@NotBlank` y `@Email`.
- ID del recurso: `@NotNull`.
- El Controller activa la validación del cuerpo con `@Valid`.
- El ID de la devolución es un `Long` con `@Positive`.

`@Min(1)` se explica y practica en actividades educativas, pero **no está declarado en el PrestamoRequest real**.

`GlobalExceptionHandler`, mediante `@RestControllerAdvice` y `@ExceptionHandler`, centraliza:

| HTTP | Situación |
|---|---|
| `400 Bad Request` | Validaciones de entrada o ID de devolución inválido |
| `404 Not Found` | Recurso o préstamo inexistente |
| `409 Conflict` | Recurso ocupado o préstamo que ya no está ACTIVO |

Los errores de validación del DTO incluyen `status`, `error` y `campos`; los errores de negocio incluyen `status` y `error`.

### Préstamo y devolución de práctica

En el Módulo 2:

1. El selector agrupa **DISPONIBLES** primero, con `✓`, y **PRESTADOS** después, con `✕` y opciones deshabilitadas.
2. Registrar crea un `Prestamo` ACTIVO y cambia el recurso a `disponible = false`, en una transacción.
3. Tras el `201` aparece debajo de Registrar el botón **↩ Devolver recurso de práctica #ID**.
4. Ese ID procede exclusivamente de la respuesta del POST y se mantiene solo en memoria JavaScript. No se busca el ID mayor ni el préstamo más reciente por fecha.
5. El PATCH comprueba que el préstamo exista y siga ACTIVO, ejecuta `marcarDevuelto()` y libera el recurso en una sola transacción.
6. La devolución conserva ID, fecha, alumno, correo y relación con el recurso. No borra ni recrea el registro.
7. Después del `200` se oculta el botón, se actualiza el selector, se limpia el formulario y los paneles vuelven a su estado inicial. Una confirmación breve informa el `200 OK` y el ID DEVUELTO.

`PrestamoRepository.buscarParaDevolucion` utiliza bloqueo pesimista de escritura. Una devolución repetida responde `409` y no vuelve a liberar un recurso prestado posteriormente. La devolución nunca es automática.

Al recargar se pierde el ID de práctica en memoria, pero no el préstamo en H2. La API permite devolver un ID conocido mediante Swagger; la restricción al último POST de la sesión corresponde al botón del frontend.

### Probar la API desde PowerShell

Este ejemplo crea **un registro real** y después lo devuelve, conservándolo como historial:

```powershell
$recursosPrueba = Invoke-RestMethod -Uri 'http://localhost:8080/api/recursos'
$recursoPrueba = $recursosPrueba | Where-Object disponible | Select-Object -First 1
if (-not $recursoPrueba) { throw 'No hay recursos disponibles para esta prueba.' }

$solicitudPrueba = @{
    nombreAlumno = 'Estudiante de prueba'
    correoAlumno = 'prueba@example.test'
    recursoId = $recursoPrueba.id
} | ConvertTo-Json

$prestamoPrueba = Invoke-RestMethod -Method Post `
    -Uri 'http://localhost:8080/api/prestamos' `
    -ContentType 'application/json' -Body $solicitudPrueba
$prestamoPrueba

Invoke-RestMethod -Method Patch `
    -Uri "http://localhost:8080/api/prestamos/$($prestamoPrueba.id)/devolucion"

Invoke-RestMethod -Uri 'http://localhost:8080/api/prestamos'
```

## H2 y conservación del historial

Configuración base real en [application.properties](src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:h2:file:./data/learninglab;AUTO_SERVER=TRUE
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

La base persiste en `data/learninglab.mv.db`; los archivos de bloqueo son temporales. `data/` y `target/` están excluidos mediante [.gitignore](.gitignore).

Para H2 Console, utilizar el driver `org.h2.Driver`, la misma URL JDBC, usuario `sa` y contraseña vacía en el ambiente local. Con DEV, utilizar `learninglab-dev`.

Consultas de inspección:

```sql
SELECT ID, NOMBRE_ALUMNO, CORREO_ALUMNO, RECURSO_ID, ESTADO, FECHA_PRESTAMO
FROM PRESTAMO ORDER BY ID;

SELECT ID, NOMBRE, TIPO, DISPONIBLE FROM RECURSO ORDER BY ID;
```

El inicio no restablece la disponibilidad ni borra préstamos. La carga inicial agrega Notebook Lenovo ThinkPad, Libro Java 21, Tablet Samsung y Libro Spring Boot solo cuando no existe ningún recurso. Sus IDs y disponibilidad deben consultarse, no suponerse.

## Properties, YAML y Profiles

La configuración real está en archivos `.properties`. **No hay un application.yml real**: el Módulo 2 genera una vista previa equivalente en YAML.

Puerto, Mostrar SQL, los botones Properties/YAML y DEV/PROD cambian únicamente la demostración del navegador. No modifican el servidor, los archivos ni el perfil activo. Properties/YAML ocupa todo el ancho y Profiles aparece debajo.

| Configuración | Base de datos / comportamiento |
|---|---|
| Base, sin perfil explícito | H2 `./data/learninglab`, puerto `8080`, SQL visible, `ddl-auto=update` |
| `dev` | H2 `./data/learninglab-dev`, SQL visible, `ddl-auto=update` |
| `prod` | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; `show-sql=false`, `ddl-auto=validate`, detalles de salud `never` |

Activar DEV en una ejecución real:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Con un JAR:

```sh
java -jar target/spring-boot-learning-lab-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

PROD es un ejemplo de externalización mediante variables de entorno. Hereda el driver H2 y la consola habilitada de la configuración base; el proyecto no incluye drivers de PostgreSQL/MySQL ni un esquema de producción independiente. `validate` requiere un esquema existente. Seleccionar PROD en la interfaz no despliega ni activa un ambiente productivo.

## Experiencia educativa y frontend

Una plantilla Thymeleaf y JavaScript organizan ocho vistas internas. La identidad compartida usa fondo petróleo, superficies claras, código monoespaciado oscuro y controles accesibles.

| Módulo / fase | Experiencia implementada |
|---|---|
| 1 — Spring Boot por dentro | Arranque de siete pasos cada 1,8 s; pausa con consulta libre y reanudación desde el avance real; MVC de ocho etapas; ejemplos Controller/RestController y comprobación |
| 2 — Configura y conecta | Maven y dependencias con panel compartido; Properties/YAML y Profiles; flujo de capas; préstamo y devolución reales |
| 3 — Buenas prácticas y tendencias | Dos páginas internas: Buenas prácticas y Tendencias y herramientas; continúa contando como un único módulo |
| 4 — Comprueba lo aprendido | Cinco preguntas, una visible a la vez, feedback, resultado, repetición y reflexión |

En el Módulo 3 se conservan Entity/DTO, validaciones locales, códigos HTTP, seguridad, Records, Virtual Threads, Actuator, OpenAPI/Swagger y Docker. La organización distingue **Controller → Service → Repository → Entity** de los paquetes de apoyo **DTO, Exception y Config**. Los ejemplos de Entity no representan saltos adicionales de una petición HTTP.

La entrada sigue **splash → portada → dashboard**. Cada recarga reproduce el splash: entrada de 700 ms, lectura de 3 s, salida de 1000 ms y entrada de la portada de 700 ms. El botón Comenzar aprendizaje pertenece a la portada. Con movimiento reducido se omiten los fades y se conserva la pausa de lectura.

### Páginas de apoyo

- **Laboratorio de práctica:** cinco desafíos de código y el área Datos en H2. El primero pide escribir exactamente `@RestController`; el ordenamiento usa botones accesibles; el DTO se comprueba como texto, sin compilar Java. El resultado usa la última comprobación y Repetir reinicia solo estos ejercicios.
- **Datos en H2:** recorre seis etapas y consulta `GET /api/prestamos` únicamente al pulsar Ver datos o Actualizar. Incluye estructura, conceptos de tabla y SQL representativo; no inserta ni modifica datos.
- **Vocabulario:** 82 conceptos en siete categorías; un acordeón abierto y un modal de definición. Buscar o Enter ejecuta la búsqueda, no la escritura. Soporta enlaces como `/#vocabulary/dto`.
- **Fuentes:** siete referencias agrupadas en cuatro acordeones. Conserva los enlaces de documentación utilizados.

Las páginas del Módulo 3 y las áreas del Laboratorio conservan sus componentes y valores al alternar entre ellas dentro de la misma carga. Las herramientas de apoyo no completan módulos ni suman porcentaje.

### Progreso persistente

La clave de navegador es:

```text
springBootLearningLab.completedModules
```

Guarda solo un array con IDs `module1`–`module4`. Cada módulo aporta 25 %. Al recargar se restauran contador, porcentaje, botones deshabilitados, clase de completado y mensaje final de 4/4.

No guarda respuestas, formularios, navegación, simulaciones ni datos H2. Persiste en el mismo perfil y origen del navegador, separado de la base de datos; si el almacenamiento está bloqueado, continúa funcionando durante la sesión. El splash no utiliza esta clave para saltarse.

## Virtual Threads, Actuator y Swagger

- `spring.threads.virtual.enabled=true` está habilitado con Java 21. El Módulo 3 compara hilo tradicional y Virtual Thread y simula esperas de BD/HTTP/archivo. Es un modelo educativo, no un benchmark; no promete acelerar cálculos de CPU y conserva la aclaración sobre operaciones que fijan el hilo portador en Java 21.
- Actuator expone `health` e `info`. El botón del Módulo 3 abre una consulta real a `GET /actuator/health`; cerrar oculta el resultado sin otra llamada y reabrir vuelve a consultar. Se muestra el HTTP y el estado real, sin inventar `UP`.
- Swagger UI documenta los endpoints reales. La guía explica GET/POST/PATCH, Try it out, Execute, cuerpos JSON y códigos HTTP. GET consulta; POST y PATCH ejecutados desde Swagger pueden modificar H2.

## Pruebas y empaquetado

Para ejecutar **toda la suite con bases H2 en memoria**, sin utilizar el archivo de demostración:

```powershell
.\mvnw.cmd "-Dspring.datasource.url=jdbc:h2:mem:learninglab-tests;DB_CLOSE_DELAY=-1" "-Dspring.jpa.hibernate.ddl-auto=create-drop" test
```

En Linux/macOS, sustituir `.\mvnw.cmd` por `sh ./mvnw` y conservar las comillas de la URL.

[PrestamoDevolucionTests](src/test/java/com/rosita/learninglab/PrestamoDevolucionTests.java) contiene cinco pruebas de integración: conservación de datos y fecha, devolución repetida después de otro préstamo, IDs/404, validaciones/disponibilidad y devoluciones simultáneas. Usa su propia H2 en memoria. [SpringBootLearningLabApplicationTests](src/test/java/com/rosita/learninglab/SpringBootLearningLabApplicationTests.java) comprueba el arranque del contexto.

`.\mvnw.cmd test` también es válido, pero el test de contexto toma la configuración base si no se sobrescribe la URL. Los parámetros del comando anterior aíslan esa prueba; no cambian `application.properties`.

Después de probar, generar el JAR sin repetir las pruebas:

```powershell
.\mvnw.cmd -DskipTests clean package
java -jar target/spring-boot-learning-lab-0.0.1-SNAPSHOT.jar
```

Comprobación manual recomendada:

1. Completar un módulo, recargar y verificar contador y porcentaje; completar los cuatro y comprobar 100 %.
2. En Módulo 1, pausar en Paso 5, consultar 1/6/7/3 y reanudar desde 5 hacia 6 y 7.
3. En Módulo 2, observar Disponible → POST 201 → Prestado → devolución explícita 200 → Disponible.
4. Consultar el historial: la fila debe permanecer DEVUELTO y los paneles deben quedar limpios.
5. Abrir/cerrar Actuator; probar Vocabulario y ambas áreas del Laboratorio, también con teclado y en móvil.

Si un cambio frontend no aparece, comprobar los recursos servidos en Network. Maven copia fuentes a `target/classes` y Thymeleaf puede conservar una plantilla en memoria durante la ejecución. Trabajar en `src/`, sincronizar recursos y reiniciar la instancia de ese proyecto cuando sea necesario; no editar copias generadas como solución.

## Docker

[Dockerfile](Dockerfile) utiliza `eclipse-temurin:21-jre`, directorio `/app`, copia el JAR ya construido a `app.jar`, expone `8080` y ejecuta `java -jar app.jar`. No compila el proyecto dentro de la imagen.

Con el JAR generado:

```sh
docker build -t spring-boot-learning-lab .
docker run --name spring-boot-learning-lab -p 8080:8080 -v learninglab-data:/app/data spring-boot-learning-lab
```

El volumen conserva la H2 del contenedor al recrearlo. Es una base separada de `data/` del equipo anfitrión. Sin volumen, los datos quedan en el sistema de archivos del contenedor. No se incluye Docker Compose.

En el Módulo 3, la tarjeta Docker ocupa todo el ancho debajo de las columnas; sus cinco etapas son interactivas y muestran el Dockerfile real. En escritorio el flujo es horizontal y en móvil se adapta verticalmente.

## Estructura y documentación

```text
.mvn/wrapper/maven-wrapper.properties
src/main/java/com/rosita/learninglab/
  SpringBootLearningLabApplication.java
  config/ controller/ dto/ entity/ exception/ repository/ service/
src/main/resources/
  application.properties
  application-dev.properties
  application-prod.properties
  templates/index.html
  static/css/app.css
  static/js/app.js
src/test/java/com/rosita/learninglab/
  SpringBootLearningLabApplicationTests.java
  PrestamoDevolucionTests.java
docs/MATERIAL_EVALUACION.md
Dockerfile
mvnw
mvnw.cmd
pom.xml
README.md
DESIGN.md
```

[DESIGN.md](DESIGN.md) documenta las decisiones finales de arquitectura y experiencia. [MATERIAL_EVALUACION.md](docs/MATERIAL_EVALUACION.md) conserva la pauta de referencia; sus sugerencias iniciales y el diagnóstico antiguo del splash no sustituyen el comportamiento final descrito aquí.

El alcance sigue siendo un laboratorio educativo: no incluye autenticación, administración completa de inventario ni ejecución de código Java escrito por el estudiante.

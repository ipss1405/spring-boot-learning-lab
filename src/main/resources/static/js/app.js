(() => {
  const app = document.querySelector('#app');
  if (!app) return;

  const splash = document.querySelector('#splash');
  const landingPage = document.querySelector('#landing-page');
  const learningApp = document.querySelector('#learning-app');
  const views = [...document.querySelectorAll('.view')];
  const completedModulesKey = 'springBootLearningLab.completedModules';
  const moduleIds = ['module1', 'module2', 'module3', 'module4'];
  const completed = new Set(readCompletedModules());
  const progressLabel = document.querySelector('#progress-label');
  const progressBar = document.querySelector('#progress-bar');
  const completionButtons = [...document.querySelectorAll('[data-complete]')];

  function showView(id) {
    views.forEach(view => view.classList.toggle('active-view', view.id === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'module2') loadResources();
  }

  function readCompletedModules() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(completedModulesKey));
      return Array.isArray(stored) ? stored.filter(id => moduleIds.includes(id)) : [];
    } catch (error) {
      return [];
    }
  }
  function saveCompletedModules() {
    try {
      window.localStorage.setItem(completedModulesKey, JSON.stringify(moduleIds.filter(id => completed.has(id))));
    } catch (error) {
      // Si el navegador bloquea el almacenamiento, el progreso de la sesión sigue funcionando.
    }
  }
  function updateProgress() {
    const percent = completed.size * 25;
    progressLabel.textContent = `${completed.size} / 4 módulos completados · ${percent} %`;
    progressBar.style.width = `${percent}%`;
    completionButtons.forEach(button => {
      const id = button.dataset.complete;
      if (!completed.has(id)) return;
      button.textContent = '✓ Módulo ' + id.slice(-1) + ' completado';
      button.classList.add('module-completed');
      button.disabled = true;
      const summary = 'Progreso total: ' + completed.size + ' / 4 (' + percent + ' %).';
      const message = document.querySelector('#' + id + '-completion');
      if (id === 'module4') {
        message.textContent = completed.size === 4
          ? '✓ Recorrido de aprendizaje completado · 4 / 4 — 100 %'
          : '✓ Módulo 4 completado. ' + summary;
      } else {
        message.textContent = '✓ Módulo finalizado. ' + summary + (id === 'module1'
          ? ' Tu progreso ya está actualizado en la ruta de aprendizaje.' : '');
      }
    });
  }

  // Each full page load starts a new opening sequence; no persisted bypass.
  async function playSplash() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fade = async (element, from, to, duration) => {
      const animation = element.animate(
        [{ opacity: from }, { opacity: to }],
        { duration: reducedMotion ? 0 : duration, easing: 'ease-in-out', fill: 'both' }
      );
      await animation.finished.catch(() => {});
      return animation;
    };

    const entry = await fade(splash.querySelector('.splash-content'), 0, 1, 700);
    entry.cancel();
    await new Promise(resolve => window.setTimeout(resolve, 3000));
    const exit = await fade(splash, 1, 0, 1000);
    splash.classList.add('hidden');
    exit.cancel();
    landingPage.classList.remove('hidden');
    const arrival = await fade(landingPage, 0, 1, 700);
    arrival.cancel();
  }

  playSplash();

  document.querySelector('#start-learning').addEventListener('click', () => {
    landingPage.classList.add('hidden');
    learningApp.classList.remove('hidden');
    showView('dashboard');
  });

  document.querySelector('#home-button').addEventListener('click', () => showView('dashboard'));
  document.querySelectorAll('[data-go-home]').forEach(btn => btn.addEventListener('click', () => showView('dashboard')));
  document.querySelectorAll('[data-open-module]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.openModule)));
  document.querySelectorAll('[data-open-section]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.openSection)));

  completionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!moduleIds.includes(btn.dataset.complete)) return;
      completed.add(btn.dataset.complete);
      updateProgress();
      saveCompletedModules();
    });
  });

  // Módulo 1: inicio Spring Boot
  const startupSteps = [...document.querySelectorAll('#module1 .step-pill')];
  const startupDetail = document.querySelector('#startup-detail');
  const startupProgress = document.querySelector('#startup-progress');
  const startupAnnouncement = document.querySelector('#startup-announcement');
  const startupState = document.querySelector('#startup-state');
  const runStartup = document.querySelector('#run-startup');
  const pauseStartup = document.querySelector('#pause-startup');
  const startupConcepts = [
    {
      name: '@SpringBootApplication',
      explanation: 'Marca la clase principal de la aplicación y reúne configuración, autoconfiguración y escaneo de componentes.',
      importance: 'Permite arrancar la aplicación desde main. Combina @SpringBootConfiguration (una especialización de @Configuration), @EnableAutoConfiguration y @ComponentScan.',
      example: '@SpringBootApplication\npublic class LearningLabApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(\n            LearningLabApplication.class, args);\n    }\n}'
    },
    {
      name: 'Autoconfiguración',
      explanation: 'Spring Boot analiza las dependencias del classpath y aplica configuraciones adecuadas automáticamente, según sus condiciones y los Beans existentes.',
      importance: 'Los Starters agrupan dependencias compatibles. spring-boot-starter-web aporta Spring MVC y Tomcat; la autoconfiguración prepara la infraestructura web sin configurarla toda a mano.',
      example: '<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-web</artifactId>\n</dependency>'
    },
    {
      name: 'ComponentScan',
      explanation: '@ComponentScan busca componentes en el paquete de la clase principal y sus subpaquetes: Controller, Service, Repository y otras clases administradas.',
      importance: 'Registra las definiciones de componentes para que Spring pueda crearlos. Spring Data JPA genera las implementaciones de las interfaces JpaRepository mediante su infraestructura de repositorios.',
      example: '@Service\npublic class PrestamoService {\n    // Reglas del préstamo\n}'
    },
    {
      name: 'ApplicationContext y Beans',
      explanation: 'Spring crea un contenedor llamado ApplicationContext. Dentro de él administra objetos llamados Beans. PrestamoService se convierte en un Bean administrado por Spring.',
      importance: 'Esto es Inversión de Control (IoC): Spring se encarga de crear, conectar y gestionar los componentes, en lugar de que cada clase los construya con new.',
      example: '@Configuration\nclass Configuracion {\n    @Bean\n    Clock reloj() {\n        return Clock.systemUTC();\n    }\n}'
    },
    {
      name: 'Inyección de dependencias',
      explanation: 'Spring entrega automáticamente a una clase los componentes que necesita. PrestamoController recibe PrestamoService mediante el constructor.',
      importance: 'Las clases expresan qué necesitan sin construir esas dependencias. Así se separan responsabilidades y se facilita probar cada componente.',
      example: 'public PrestamoController(\n        PrestamoService prestamoService) {\n    this.prestamoService = prestamoService;\n}'
    },
    {
      name: 'Tomcat embebido',
      explanation: 'Spring Boot inicia un servidor Tomcat embebido junto con la aplicación; no necesitamos instalar un servidor aparte para esta ejecución.',
      importance: 'Puedes ejecutar un JAR con java -jar. En el despliegue tradicional se instala Tomcat por separado y se despliega, por ejemplo, un WAR. Tomcat recibe HTTP y lo entrega a la infraestructura Servlet.',
      example: 'java -jar learninglab.jar\n# Tomcat escucha en el puerto configurado\n# En este laboratorio: http://localhost:8080'
    },
    {
      name: 'Aplicación lista',
      explanation: 'El arranque terminó: la aplicación puede recibir peticiones HTTP y atender el caso de préstamos.',
      importance: 'El servidor, los Beans y sus dependencias están disponibles para trabajar juntos. El recorrido siguiente muestra cómo colaboran al solicitar un notebook.',
      example: '✓ Spring Boot iniciado\n✓ Beans creados\n✓ Dependencias inyectadas\n✓ Tomcat escuchando\n✓ Aplicación lista para recibir peticiones'
    }
  ];
  // This is a teaching sequence: several real startup operations overlap.
  let startupIndex = -1;
  let startupReached = -1;
  let startupTimer = null;
  let startupPaused = false;
  function stopStartup() {
    if (startupTimer !== null) window.clearInterval(startupTimer);
    startupTimer = null;
  }
  function renderStartup(index) {
    const concept = startupConcepts[index];
    startupSteps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
      step.classList.toggle('completed', i <= startupReached && i !== index);
      step.classList.toggle('pending', i > startupReached);
      step.disabled = i > startupReached && !startupPaused;
      if (i === index) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    startupProgress.textContent = `Paso ${index + 1} de 7`;
    startupAnnouncement.textContent = concept.name;
    startupDetail.replaceChildren();
    const explanation = document.createElement('p');
    explanation.textContent = concept.explanation;
    const importance = document.createElement('p');
    const label = document.createElement('strong');
    label.textContent = 'Por qué importa: ';
    importance.append(label, concept.importance);
    const exampleLabel = document.createElement('strong');
    exampleLabel.textContent = 'Ejemplo corto';
    const example = document.createElement('pre');
    example.className = 'code-block';
    example.textContent = concept.example;
    startupDetail.append(explanation, importance, exampleLabel, example);
  }
  function finishStartup() {
    stopStartup();
    startupPaused = false;
    runStartup.textContent = 'Repetir simulación';
    runStartup.disabled = false;
    pauseStartup.disabled = true;
    pauseStartup.textContent = 'Pausar simulación';
    startupState.textContent = 'Simulación terminada. Puedes consultar cualquiera de los siete pasos.';
  }
  function continueStartup() {
    stopStartup();
    startupPaused = false;
    renderStartup(startupIndex);
    pauseStartup.disabled = false;
    pauseStartup.textContent = 'Pausar simulación';
    startupState.textContent = 'Avance automático cada 1,8 segundos. Puedes pausar para leer.';
    startupTimer = window.setInterval(() => {
      if (!document.querySelector('#module1').classList.contains('active-view')) {
        pauseStartup.click();
        return;
      }
      startupReached += 1;
      startupIndex = startupReached;
      renderStartup(startupIndex);
      if (startupReached === startupConcepts.length - 1) finishStartup();
    }, 1800);
  }
  runStartup.addEventListener('click', () => {
    stopStartup();
    startupReached = 0;
    startupIndex = 0;
    runStartup.disabled = true;
    continueStartup();
  });
  pauseStartup.addEventListener('click', () => {
    if (startupTimer !== null) {
      stopStartup();
      startupPaused = true;
      renderStartup(startupIndex);
      pauseStartup.textContent = 'Reanudar simulación';
      startupState.textContent = 'En pausa: puedes consultar cualquiera de las siete etapas sin avanzar la simulación.';
    } else if (startupReached >= 0 && startupReached < startupConcepts.length - 1) {
      startupIndex = startupReached;
      continueStartup();
    }
  });
  startupSteps.forEach((step, index) => step.addEventListener('click', () => {
    if (startupReached < 0 || (index > startupReached && !startupPaused)) return;
    if (startupTimer !== null) pauseStartup.click();
    startupIndex = index;
    renderStartup(index);
  }));

  const requestSteps = [
    ['Usuario', 'El estudiante inicia la acción desde la interfaz.', 'El navegador o Postman actúa como cliente HTTP. Aquí, el estudiante presiona “Solicitar notebook”.'],
    ['POST /api/prestamos', 'El navegador envía una petición HTTP POST para crear un nuevo préstamo.', 'La petición lleva los datos del alumno y del recurso en formato JSON. Este recorrido es una simulación: no registra préstamos reales.'],
    ['DispatcherServlet', 'Es el punto de entrada de Spring MVC. Recibe la petición y decide qué Controller debe procesarla.', 'Tomcat entrega la petición al DispatcherServlet, que coordina el enrutamiento hacia el método correspondiente.'],
    ['PrestamoController', 'Recibe los datos de la petición y delega la lógica al Service.', 'El endpoint utiliza @Valid para validar PrestamoRequest antes de llamar a PrestamoService. Un @RestController devuelve datos, no una vista HTML.'],
    ['PrestamoService', 'Aplica las reglas del préstamo.', '@Service identifica la capa de negocio: comprueba que el recurso exista y esté disponible antes de persistir el préstamo.'],
    ['PrestamoRepository', 'Utiliza Spring Data JPA para acceder a los datos.', 'JpaRepository aporta operaciones como save y findById. JPA relaciona los objetos @Entity Recurso y Prestamo con los datos persistidos.'],
    ['H2', 'Almacena los datos del recurso y del préstamo.', 'La base de datos guarda el préstamo y el cambio de disponibilidad. La Entity representa esos datos; no recibe peticiones HTTP.'],
    ['201 Created', 'El préstamo fue creado correctamente y el servidor responde HTTP 201.', 'Vuelta de la respuesta: H2 → Repository → Service → Controller → DispatcherServlet → Tomcat → usuario. El cliente recibe un PrestamoResponse (DTO) en JSON, no la Entity directamente.']
  ];
  let requestIndex = -1;
  let requestReached = -1;
  const requestNodes = [...document.querySelectorAll('#module1 .request-node')];
  const requestExplanation = document.querySelector('#request-explanation');
  const requestConcept = document.querySelector('#request-concept');
  const requestExtra = document.querySelector('#request-extra');
  const requestSuccess = document.querySelector('#request-success');
  const requestProgress = document.querySelector('#request-progress');
  const nextRequest = document.querySelector('#next-request-step');
  function renderRequestFlow() {
    requestNodes.forEach((node, index) => {
      node.classList.toggle('current', index === requestIndex);
      node.classList.toggle('completed', index <= requestReached && index !== requestIndex);
      node.classList.toggle('pending', index > requestReached);
      node.disabled = index > requestReached;
      if (index === requestIndex) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
    requestProgress.textContent = `Paso ${requestIndex + 1} de 8`;
    nextRequest.disabled = requestReached === requestSteps.length - 1;
    nextRequest.textContent = requestReached < 0 ? 'Comenzar recorrido' : requestReached === 7 ? 'Recorrido completado ✓' : 'Avanzar al siguiente paso →';
    requestSuccess.hidden = requestReached !== 7;
    if (requestIndex >= 0) {
      requestConcept.textContent = requestSteps[requestIndex][0];
      requestExplanation.textContent = requestSteps[requestIndex][1];
      requestExtra.textContent = requestSteps[requestIndex][2];
    } else {
      requestConcept.textContent = 'La petición aún no ha comenzado.';
      requestExplanation.textContent = 'Comienza el recorrido para seguir la petición desde el navegador.';
      requestExtra.textContent = '';
    }
  }
  renderRequestFlow();
  nextRequest.addEventListener('click', () => {
    if (requestReached >= requestSteps.length - 1) return;
    requestReached += 1;
    requestIndex = requestReached;
    renderRequestFlow();
  });
  requestNodes.forEach((node, index) => node.addEventListener('click', () => {
    if (index > requestReached) return;
    requestIndex = index;
    renderRequestFlow();
  }));
  document.querySelector('#restart-request').addEventListener('click', () => {
    requestIndex = -1;
    requestReached = -1;
    renderRequestFlow();
  });

  document.querySelectorAll('#module1 .quick-check').forEach(check => {
    check.querySelectorAll('.answer-btn').forEach(btn => btn.addEventListener('click', () => {
      const feedback = check.querySelector('.check-feedback');
      check.querySelectorAll('.answer-btn').forEach(item => item.classList.remove('correct', 'wrong'));
      if (btn.dataset.correct === 'true') {
        btn.classList.add('correct');
        feedback.textContent = '✅ Correcto. DispatcherServlet es el punto de entrada de Spring MVC y deriva la petición al Controller correspondiente.';
      } else {
        btn.classList.add('wrong');
        feedback.textContent = btn.textContent.trim() === 'Repository'
          ? '❌ No. Repository accede a los datos; no recibe primero la petición HTTP.'
          : '❌ No. Entity representa los datos del dominio; no procesa peticiones HTTP.';
      }
      feedback.classList.toggle('correct-feedback', btn.dataset.correct === 'true');
      feedback.classList.toggle('wrong-feedback', btn.dataset.correct !== 'true');
    }));
  });

  // Módulo 2: explicar, interactuar y observar resultados reales.
  const mavenSteps = {
    pom: { title: 'pom.xml', description: 'Es el archivo principal de configuración de Maven. Indica qué dependencias, plugins y características necesita el proyecto.', code: '<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-web</artifactId>\n</dependency>' },
    maven: { title: 'Maven', description: 'Maven lee el pom.xml, organiza el proyecto y ejecuta tareas como compilar, probar y empaquetar la aplicación.' },
    download: { title: 'Descarga dependencias', description: 'Maven busca las librerías declaradas en el pom.xml y las descarga desde repositorios como Maven Central.' },
    compile: { title: 'Compila y prepara la aplicación', description: 'Maven compila el código Java, ejecuta las tareas necesarias y deja la aplicación preparada para ejecutarse o empaquetarse.' }
  };
  const dependencyContent = {
    web: { description: 'Agrega Spring MVC, soporte web y Tomcat embebido. Permite implementar PrestamoController y sus endpoints.', artifact: 'spring-boot-starter-web' },
    jpa: { description: 'Permite trabajar con bases de datos usando JPA y Repository. PrestamoRepository usa JpaRepository para guardar y consultar préstamos.', artifact: 'spring-boot-starter-data-jpa' },
    validation: { description: 'Permite validar datos con anotaciones como @Valid, @NotBlank, @NotNull y @Email. El endpoint valida PrestamoRequest antes de ejecutar el préstamo.', artifact: 'spring-boot-starter-validation' },
    h2: { description: 'Base de datos utilizada por el laboratorio para almacenar los préstamos y recursos. H2 no es un Starter: es la dependencia del motor de base de datos.', artifact: 'h2', group: 'com.h2database', runtime: true }
  };
  function selectModule2Choice(selector, selected) {
    document.querySelectorAll('#module2 ' + selector).forEach(button => {
      button.setAttribute('aria-pressed', String(button === selected));
    });
  }
  function showMavenResult(title, description, xml, kind) {
    document.querySelector('#dependency-name').textContent = title;
    document.querySelector('#maven-result-kind').textContent = kind;
    document.querySelector('#maven-result-kind').hidden = false;
    document.querySelector('#dependency-explanation').textContent = description;
    const code = document.querySelector('#dependency-code');
    code.textContent = xml || '';
    code.hidden = !xml;
  }
  document.querySelectorAll('#module2 [data-maven-step]').forEach(button => button.addEventListener('click', () => {
    const step = mavenSteps[button.dataset.mavenStep];
    selectModule2Choice(':is([data-maven-step], [data-dependency])', button);
    showMavenResult(step.title, step.description, step.code, 'Cómo trabaja Maven');
  }));
  document.querySelectorAll('#module2 [data-dependency]').forEach(button => button.addEventListener('click', () => {
    const dependency = dependencyContent[button.dataset.dependency];
    selectModule2Choice(':is([data-maven-step], [data-dependency])', button);
    const xml = '<dependency>\n  <groupId>' + (dependency.group || 'org.springframework.boot') + '</groupId>\n  <artifactId>' + dependency.artifact + '</artifactId>\n' + (dependency.runtime ? '  <scope>runtime</scope>\n' : '') + '</dependency>';
    showMavenResult(dependency.runtime ? 'H2' : dependency.artifact, dependency.description, xml, 'Qué aporta cada dependencia');
  }));

  let configMode = 'properties';
  let configPort = 8081;
  const portInput = document.querySelector('#port-input');
  const sqlToggle = document.querySelector('#sql-toggle');
  const configPreview = document.querySelector('#config-preview');
  function renderConfig() {
    const rawPort = Number(portInput.value);
    const validPort = Number.isInteger(rawPort) && rawPort >= 1024 && rawPort <= 65535;
    if (validPort) configPort = rawPort;
    portInput.setAttribute('aria-invalid', String(!validPort));
    const showSql = sqlToggle.checked;
    if (configMode === 'properties') {
      configPreview.textContent = 'server.port=' + configPort + '\n\nspring.datasource.url=jdbc:h2:file:./data/learninglab;AUTO_SERVER=TRUE\nspring.datasource.username=sa\nspring.datasource.password=\n\nspring.jpa.show-sql=' + showSql + '\nspring.jpa.hibernate.ddl-auto=update';
    } else {
      configPreview.textContent = 'server:\n  port: ' + configPort + '\n\nspring:\n  datasource:\n    url: "jdbc:h2:file:./data/learninglab;AUTO_SERVER=TRUE"\n    username: sa\n    password: ""\n  jpa:\n    show-sql: ' + showSql + '\n    hibernate:\n      ddl-auto: update';
    }
    document.querySelector('#config-format').textContent = 'La misma configuración · application.' + (configMode === 'properties' ? 'properties' : 'yml');
    document.querySelector('#port-properties').textContent = 'server.port=' + configPort;
    document.querySelector('#port-yaml').textContent = 'server:\n  port: ' + configPort;
    document.querySelector('#config-summary').textContent = validPort
      ? 'Mismos valores en ambos formatos: puerto ' + configPort + ', SQL ' + (showSql ? 'visible' : 'oculto') + '.'
      : 'Usa un puerto entero entre 1024 y 65535. La vista conserva el último puerto válido: ' + configPort + '.';
  }
  document.querySelectorAll('#module2 [data-config-mode]').forEach(button => button.addEventListener('click', () => {
    configMode = button.dataset.configMode;
    document.querySelectorAll('#module2 [data-config-mode]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    renderConfig();
  }));
  portInput.addEventListener('input', renderConfig);
  sqlToggle.addEventListener('change', renderConfig);
  renderConfig();

  const propertyContent = {
    port: 'server.port: define el puerto donde escucha la aplicación.',
    url: 'spring.datasource.url: indica dónde se encuentra la base de datos. jdbc:h2:file: utiliza una base H2 persistida en un archivo.',
    username: 'spring.datasource.username: usuario utilizado para conectarse a la base de datos.',
    password: 'spring.datasource.password: contraseña de conexión. En este laboratorio H2 usa una contraseña vacía; en producción se deben usar variables de entorno para los secretos.',
    sql: 'spring.jpa.show-sql=true permite visualizar en la consola las consultas SQL que Hibernate ejecuta sobre la base de datos. Es útil durante el desarrollo para observar operaciones como SELECT, INSERT o UPDATE. Si está en false, esas consultas no se muestran en consola.',
    ddl: 'spring.jpa.hibernate.ddl-auto: indica cómo Hibernate administra las tablas al iniciar. update actualiza su estructura intentando conservar los datos; no sustituye un plan de migraciones en producción.'
  };
  document.querySelectorAll('#module2 [data-property]').forEach(button => button.addEventListener('click', () => {
    selectModule2Choice('[data-property]', button);
    document.querySelector('#property-detail').textContent = propertyContent[button.dataset.property];
  }));

  const profileContent = {
    dev: {
      title: 'DEV · application-dev.properties',
      description: 'En desarrollo podemos mostrar SQL y usar herramientas cómodas para programar. En el proyecto, el perfil DEV configura su archivo H2 y muestra SQL; la consola H2 se habilita en application.properties y se hereda.',
      code: 'spring.datasource.url=jdbc:h2:file:./data/learninglab-dev;AUTO_SERVER=TRUE\nspring.jpa.show-sql=true\nspring.jpa.hibernate.ddl-auto=update\n\n# Habilitado en la configuración base del laboratorio:\nspring.h2.console.enabled=true'
    },
    prod: {
      title: 'PROD · application-prod.properties',
      description: 'En producción evitamos guardar secretos directamente en el código y usamos una configuración más restrictiva. Estas propiedades ya están en el ejemplo PROD del proyecto; las variables se proporcionan desde el entorno.',
      code: 'spring.datasource.url=\u0024{DB_URL}\nspring.datasource.username=\u0024{DB_USERNAME}\nspring.datasource.password=\u0024{DB_PASSWORD}\nspring.jpa.show-sql=false\nspring.jpa.hibernate.ddl-auto=validate\nmanagement.endpoint.health.show-details=never'
    }
  };
  document.querySelectorAll('#module2 [data-profile]').forEach(button => button.addEventListener('click', () => {
    const profile = profileContent[button.dataset.profile];
    selectModule2Choice('[data-profile]', button);
    document.querySelector('#profile-title').textContent = profile.title;
    document.querySelector('#profile-detail').textContent = profile.description;
    const code = document.querySelector('#profile-code');
    code.textContent = profile.code;
    code.hidden = false;
  }));

  const layerContent = {
    frontend: { description: 'Recoge los datos ingresados por el estudiante y envía el JSON al endpoint del préstamo.', code: 'POST /api/prestamos\nContent-Type: application/json\n\nnombreAlumno · correoAlumno · recursoId' },
    controller: { description: 'Recibe la petición HTTP, valida PrestamoRequest y llama al Service. Devuelve PrestamoResponse con HTTP 201 cuando el préstamo fue creado.', code: '@RestController\n@RequestMapping("/api/prestamos")\n// Método registrar:\nreturn ResponseEntity.status(HttpStatus.CREATED)\n    .body(prestamoService.registrar(request));' },
    service: { description: 'Aplica las reglas del préstamo: verifica que el recurso exista y esté disponible, cambia su disponibilidad y registra el préstamo dentro de una transacción.', code: '@Service\n// Regla real de PrestamoService:\nif (!recurso.isDisponible()) {\n    throw new RecursoNoDisponibleException(\n        recurso.getNombre());\n}' },
    repository: { description: 'Accede a los datos mediante Spring Data JPA. JpaRepository aporta operaciones como findById y save sin escribir su implementación.', code: 'public interface PrestamoRepository\n    extends JpaRepository<Prestamo, Long> {\n}\n// El Service utiliza prestamoRepository.save(prestamo).' },
    entity: { description: 'Representa los datos que se guardarán en la base. Prestamo contiene alumno, correo, estado y una relación con Recurso; el Controller devuelve un DTO, no esta Entity.', code: '@Entity\npublic class Prestamo {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    @ManyToOne(fetch = FetchType.EAGER, optional = false)\n    private Recurso recurso;\n    // También almacena alumno, correo, fecha y estado.\n}' },
    h2: { description: 'Almacena físicamente los registros del laboratorio. JPA/Hibernate transforma las Entities en datos persistidos en la base H2 configurada.', code: 'spring.datasource.url=jdbc:h2:file:./data/learninglab;AUTO_SERVER=TRUE\n// GET /api/prestamos permite consultar los préstamos reales.' }
  };
  document.querySelectorAll('#module2 [data-layer]').forEach(button => button.addEventListener('click', () => {
    const layer = layerContent[button.dataset.layer];
    selectModule2Choice('[data-layer]', button);
    document.querySelector('#layer-detail').textContent = layer.description;
    const code = document.querySelector('#layer-code');
    code.textContent = layer.code;
    code.hidden = false;
  }));

  const resourceSelect = document.querySelector('#resource-select');
  const loanForm = document.querySelector('#loan-form');
  const loanSubmit = document.querySelector('#loan-submit');
  const reloadResources = document.querySelector('#reload-resources');
  let resourceLoadVersion = 0;
  let resourcesAvailable = false;
  let submittingLoan = false;
  const returnPracticeLoan = document.querySelector('#return-practice-loan');
  const practiceReturnStatus = document.querySelector('#practice-return-status');
  let practiceLoanId = null;
  let returningLoan = false;
  function appendResourceOption(label, value, disabled, target = resourceSelect) {
    const option = document.createElement('option');
    option.textContent = label;
    option.value = String(value);
    option.disabled = disabled;
    target.append(option);
  }
  async function loadResources() {
    const version = ++resourceLoadVersion;
    const selected = resourceSelect.value;
    loanSubmit.disabled = true;
    resourceSelect.setAttribute('aria-busy', 'true');
    document.querySelector('#resources-status').textContent = 'Consultando recursos disponibles…';
    reloadResources.hidden = true;
    try {
      const response = await fetch('/api/recursos');
      if (!response.ok) throw new Error('No fue posible cargar los recursos');
      const recursos = await response.json();
      if (!Array.isArray(recursos)) throw new Error('Respuesta de recursos inválida');
      if (version !== resourceLoadVersion) return;
      resourceSelect.replaceChildren();
      appendResourceOption('Selecciona un recurso', '', false);
      [true, false].forEach(available => {
        const resources = recursos.filter(resource => resource.disponible === available);
        if (!resources.length) return;
        const group = document.createElement('optgroup');
        group.label = available ? 'DISPONIBLES' : 'PRESTADOS';
        resources.forEach(resource => appendResourceOption((available ? '✓ ' : '✕ ') + resource.nombre + ' · ' + resource.tipo, resource.id, !available, group));
        resourceSelect.append(group);
      });
      resourcesAvailable = recursos.some(resource => resource.disponible);
      if (recursos.some(resource => String(resource.id) === selected && resource.disponible)) resourceSelect.value = selected;
      document.querySelector('#resources-status').textContent = resourcesAvailable
        ? 'Los recursos ya prestados están deshabilitados.'
        : 'No hay recursos disponibles para nuevos préstamos. Los registros existentes se conservan en H2.';
    } catch (error) {
      if (version !== resourceLoadVersion) return;
      resourceSelect.replaceChildren();
      appendResourceOption('No se pudieron cargar los recursos', '', false);
      resourcesAvailable = false;
      document.querySelector('#resources-status').textContent = 'No fue posible consultar /api/recursos. Reintenta la carga.';
      reloadResources.hidden = false;
    } finally {
      if (version === resourceLoadVersion) {
        resourceSelect.setAttribute('aria-busy', 'false');
        loanSubmit.disabled = submittingLoan || returningLoan || !resourcesAvailable;
      }
    }
  }
  reloadResources.addEventListener('click', loadResources);

  function renderSavedLoan(data, operation = 'POST /api/prestamos') {
    const fields = [['id', 'ID'], ['nombreAlumno', 'Alumno'], ['correoAlumno', 'Correo'], ['recurso', 'Recurso'], ['estado', 'Estado']];
    const columns = fields.filter(([key]) => data && Object.prototype.hasOwnProperty.call(data, key) && data[key] !== null && ['string', 'number'].includes(typeof data[key]));
    if (!columns.length) return false;
    const header = document.querySelector('#saved-loan-head');
    const body = document.querySelector('#saved-loan-body');
    header.replaceChildren();
    body.replaceChildren();
    const headings = document.createElement('tr');
    const row = document.createElement('tr');
    columns.forEach(([key, label]) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headings.append(th);
      const td = document.createElement('td');
      td.textContent = String(data[key]);
      row.append(td);
    });
    header.append(headings);
    body.append(row);
    document.querySelector('#h2-result').hidden = false;
    document.querySelector('#saved-loan-note').textContent = columns.length === fields.length
      ? 'Datos del DTO devuelto por ' + operation + ' después de persistir el préstamo.'
      : 'Se muestran únicamente las columnas presentes en la respuesta real del backend.';
    return true;
  }
  function resetLoanPanels() {
    document.querySelector('#loan-request-title').textContent = 'Petición · POST /api/prestamos';
    document.querySelector('#loan-request').textContent = 'Todavía no se ha enviado una petición.';
    document.querySelector('#loan-route').textContent = 'El recorrido de capas se mostrará después de enviar los datos.';
    const status = document.querySelector('#loan-status');
    status.textContent = 'Aún no has enviado una petición.';
    status.classList.remove('success', 'error');
    document.querySelector('#loan-result-explanation').textContent = 'Aquí verás el código HTTP y la explicación del resultado.';
    document.querySelector('#loan-response').textContent = 'La respuesta JSON aparecerá aquí.';
    document.querySelector('#h2-result').hidden = true;
  }
  loanForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submittingLoan || returningLoan) return;
    submittingLoan = true;
    practiceReturnStatus.hidden = true;
    practiceReturnStatus.textContent = '';
    returnPracticeLoan.disabled = true;
    loanSubmit.disabled = true;
    loanForm.setAttribute('aria-busy', 'true');
    const responseBox = document.querySelector('#loan-response');
    const status = document.querySelector('#loan-status');
    const explanation = document.querySelector('#loan-result-explanation');
    const route = document.querySelector('#loan-route');
    const payload = {
      nombreAlumno: document.querySelector('#student-name').value.trim(),
      correoAlumno: document.querySelector('#student-email').value.trim(),
      recursoId: resourceSelect.value ? Number(resourceSelect.value) : null
    };
    document.querySelector('#h2-result').hidden = true;
    document.querySelector('#loan-request-title').textContent = 'Petición · POST /api/prestamos';
    document.querySelector('#loan-request').textContent = 'POST /api/prestamos\nContent-Type: application/json\n\n' + JSON.stringify(payload, null, 2);
    route.textContent = 'Petición enviada desde el Frontend; esperando el resultado del backend.';
    status.textContent = 'Enviando petición…';
    status.classList.remove('success', 'error');
    responseBox.textContent = 'Esperando respuesta…';
    explanation.textContent = 'El servidor validará los datos y las reglas del préstamo.';
    try {
      const response = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const rawBody = await response.text();
      let data = null;
      try { data = JSON.parse(rawBody); } catch (error) { /* Keep the actual non-JSON response visible. */ }
      const names = { 201: 'Created', 400: 'Bad Request', 404: 'Not Found', 409: 'Conflict' };
      status.textContent = 'HTTP ' + response.status + (names[response.status] ? ' ' + names[response.status] : '');
      responseBox.textContent = data !== null ? JSON.stringify(data, null, 2) : (rawBody || 'El servidor no devolvió un cuerpo de respuesta.');
      status.classList.add(response.ok ? 'success' : 'error');
      if (response.status === 201) {
        practiceLoanId = Number.isSafeInteger(data?.id) && data.id > 0 && data.estado === 'ACTIVO' ? data.id : null;
        returnPracticeLoan.hidden = practiceLoanId === null;
        returnPracticeLoan.textContent = '↩ Devolver recurso de práctica' + (practiceLoanId === null ? '' : ' #' + practiceLoanId);
        returnPracticeLoan.title = practiceLoanId === null ? '' : 'Devolver únicamente el préstamo de práctica #' + practiceLoanId;
        route.textContent = 'Frontend → RestController → Service → Repository → Entity → H2. El Controller devuelve un DTO al cliente.';
        explanation.textContent = 'El recurso estaba disponible y el préstamo fue creado correctamente.';
        if (!renderSavedLoan(data)) explanation.textContent += ' El servidor no devolvió campos suficientes para representar el registro en una tabla; no se inventaron valores.';
        loanForm.reset();
        await loadResources();
      } else if (response.status === 400) {
        route.textContent = 'Frontend → RestController / validación. La petición no llegó a la lógica de préstamo del Service.';
        explanation.textContent = 'Los datos enviados no son válidos. Revisa los mensajes de campos en la respuesta y vuelve a intentarlo. No se creó un préstamo.';
      } else if (response.status === 404 || response.status === 409) {
        route.textContent = 'RestController → Service → Repository → H2 (consulta). No se persistió un nuevo préstamo.';
        explanation.textContent = response.status === 404 ? 'El recurso indicado no existe.' : 'El recurso ya está prestado. El Service aplica la regla de disponibilidad.';
        await loadResources();
      } else {
        route.textContent = 'El backend devolvió una respuesta distinta de la creación esperada.';
        explanation.textContent = 'Revisa el código HTTP y el cuerpo real de la respuesta. No se muestra un registro guardado sin confirmación de creación.';
      }
    } catch (error) {
      status.textContent = 'Sin respuesta HTTP confirmada';
      status.classList.add('error');
      responseBox.textContent = 'No se pudo obtener la respuesta del backend.';
      explanation.textContent = 'Revisa la conexión y consulta los registros existentes antes de reenviar: una interrupción de red no confirma si la operación se guardó.';
      route.textContent = 'No se pudo confirmar hasta qué capa llegó la petición.';
    } finally {
      submittingLoan = false;
      returnPracticeLoan.disabled = returningLoan || practiceLoanId === null;
      loanForm.setAttribute('aria-busy', 'false');
      loanSubmit.disabled = !resourcesAvailable;
    }
  });

  returnPracticeLoan.addEventListener('click', async () => {
    if (practiceLoanId === null || returningLoan || submittingLoan) return;
    const id = practiceLoanId;
    const endpoint = '/api/prestamos/' + id + '/devolucion';
    returningLoan = true;
    returnPracticeLoan.disabled = true;
    loanSubmit.disabled = true;
    const status = document.querySelector('#loan-status');
    const responseBox = document.querySelector('#loan-response');
    const explanation = document.querySelector('#loan-result-explanation');
    const route = document.querySelector('#loan-route');
    document.querySelector('#loan-request-title').textContent = 'Petición · PATCH ' + endpoint;
    document.querySelector('#loan-request').textContent = 'PATCH ' + endpoint + '\nSin cuerpo de petición';
    status.textContent = 'Devolviendo recurso de práctica…';
    status.classList.remove('success', 'error');
    responseBox.textContent = 'Esperando respuesta…';
    explanation.textContent = 'El Service comprobará que el préstamo #' + id + ' siga ACTIVO antes de liberar su recurso.';
    route.textContent = 'Frontend → Controller → Service → Repository → H2. La devolución se realiza en una sola transacción.';
    document.querySelector('#h2-result').hidden = true;
    try {
      const response = await fetch(endpoint, { method: 'PATCH', headers: { Accept: 'application/json' } });
      const rawBody = await response.text();
      let data = null;
      try { data = JSON.parse(rawBody); } catch (error) { /* Mostrar la respuesta real aunque no sea JSON. */ }
      const names = { 200: 'OK', 400: 'Bad Request', 404: 'Not Found', 409: 'Conflict' };
      status.textContent = 'HTTP ' + response.status + (names[response.status] ? ' ' + names[response.status] : '');
      responseBox.textContent = data !== null ? JSON.stringify(data, null, 2) : (rawBody || 'El servidor no devolvió un cuerpo de respuesta.');
      const confirmed = response.status === 200 && data?.id === id && data.estado === 'DEVUELTO';
      status.classList.add(confirmed ? 'success' : 'error');
      if (confirmed) {
        practiceLoanId = null;
        returnPracticeLoan.hidden = true;
        loanForm.reset();
        await loadResources();
        resetLoanPanels();
        practiceReturnStatus.textContent = 'HTTP 200 OK · Préstamo #' + id + ' DEVUELTO. El recurso vuelve a estar disponible y el historial se conserva en H2.';
        practiceReturnStatus.hidden = false;
      } else if (response.status === 404 || response.status === 409) {
        practiceLoanId = null;
        returnPracticeLoan.hidden = true;
        explanation.textContent = response.status === 404
          ? 'No se encontró este préstamo. No se seleccionó otro préstamo ni se liberó ningún recurso.'
          : 'Este préstamo ya no está ACTIVO. La devolución fue rechazada y no volvió a liberar el recurso.';
        await loadResources();
      } else {
        explanation.textContent = 'No se confirmó la devolución de este préstamo. Revisa el HTTP y el JSON antes de reintentar; no se seleccionará ningún otro registro.';
      }
    } catch (error) {
      status.textContent = 'Sin respuesta HTTP confirmada';
      status.classList.add('error');
      responseBox.textContent = 'No fue posible obtener la respuesta de la devolución.';
      explanation.textContent = 'No se puede confirmar si la devolución quedó guardada. Consulta los datos antes de reintentar. El backend rechazará una devolución repetida sin liberar de nuevo el recurso.';
    } finally {
      returningLoan = false;
      returnPracticeLoan.disabled = practiceLoanId === null;
      loanSubmit.disabled = submittingLoan || !resourcesAvailable;
    }
  });

  // Módulo 3: prácticas, simulaciones locales y consulta real de salud.
  const module3Pages = {
    practices: { element: document.querySelector('#module3-practices'), heading: document.querySelector('#module3-practices-title'), label: 'Página 1 de 2 · Buenas prácticas' },
    tools: { element: document.querySelector('#module3-tools'), heading: document.querySelector('#module3-tools-title'), label: 'Página 2 de 2 · Tendencias y herramientas' }
  };
  const module3Completion = document.querySelector('#module3 [data-complete]');
  function showModule3Page(page, moveFocus = true) {
    if (!Object.prototype.hasOwnProperty.call(module3Pages, page)) return;
    Object.entries(module3Pages).forEach(([key, value]) => {
      value.element.hidden = key !== page;
    });
    document.querySelectorAll('#module3 .module3-pages-nav [data-module3-page]').forEach(button => {
      const selected = button.dataset.module3Page === page;
      button.setAttribute('aria-pressed', String(selected));
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#module3-page-status').textContent = module3Pages[page].label;
    module3Completion.disabled = page !== 'tools' || completed.has('module3');
    if (moveFocus) module3Pages[page].heading.focus();
  }
  document.querySelectorAll('#module3 [data-module3-page]').forEach(button => button.addEventListener('click', () => {
    showModule3Page(button.dataset.module3Page);
  }));
  showModule3Page('practices', false);

  function selectModule3Choice(selector, selected) {
    document.querySelectorAll('#module3 ' + selector).forEach(button => {
      button.setAttribute('aria-pressed', String(button === selected));
    });
  }
  function setModule3Result(element, success) {
    element.classList.toggle('success', success);
    element.classList.toggle('risk', !success);
  }

  const packageContent = {
    controller: ['Controller', 'Recibe las peticiones HTTP.', 'PrestamoController recibe PrestamoRequest y delega al Service; no decide las reglas del préstamo.'],
    service: ['Service', 'Contiene las reglas del negocio.', 'PrestamoService verifica existencia y disponibilidad del recurso antes de registrar el préstamo.'],
    repository: ['Repository', 'Accede a los datos.', 'PrestamoRepository utiliza Spring Data JPA y JpaRepository para persistir los préstamos.'],
    entity: ['Entity', 'Representa la información persistida.', 'Prestamo y Recurso son Entities; sus campos y relaciones describen los datos guardados en H2.'],
    dto: ['DTO', 'Controla qué datos entran o salen de la API.', 'PrestamoRequest define la entrada; PrestamoResponse define la respuesta. Así no se expone directamente la Entity.'],
    exception: ['Exception', 'Centraliza errores de la aplicación.', 'GlobalExceptionHandler traduce las excepciones de recurso inexistente, no disponible y validación a respuestas HTTP claras.'],
    config: ['Config', 'Contiene configuraciones técnicas.', 'DatosInicialesConfig crea un Bean que carga recursos de demostración al arrancar cuando la base está vacía.']
  };
  document.querySelectorAll('#module3 [data-package]').forEach(button => button.addEventListener('click', () => {
    const content = packageContent[button.dataset.package];
    selectModule3Choice('[data-package]', button);
    document.querySelector('#organization-title').textContent = content[0];
    document.querySelector('#organization-detail').textContent = content[1];
    document.querySelector('#organization-example').textContent = content[2];
  }));

  document.querySelectorAll('#module3 [data-entity-answer]').forEach(button => button.addEventListener('click', () => {
    const safe = button.dataset.entityAnswer === 'no';
    selectModule3Choice('[data-entity-answer]', button);
    setModule3Result(document.querySelector('#dto-result'), safe);
    document.querySelector('#dto-result-label').textContent = safe ? '✓ CORRECTO' : '⚠ RIESGO';
    document.querySelector('#dto-feedback').textContent = safe
      ? 'El DTO permite devolver solo los datos necesarios. AlumnoResponse conserva id, nombre y correo; password no se expone.'
      : 'El campo password podría quedar expuesto junto con otros datos internos. Elige un DTO para controlar la respuesta.';
    document.querySelector('#dto-example').hidden = !safe;
  }));

  const validationForm = document.querySelector('#validation-form');
  validationForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#validation-name');
    const email = document.querySelector('#validation-email');
    const resource = document.querySelector('#validation-resource');
    const errors = [];
    const nameValid = name.value.trim().length > 0;
    const emailPresent = email.value.trim().length > 0;
    // Educational format check; the real API uses Jakarta Validation.
    const emailValid = emailPresent && /^[^\s@]+@[^\s@]+$/.test(email.value.trim());
    const resourcePresent = resource.value.trim().length > 0;
    const resourceId = Number(resource.value);
    const resourceValid = resourcePresent && Number.isSafeInteger(resourceId) && resourceId >= 1;
    name.setAttribute('aria-invalid', String(!nameValid));
    email.setAttribute('aria-invalid', String(!emailValid));
    resource.setAttribute('aria-invalid', String(!resourceValid));
    if (!nameValid) errors.push('@NotBlank · El nombre no puede estar vacío.');
    if (!emailValid) errors.push(emailPresent ? '@Email · El correo debe tener un formato válido.' : '@NotBlank · El correo no puede estar vacío; @Email comprueba su formato.');
    if (!resourceValid) {
      errors.push(!resourcePresent ? '@NotNull · Debes indicar un recurso.' : !Number.isSafeInteger(resourceId) ? 'Tipo Long · El identificador debe ser un número entero válido.' : '@Min(1) · El identificador debe ser igual o mayor que 1.');
    }
    const list = document.querySelector('#validation-errors');
    list.replaceChildren();
    errors.forEach(message => {
      const item = document.createElement('li');
      item.textContent = message;
      list.append(item);
    });
    setModule3Result(document.querySelector('#validation-result'), errors.length === 0);
    document.querySelector('#validation-summary').textContent = errors.length
      ? 'Revisa ' + errors.length + ' campo(s). La petición no debería continuar al Service.'
      : '✓ Datos válidos. La petición puede continuar hacia el Service.';
  });

  const httpContent = {
    200: ['200 OK', 'Consulta realizada correctamente.', 'GET /api/recursos\nEl servidor devuelve la lista de recursos en JSON.'],
    201: ['201 Created', 'Préstamo creado.', 'POST /api/prestamos\nEl servidor devuelve PrestamoResponse tras guardar el préstamo.'],
    400: ['400 Bad Request', 'Datos de la solicitud inválidos.', 'POST /api/prestamos\nEjemplo: nombre vacío o correo inválido.\nEl handler devuelve detalles de los campos con errores.'],
    404: ['404 Not Found', 'El recurso solicitado no existe.', 'POST /api/prestamos\nEl recursoId no corresponde a un recurso.\nRecursoNoEncontradoException → GlobalExceptionHandler.'],
    409: ['409 Conflict', 'El recurso ya está prestado.', 'POST /api/prestamos\nEl recurso existe, pero no está disponible.\nRecursoNoDisponibleException → GlobalExceptionHandler.']
  };
  document.querySelectorAll('#module3 [data-http]').forEach(button => button.addEventListener('click', () => {
    const code = Number(button.dataset.http);
    const content = httpContent[code];
    selectModule3Choice('[data-http]', button);
    setModule3Result(document.querySelector('#http-result'), code < 400);
    document.querySelector('#http-code').textContent = content[0];
    document.querySelector('#http-description').textContent = content[1];
    const example = document.querySelector('#http-example');
    example.textContent = content[2];
    example.hidden = false;
  }));

  document.querySelectorAll('#module3 [data-security-answer]').forEach(button => button.addEventListener('click', () => {
    const safe = button.dataset.securityAnswer === 'no';
    selectModule3Choice('[data-security-answer]', button);
    setModule3Result(document.querySelector('#security-result'), safe);
    document.querySelector('#security-label').textContent = safe ? '✓ CORRECTO' : '⚠ RIESGO';
    document.querySelector('#security-feedback').textContent = safe
      ? 'Las contraseñas y secretos no deberían quedar escritos directamente en el código fuente. Usa una variable de entorno para proporcionar el valor al ejecutar.'
      : 'No es una buena práctica: al compartir o subir el archivo a GitHub también compartirías la contraseña. La alternativa evita escribir el secreto en el repositorio.';
    document.querySelector('#security-example').hidden = false;
  }));

  const traditionalDto = [
    'public final class PrestamoResponse {',
    '    private final Long id;',
    '    private final String alumno, recurso, estado;',
    '    public PrestamoResponse(Long id, String alumno,',
    '            String recurso, String estado) {',
    '        this.id = id;',
    '        this.alumno = alumno;',
    '        this.recurso = recurso;',
    '        this.estado = estado;',
    '    }',
    '    public Long getId() { return id; }',
    '    public String getAlumno() { return alumno; }',
    '    public String getRecurso() { return recurso; }',
    '    public String getEstado() { return estado; }',
    '}'
  ].join('\n');
  const recordDto = 'public record PrestamoResponse(\n    Long id,\n    String alumno,\n    String recurso,\n    String estado\n) {}';
  document.querySelector('#compare-records').addEventListener('click', event => {
    const panel = document.querySelector('#records-comparison');
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    event.currentTarget.textContent = panel.hidden ? 'Comparar código' : 'Cerrar comparación';
    document.querySelector('#traditional-dto').textContent = traditionalDto;
    document.querySelector('#record-dto').textContent = recordDto;
    const traditionalLines = traditionalDto.split('\n').length;
    const recordLines = recordDto.split('\n').length;
    document.querySelector('#records-count').textContent = 'En este ejemplo: clase tradicional ' + traditionalLines + ' líneas · Record ' + recordLines + ' líneas (' + (traditionalLines - recordLines) + ' menos).';
  });

  let threadsPhase = 0;
  document.querySelector('#simulate-threads').addEventListener('click', event => {
    threadsPhase = threadsPhase === 1 ? 2 : 1;
    const waiting = threadsPhase === 1;
    const requests = document.querySelector('#threads-requests');
    requests.replaceChildren();
    [['A', 'BD'], ['B', 'HTTP'], ['C', 'archivo']].forEach(([name, io]) => {
      const item = document.createElement('li');
      item.textContent = 'Solicitud ' + name + ' → ' + (waiting ? 'esperando ' + io : '✓ espera de ' + io + ' finalizada; continúa su trabajo');
      requests.append(item);
    });
    document.querySelector('#threads-step').textContent = waiting ? 'Paso 1 de 2 · Tres solicitudes esperando I/O' : 'Paso 2 de 2 · Las solicitudes continúan';
    document.querySelector('#threads-explanation').textContent = waiting
      ? 'En este esquema, tres hilos tradicionales siguen ocupados por sus esperas. Los tres Virtual Threads pueden liberar sus portadores durante I/O compatible para que ejecuten otras tareas. Pulsa “Finalizar esperas” para continuar.'
      : 'Cuando termina la I/O, las tareas se reanudan. La ventaja es manejar muchas esperas bloqueantes con menor costo; no acelerar automáticamente un cálculo individual de CPU.';
    event.currentTarget.textContent = waiting ? 'Finalizar esperas' : 'Repetir simulación';
  });

  let checkingHealth = false;
  document.querySelector('#check-health').addEventListener('click', async event => {
    if (checkingHealth) return;
    const button = event.currentTarget;
    const result = document.querySelector('#health-result');
    if (!result.hidden) {
      result.hidden = true;
      button.textContent = 'Consultar estado real de la aplicación';
      button.setAttribute('aria-expanded', 'false');
      return;
    }
    result.hidden = false;
    button.textContent = 'Cerrar estado de la aplicación';
    button.setAttribute('aria-expanded', 'true');
    checkingHealth = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const status = document.querySelector('#health-status');
    const responseBox = document.querySelector('#health-response');
    const explanation = document.querySelector('#health-explanation');
    result.classList.remove('success', 'risk');
    status.textContent = 'Consultando GET /actuator/health…';
    responseBox.hidden = true;
    explanation.textContent = 'Esperando la respuesta real del servidor.';
    try {
      const response = await fetch('/actuator/health');
      const rawBody = await response.text();
      let data = null;
      try { data = JSON.parse(rawBody); } catch (error) { /* Preserve the real non-JSON body below. */ }
      const reportedStatus = data && typeof data.status === 'string' ? data.status : null;
      status.textContent = 'HTTP ' + response.status + (reportedStatus ? ' · ' + reportedStatus : '');
      responseBox.textContent = data !== null ? JSON.stringify(data, null, 2) : (rawBody || 'El servidor no devolvió un cuerpo de respuesta.');
      responseBox.hidden = false;
      setModule3Result(result, response.ok && reportedStatus === 'UP');
      explanation.textContent = response.ok && reportedStatus === 'UP'
        ? 'UP significa que la aplicación se encuentra funcionando según los indicadores de salud consultados. Esta respuesta proviene del endpoint real de Actuator.'
        : reportedStatus
          ? 'Actuator reporta ' + reportedStatus + '. Revisa los componentes y el código HTTP de la respuesta; no se debe asumir que la aplicación está saludable.'
          : 'La respuesta no contiene un estado de salud reconocible. Se muestra el cuerpo real sin inventar un estado UP.';
    } catch (error) {
      status.textContent = 'No se pudo obtener la respuesta de Actuator';
      responseBox.hidden = false;
      responseBox.textContent = 'Sin respuesta de salud confirmada.';
      setModule3Result(result, false);
      explanation.textContent = 'Comprueba la conexión y que Spring Boot esté ejecutándose. Una falla de conexión no equivale a un estado UP.';
    } finally {
      checkingHealth = false;
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
    }
  });

  const dockerContent = {
    project: ['Proyecto Spring Boot', 'El proyecto reúne código, recursos, pom.xml y configuración. Todavía no es una imagen ni un contenedor.'],
    jar: ['Maven genera JAR', 'El empaquetado de Maven produce el JAR ejecutable en target/. El Dockerfile real espera spring-boot-learning-lab-0.0.1-SNAPSHOT.jar.'],
    image: ['Docker crea imagen', 'docker build lee el Dockerfile, usa Java 21 y copia el JAR a app.jar. La imagen es la plantilla reproducible de ejecución.'],
    container: ['Se inicia contenedor', 'docker run inicia una instancia de la imagen. ENTRYPOINT ejecuta java -jar app.jar; configuración y variables de entorno pueden proporcionarse al iniciar.'],
    ready: ['Aplicación disponible', 'Con docker run -p 8080:8080 se publica el puerto para acceder desde localhost:8080. EXPOSE documenta el puerto, pero no lo publica por sí solo.']
  };
  document.querySelectorAll('#module3 [data-docker-step]').forEach(button => button.addEventListener('click', () => {
    const content = dockerContent[button.dataset.dockerStep];
    selectModule3Choice('[data-docker-step]', button);
    document.querySelector('#docker-step-title').textContent = content[0];
    document.querySelector('#docker-step-detail').textContent = content[1];
  }));

  // Módulo 4: un desafío de cinco preguntas, sin afectar otros módulos.
  const quizForm = document.querySelector('#final-quiz');
  const quizQuestions = [...document.querySelectorAll('#module4 [data-quiz-question]')];
  const quizDots = [...document.querySelectorAll('#module4 [data-quiz-dot]')];
  const quizAnswer = document.querySelector('#quiz-answer');
  const quizNext = document.querySelector('#quiz-next');
  const quizFeedback = document.querySelector('#quiz-feedback');
  const quizResult = document.querySelector('#quiz-result');
  const quizResponses = Array(5).fill(null);
  let quizIndex = 0;
  const quizLearning = [
    { answer: 'b', explanation: 'El Service contiene las reglas del negocio. El Controller recibe la petición y el Repository accede a los datos.' },
    { answer: 'a', explanation: 'DispatcherServlet recibe la petición y la dirige al Controller correspondiente.' },
    { answer: 'a', explanation: 'Los Profiles permiten utilizar configuraciones diferentes, por ejemplo application-dev.properties y application-prod.properties.' },
    { answer: 'a', explanation: 'Un DTO permite decidir qué información entra o sale de la API y evita exponer campos internos innecesariamente.' },
    { answer: 'b', explanation: 'Los Virtual Threads son livianos y resultan especialmente útiles en tareas que pasan tiempo esperando operaciones de entrada/salida.' }
  ];
  function renderQuizQuestion(moveFocus = false) {
    quizQuestions.forEach((question, index) => { question.hidden = index !== quizIndex; });
    quizDots.forEach((dot, index) => {
      dot.textContent = index === quizIndex || quizResponses[index] !== null ? '●' : '○';
      dot.classList.toggle('current', index === quizIndex);
      dot.classList.toggle('answered', quizResponses[index] !== null);
    });
    document.querySelector('#quiz-progress').textContent = 'Pregunta ' + (quizIndex + 1) + ' de 5';
    quizFeedback.hidden = true;
    quizAnswer.disabled = true;
    quizNext.disabled = true;
    quizNext.textContent = quizIndex === 4 ? 'Ver resultado final' : 'Siguiente pregunta →';
    if (moveFocus) quizQuestions[quizIndex].focus();
  }
  quizQuestions.forEach((question, index) => {
    question.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', () => {
      if (index === quizIndex && quizResponses[index] === null) quizAnswer.disabled = false;
    }));
  });
  quizForm.addEventListener('submit', event => {
    event.preventDefault();
    if (quizResponses[quizIndex] !== null) return;
    const inputs = [...quizQuestions[quizIndex].querySelectorAll('input[type="radio"]')];
    const selected = inputs.find(input => input.checked);
    if (!selected) return;
    const learning = quizLearning[quizIndex];
    const correct = selected.value === learning.answer;
    quizResponses[quizIndex] = { answer: selected.value, correct };
    inputs.forEach(input => {
      input.disabled = true;
      const label = input.closest('label');
      label.classList.toggle('quiz-correct', input.value === learning.answer);
      label.classList.toggle('quiz-wrong', input === selected && !correct);
    });
    quizFeedback.hidden = false;
    quizFeedback.classList.toggle('success', correct);
    quizFeedback.classList.toggle('risk', !correct);
    document.querySelector('#quiz-feedback-title').textContent = correct ? '✓ Respuesta correcta' : '✕ Respuesta incorrecta';
    document.querySelector('#quiz-feedback-text').textContent = learning.explanation;
    quizDots[quizIndex].classList.add('answered');
    quizAnswer.disabled = true;
    quizNext.disabled = false;
  });
  quizNext.addEventListener('click', () => {
    if (quizResponses[quizIndex] === null) return;
    if (quizIndex < quizQuestions.length - 1) {
      quizIndex += 1;
      renderQuizQuestion(true);
      return;
    }
    const score = quizResponses.filter(response => response && response.correct).length;
    quizForm.hidden = true;
    quizResult.hidden = false;
    document.querySelector('#quiz-score').textContent = score + ' / 5 respuestas correctas';
    document.querySelector('#quiz-percentage').textContent = (score * 20) + ' %';
    document.querySelector('#quiz-result-message').textContent = score === 5
      ? 'Excelente. Comprendiste los conceptos principales del recorrido.'
      : score >= 3
        ? 'Muy bien. Comprendiste la mayoría de los conceptos. Puedes volver a revisar los módulos que necesites.'
        : 'Conviene repasar algunos conceptos antes de finalizar.';
    document.querySelector('#quiz-score').focus();
  });
  document.querySelector('#quiz-repeat').addEventListener('click', () => {
    quizResponses.fill(null);
    quizIndex = 0;
    quizQuestions.forEach(question => {
      question.querySelectorAll('input[type="radio"]').forEach(input => {
        input.checked = false;
        input.disabled = false;
        input.closest('label').classList.remove('quiz-correct', 'quiz-wrong');
      });
    });
    quizFeedback.classList.remove('success', 'risk');
    document.querySelector('#quiz-feedback-title').textContent = 'Retroalimentación';
    document.querySelector('#quiz-feedback-text').textContent = '';
    document.querySelector('#quiz-score').textContent = '';
    document.querySelector('#quiz-percentage').textContent = '';
    document.querySelector('#quiz-result-message').textContent = '';
    quizResult.hidden = true;
    quizForm.hidden = false;
    renderQuizQuestion(true);
  });
  renderQuizQuestion();

  // Vocabulario: consulta independiente; no registra ni completa módulos.
  const vocabularyTerms = [
    {
      "id": "spring-boot",
      "title": "Spring Boot",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Ayuda a crear aplicaciones con Spring usando configuraciones y dependencias preparadas.",
      "purpose": "Permite empezar sin configurar toda la infraestructura a mano.",
      "example": "El laboratorio arranca Spring, crea sus componentes e inicia Tomcat.",
      "related": "arranque autoconfiguración servidor aplicación"
    },
    {
      "id": "spring-framework",
      "title": "Spring Framework",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es la base que administra componentes y ofrece herramientas para construir aplicaciones Java.",
      "purpose": "Organiza objetos, dependencias y peticiones web.",
      "example": "PrestamoService y PrestamoController son componentes administrados por Spring.",
      "related": "contenedor beans IoC MVC"
    },
    {
      "id": "spring-boot-application",
      "title": "@SpringBootApplication",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es la anotación que identifica la clase principal de una aplicación Spring Boot.",
      "purpose": "Reúne configuración, autoconfiguración y búsqueda de componentes.",
      "example": "La clase SpringBootLearningLabApplication ejecuta SpringApplication.run.",
      "related": "Configuration EnableAutoConfiguration ComponentScan main inicio"
    },
    {
      "id": "starter",
      "title": "Starter",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es una dependencia que agrupa librerías compatibles para una tarea.",
      "purpose": "Evita elegir y coordinar manualmente todas esas librerías.",
      "example": "spring-boot-starter-web aporta Spring MVC y Tomcat embebido.",
      "related": "dependencias biblioteca pom.xml web jpa validation"
    },
    {
      "id": "dependencia",
      "title": "Dependency / Dependencia",
      "fullName": "Dependencia de software",
      "categories": [
        "spring"
      ],
      "definition": "Es una librería o componente que nuestro proyecto necesita para funcionar.",
      "purpose": "Permite reutilizar funciones ya desarrolladas.",
      "example": "El pom.xml declara H2 para almacenar recursos y préstamos.",
      "related": "dependency librería biblioteca Maven Starter"
    },
    {
      "id": "maven",
      "title": "Maven",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es una herramienta que lee pom.xml y prepara tareas del proyecto Java.",
      "purpose": "Descarga dependencias y permite compilar, probar y empaquetar.",
      "example": "Maven genera el JAR que utiliza el Dockerfile del laboratorio.",
      "related": "compilar build package dependencias repositorio Maven Central"
    },
    {
      "id": "pom-xml",
      "title": "pom.xml",
      "fullName": "Project Object Model",
      "categories": [
        "spring"
      ],
      "definition": "Es el archivo donde Maven conoce las dependencias, plugins y características del proyecto.",
      "purpose": "Define qué necesita el proyecto para compilarse y funcionar.",
      "example": "Contiene spring-boot-starter-web y spring-boot-starter-data-jpa.",
      "related": "Maven configuración Java build dependencias"
    },
    {
      "id": "maven-wrapper",
      "title": "Maven Wrapper",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Son los archivos que permiten ejecutar una versión definida de Maven desde el proyecto.",
      "purpose": "Facilita que distintas personas usen la misma herramienta.",
      "example": "En Windows se utiliza mvnw.cmd; el proyecto también incluye mvnw y .mvn.",
      "related": "mvnw mvnw.cmd compilación entorno Maven"
    },
    {
      "id": "bean",
      "title": "Bean",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es un objeto creado y administrado por Spring.",
      "purpose": "Permite que Spring conecte componentes y gestione su ciclo de vida.",
      "example": "PrestamoService es un Bean porque está marcado con @Service.",
      "related": "objeto contenedor ApplicationContext IoC componente"
    },
    {
      "id": "application-context",
      "title": "ApplicationContext",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es el contenedor de Spring que administra los Beans y sus dependencias.",
      "purpose": "Mantiene disponibles los componentes que colaboran en la aplicación.",
      "example": "Administra el Service y las dependencias que recibe PrestamoController.",
      "related": "Bean contenedor IoC creación objetos contexto"
    },
    {
      "id": "ioc",
      "title": "IoC",
      "fullName": "Inversión de Control",
      "categories": [
        "spring"
      ],
      "definition": "Significa que Spring se encarga de crear y conectar componentes en vez de que cada clase lo haga sola.",
      "purpose": "Separa la construcción de los objetos del trabajo que realizan.",
      "example": "Spring crea PrestamoService y lo entrega donde se necesita.",
      "related": "inversion control beans contenedor objetos"
    },
    {
      "id": "di",
      "title": "DI",
      "fullName": "Inyección de Dependencias",
      "categories": [
        "spring"
      ],
      "definition": "Consiste en entregar a una clase los componentes que necesita.",
      "purpose": "Evita que cada clase construya sus dependencias con new.",
      "example": "PrestamoController recibe PrestamoService mediante su constructor.",
      "related": "inyeccion constructor dependencia IoC"
    },
    {
      "id": "tomcat",
      "title": "Tomcat",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es un servidor que recibe peticiones HTTP y ejecuta aplicaciones web Java.",
      "purpose": "Entrega las peticiones a la infraestructura Servlet de la aplicación.",
      "example": "Tomcat embebido recibe las peticiones del laboratorio en localhost:8080.",
      "related": "servidor HTTP petición servlet puerto"
    },
    {
      "id": "servidor-embebido",
      "title": "Servidor embebido",
      "fullName": "",
      "categories": [
        "spring"
      ],
      "definition": "Es un servidor que se inicia como parte de la propia aplicación.",
      "purpose": "Permite ejecutar el laboratorio sin instalar Tomcat por separado.",
      "example": "El JAR de Spring Boot incluye lo necesario para iniciar su servidor web.",
      "related": "Tomcat JAR arranque servidor externo WAR"
    },
    {
      "id": "mvc",
      "title": "MVC",
      "fullName": "Modelo · Vista · Controlador",
      "categories": [
        "architecture"
      ],
      "definition": "Es una forma de separar los datos, la presentación y la recepción de peticiones.",
      "purpose": "Ayuda a no mezclar responsabilidades en una aplicación web.",
      "example": "El laboratorio usa Thymeleaf para la vista y Controllers para recibir peticiones.",
      "related": "arquitectura model view controller HTML JSON"
    },
    {
      "id": "dispatcher-servlet",
      "title": "DispatcherServlet",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Es el punto de entrada de las peticiones en Spring MVC.",
      "purpose": "Coordina qué Controller debe procesar cada petición HTTP.",
      "example": "Dirige POST /api/prestamos hacia PrestamoController.",
      "related": "petición request Front Controller HTTP enrutamiento"
    },
    {
      "id": "controller",
      "title": "Controller",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Es el componente que recibe peticiones HTTP y delega el trabajo.",
      "purpose": "Separa la entrada web de las reglas del negocio.",
      "example": "PrestamoController recibe una petición para registrar un préstamo.",
      "related": "Controller @Controller petición endpoint MVC"
    },
    {
      "id": "rest-controller",
      "title": "@RestController",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Identifica un Controller que devuelve datos directamente, normalmente JSON.",
      "purpose": "Permite construir endpoints de una API REST.",
      "example": "PrestamoController devuelve un PrestamoResponse al crear el préstamo.",
      "related": "RestController controller JSON petición API HTTP"
    },
    {
      "id": "service",
      "title": "Service",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Es la capa que contiene las reglas del negocio.",
      "purpose": "Decide cómo debe realizarse una operación del sistema.",
      "example": "PrestamoService comprueba si el recurso existe y puede prestarse.",
      "related": "@Service lógica negocio disponibilidad préstamo"
    },
    {
      "id": "repository",
      "title": "Repository",
      "fullName": "",
      "categories": [
        "architecture",
        "data"
      ],
      "definition": "Es la capa que guarda o consulta información en la base de datos.",
      "purpose": "Separa el acceso a datos de las reglas del préstamo.",
      "example": "PrestamoRepository guarda o consulta préstamos utilizando JpaRepository.",
      "related": "@Repository persistencia base de datos H2 JPA consultas"
    },
    {
      "id": "entity",
      "title": "Entity",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Es una clase que representa información que puede guardarse en la base de datos.",
      "purpose": "Describe datos persistidos y relaciones entre ellos.",
      "example": "Prestamo representa información que puede almacenarse en H2 y se relaciona con Recurso.",
      "related": "@Entity base de datos tabla persistencia JPA Hibernate"
    },
    {
      "id": "dto",
      "title": "DTO",
      "fullName": "Data Transfer Object",
      "categories": [
        "architecture"
      ],
      "definition": "Un DTO permite decidir qué datos queremos recibir o devolver.",
      "purpose": "Evita exponer directamente todos los campos internos de una Entity.",
      "example": "PrestamoRequest contiene los datos para solicitar un préstamo. El ejemplo AlumnoResponse del módulo 3 no incluye password.",
      "related": "entrada salida API datos Entity seguridad contraseña password Record"
    },
    {
      "id": "config",
      "title": "Config",
      "fullName": "Configuración técnica",
      "categories": [
        "architecture"
      ],
      "definition": "Es el paquete donde se agrupan configuraciones técnicas de la aplicación.",
      "purpose": "Mantiene esos ajustes separados de la lógica del negocio.",
      "example": "DatosInicialesConfig carga recursos de demostración cuando la base está vacía.",
      "related": "@Configuration @Bean configuración paquetes"
    },
    {
      "id": "exception",
      "title": "Exception",
      "fullName": "Excepción",
      "categories": [
        "architecture"
      ],
      "definition": "Es una señal de que ocurrió una situación que requiere atención durante una operación.",
      "purpose": "Permite comunicar errores y responder de forma controlada.",
      "example": "RecursoNoDisponibleException indica que el recurso ya está prestado.",
      "related": "errores exception handler 409 paquete exception"
    },
    {
      "id": "controller-advice",
      "title": "@ControllerAdvice",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Agrupa el manejo de errores de los Controllers en un lugar común.",
      "purpose": "Evita repetir el mismo tratamiento de errores en cada endpoint.",
      "example": "El laboratorio utiliza la variante @RestControllerAdvice en GlobalExceptionHandler.",
      "related": "errores centralizados MVC HTTP excepción"
    },
    {
      "id": "rest-controller-advice",
      "title": "@RestControllerAdvice",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Centraliza el manejo de errores y devuelve el cuerpo de respuesta directamente.",
      "purpose": "Ayuda a enviar errores claros en una API, habitualmente como JSON.",
      "example": "GlobalExceptionHandler devuelve respuestas 400, 404 o 409 según el problema.",
      "related": "ControllerAdvice API errores excepción JSON"
    },
    {
      "id": "exception-handler",
      "title": "@ExceptionHandler",
      "fullName": "",
      "categories": [
        "architecture"
      ],
      "definition": "Indica qué método debe atender un tipo de excepción.",
      "purpose": "Transforma un error del sistema en una respuesta comprensible.",
      "example": "Un handler convierte RecursoNoEncontradoException en HTTP 404.",
      "related": "manejo errores excepción ControllerAdvice status"
    },
    {
      "id": "jpa",
      "title": "JPA",
      "fullName": "Jakarta Persistence",
      "categories": [
        "data"
      ],
      "definition": "Describe cómo relacionar objetos Java con datos guardados en una base de datos.",
      "purpose": "Permite trabajar con Entities sin escribir manualmente cada operación de persistencia.",
      "example": "Prestamo y Recurso se guardan mediante JPA y sus repositorios.",
      "related": "base de datos ORM Entity Hibernate Spring Data JPA JpaRepository"
    },
    {
      "id": "hibernate",
      "title": "Hibernate",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es una herramienta que implementa JPA y transforma operaciones sobre objetos en trabajo con la base de datos.",
      "purpose": "Conecta las Entities con tablas y consultas SQL.",
      "example": "Guarda el préstamo y el cambio de disponibilidad del recurso en H2.",
      "related": "base de datos ORM SQL JPA Entity persistencia"
    },
    {
      "id": "h2",
      "title": "H2",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es el motor de base de datos utilizado por este laboratorio.",
      "purpose": "Almacena la información de recursos y préstamos.",
      "example": "La tabla educativa del módulo 2 muestra datos reales devueltos después de guardar un préstamo.",
      "related": "base de datos almacenamiento JDBC SQL persistencia"
    },
    {
      "id": "base-de-datos",
      "title": "Base de datos",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es un sistema que organiza y conserva información para consultarla o modificarla.",
      "purpose": "Mantiene los datos disponibles más allá de una pantalla.",
      "example": "H2 conserva recursos y préstamos del instituto.",
      "related": "datos H2 tabla registro persistencia SQL"
    },
    {
      "id": "persistencia",
      "title": "Persistencia",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es guardar información para poder recuperarla después.",
      "purpose": "Evita que los datos existan solo durante una acción en pantalla.",
      "example": "El préstamo queda guardado en la base H2 del laboratorio.",
      "related": "base de datos guardar almacenar Repository JPA"
    },
    {
      "id": "tabla",
      "title": "Tabla",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es una estructura de la base de datos con columnas y filas.",
      "purpose": "Organiza registros con los mismos tipos de información.",
      "example": "Los préstamos persistidos pueden representarse con columnas como ID, alumno y estado.",
      "related": "base de datos H2 fila columna registro"
    },
    {
      "id": "registro",
      "title": "Registro",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es una fila de datos guardada en una tabla.",
      "purpose": "Representa una instancia concreta de información.",
      "example": "Un préstamo creado corresponde a un registro con su ID y estado.",
      "related": "base de datos fila tabla préstamo persistencia"
    },
    {
      "id": "id",
      "title": "ID",
      "fullName": "Identificador",
      "categories": [
        "data"
      ],
      "definition": "Es un valor que permite distinguir un elemento de otros.",
      "purpose": "Sirve para referirse a un recurso o préstamo concreto.",
      "example": "PrestamoRequest usa recursoId para indicar qué recurso solicita el alumno.",
      "related": "base de datos identificador clave primaria recursoId"
    },
    {
      "id": "primary-key",
      "title": "Primary Key / Clave primaria",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es la columna o conjunto de columnas que identifica de forma única cada fila.",
      "purpose": "Evita confundir dos registros de la misma tabla.",
      "example": "El campo id de Prestamo está marcado con @Id y se genera al persistirlo.",
      "related": "base de datos ID @Id GeneratedValue tabla único"
    },
    {
      "id": "show-sql",
      "title": "spring.jpa.show-sql",
      "fullName": "",
      "categories": [
        "data"
      ],
      "definition": "Es una propiedad que permite mostrar en consola el SQL generado por Hibernate.",
      "purpose": "Ayuda a observar qué consultas se ejecutan durante el desarrollo.",
      "example": "El módulo 2 permite activar o desactivar su valor en la demostración.",
      "related": "base de datos SQL consola Hibernate configuración"
    },
    {
      "id": "ddl-auto",
      "title": "ddl-auto",
      "fullName": "spring.jpa.hibernate.ddl-auto",
      "categories": [
        "data"
      ],
      "definition": "Indica qué debe hacer Hibernate con la estructura de las tablas al arrancar.",
      "purpose": "Permite elegir acciones como actualizar o validar el esquema.",
      "example": "El laboratorio muestra update; el ejemplo PROD usa validate.",
      "related": "base de datos tablas esquema configuración update validate Hibernate"
    },
    {
      "id": "api",
      "title": "API",
      "fullName": "Application Programming Interface",
      "categories": [
        "api"
      ],
      "definition": "Es una forma definida de pedir funciones o datos a una aplicación.",
      "purpose": "Permite que una interfaz u otro programa se comunique con el sistema.",
      "example": "El formulario utiliza la API del laboratorio para registrar préstamos.",
      "related": "HTTP endpoint interfaz comunicación petición"
    },
    {
      "id": "api-rest",
      "title": "API REST",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es una forma de organizar una API web alrededor de recursos y operaciones HTTP.",
      "purpose": "Da una estructura reconocible a las peticiones y respuestas.",
      "example": "La API del laboratorio utiliza rutas como /api/recursos y /api/prestamos.",
      "related": "HTTP recursos endpoint JSON petición"
    },
    {
      "id": "endpoint",
      "title": "Endpoint",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es un punto de acceso de una API, definido por una ruta y una operación.",
      "purpose": "Indica dónde y cómo solicitar una acción.",
      "example": "POST /api/prestamos es el endpoint para registrar un préstamo.",
      "related": "petición request URL ruta método HTTP"
    },
    {
      "id": "http",
      "title": "HTTP",
      "fullName": "Hypertext Transfer Protocol",
      "categories": [
        "api"
      ],
      "definition": "Es el protocolo con el que un cliente y un servidor intercambian peticiones y respuestas web.",
      "purpose": "Define métodos y códigos para comunicar qué se pide y qué ocurrió.",
      "example": "El navegador envía una petición POST y recibe HTTP 201 al crear un préstamo.",
      "related": "petición request response respuesta API web"
    },
    {
      "id": "request",
      "title": "Request / Petición",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es el mensaje que el cliente envía al servidor para pedir una acción.",
      "purpose": "Transporta la ruta, el método y, cuando corresponde, los datos de entrada.",
      "example": "La petición del préstamo incluye nombreAlumno, correoAlumno y recursoId.",
      "related": "HTTP petición entrada POST JSON"
    },
    {
      "id": "response",
      "title": "Response / Respuesta",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es el mensaje que devuelve el servidor después de procesar una petición.",
      "purpose": "Comunica un código HTTP y, cuando corresponde, datos de salida.",
      "example": "Al crear un préstamo se devuelve un PrestamoResponse con HTTP 201.",
      "related": "HTTP petición salida DTO JSON"
    },
    {
      "id": "json",
      "title": "JSON",
      "fullName": "JavaScript Object Notation",
      "categories": [
        "api"
      ],
      "definition": "Es un formato de texto para representar datos mediante objetos, listas y valores.",
      "purpose": "Permite intercambiar información entre la interfaz y la API.",
      "example": "El formulario envía los datos del préstamo como JSON.",
      "related": "API request response petición datos objeto"
    },
    {
      "id": "get",
      "title": "GET",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es el método HTTP utilizado para consultar información.",
      "purpose": "Permite pedir datos sin solicitar que se cree un préstamo.",
      "example": "GET /api/recursos consulta la lista de recursos.",
      "related": "HTTP petición consulta endpoint lectura"
    },
    {
      "id": "post",
      "title": "POST",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es un método HTTP que se usa para enviar datos y solicitar una nueva operación o creación.",
      "purpose": "Permite registrar información mediante una petición.",
      "example": "POST /api/prestamos permite crear un nuevo préstamo.",
      "related": "HTTP petición crear registrar JSON"
    },
    {
      "id": "put",
      "title": "PUT",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es un método HTTP que normalmente se utiliza para reemplazar el estado de un recurso identificado.",
      "purpose": "Permite expresar una actualización en una API.",
      "example": "Se enseña como concepto HTTP; el backend actual del laboratorio no tiene un endpoint PUT.",
      "related": "HTTP petición actualización reemplazo método"
    },
    {
      "id": "delete",
      "title": "DELETE",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Es el método HTTP que solicita eliminar un recurso identificado.",
      "purpose": "Permite expresar una eliminación en una API.",
      "example": "Se enseña como concepto HTTP; el backend actual del laboratorio no tiene un endpoint DELETE.",
      "related": "HTTP petición eliminación borrar método"
    },
    {
      "id": "200",
      "title": "200 OK",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Indica que una petición terminó correctamente.",
      "purpose": "Confirma una operación exitosa, como una consulta.",
      "example": "La consulta de recursos disponibles responde HTTP 200.",
      "related": "HTTP status respuesta éxito consultar GET"
    },
    {
      "id": "201",
      "title": "201 Created",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Indica que se creó un recurso correctamente.",
      "purpose": "Permite distinguir una creación de una consulta.",
      "example": "El servidor responde HTTP 201 cuando el préstamo fue creado.",
      "related": "HTTP status respuesta POST éxito préstamo"
    },
    {
      "id": "400",
      "title": "400 Bad Request",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Indica que la petición contiene datos inválidos o no puede interpretarse correctamente.",
      "purpose": "Ayuda al cliente a corregir lo enviado.",
      "example": "Un nombre vacío o un correo inválido puede producir un HTTP 400 en el préstamo.",
      "related": "HTTP status validación petición error NotBlank Email"
    },
    {
      "id": "404",
      "title": "404 Not Found",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Indica que no se encontró el recurso solicitado.",
      "purpose": "Comunica que el identificador o destino pedido no existe.",
      "example": "El Service puede responder mediante el handler con HTTP 404 si el recursoId no existe.",
      "related": "HTTP status recurso inexistente error petición"
    },
    {
      "id": "409",
      "title": "409 Conflict",
      "fullName": "",
      "categories": [
        "api"
      ],
      "definition": "Indica que la operación entra en conflicto con el estado actual del recurso.",
      "purpose": "Permite explicar por qué una acción válida no puede realizarse ahora.",
      "example": "El laboratorio devuelve HTTP 409 si el recurso ya está prestado.",
      "related": "HTTP status disponibilidad conflicto error préstamo"
    },
    {
      "id": "application-properties",
      "title": "application.properties",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es un archivo donde Spring Boot lee ajustes escritos como clave=valor.",
      "purpose": "Permite configurar la aplicación sin cambiar clases Java.",
      "example": "server.port=8080 define el puerto del laboratorio.",
      "related": "configuración properties puerto datasource SQL"
    },
    {
      "id": "yaml",
      "title": "application.yml / YAML",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es una forma de escribir configuración usando niveles e indentación.",
      "purpose": "Expresa ajustes equivalentes a properties con otra sintaxis.",
      "example": "server: seguido de port: 8081 representa el mismo ajuste del ejemplo Properties.",
      "related": "configuración YAML application.yaml formato properties"
    },
    {
      "id": "profile",
      "title": "Profile",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es una configuración que se activa para un ambiente o contexto concreto.",
      "purpose": "Permite separar ajustes de desarrollo y producción.",
      "example": "Los ejemplos DEV y PROD del módulo 2 muestran configuraciones distintas.",
      "related": "perfil profiles ambiente desarrollo producción spring.profiles.active"
    },
    {
      "id": "application-dev",
      "title": "application-dev.properties",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es el archivo de ajustes asociado al perfil dev.",
      "purpose": "Agrupa opciones útiles durante el desarrollo.",
      "example": "En el proyecto configura un archivo H2 de desarrollo y muestra SQL.",
      "related": "Profile configuración ambiente desarrollo DEV"
    },
    {
      "id": "application-prod",
      "title": "application-prod.properties",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es el archivo de ajustes asociado al perfil prod.",
      "purpose": "Separa opciones de producción y referencias a variables de entorno.",
      "example": "El ejemplo del proyecto utiliza DB_URL, DB_USERNAME y DB_PASSWORD.",
      "related": "Profile configuración ambiente producción PROD secretos"
    },
    {
      "id": "variable-entorno",
      "title": "Variable de entorno",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es un valor que el entorno de ejecución proporciona a una aplicación.",
      "purpose": "Permite entregar ajustes sin escribir sus valores directamente en el código.",
      "example": "DB_PASSWORD proporciona la contraseña referenciada en la configuración.",
      "related": "configuración secretos contraseña seguridad environment"
    },
    {
      "id": "datasource",
      "title": "Datasource",
      "fullName": "Fuente de datos",
      "categories": [
        "config"
      ],
      "definition": "Es la configuración y el componente que permiten obtener conexiones a una base de datos.",
      "purpose": "Indica a la aplicación cómo conectarse para guardar o consultar información.",
      "example": "El Datasource del laboratorio se conecta a H2.",
      "related": "base de datos conexión JDBC configuración url usuario contraseña"
    },
    {
      "id": "puerto",
      "title": "Puerto / server.port",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "El puerto es el número donde un servidor escucha conexiones.",
      "purpose": "Permite dirigir una petición al servicio correcto.",
      "example": "El laboratorio escucha en localhost:8080; cambiar el ejemplo del módulo 2 no cambia ese puerto real.",
      "related": "configuración red Tomcat HTTP servidor"
    },
    {
      "id": "datasource-url",
      "title": "spring.datasource.url",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es la propiedad que indica la ubicación y el tipo de conexión de la base de datos.",
      "purpose": "Permite a Spring Boot encontrar la base a utilizar.",
      "example": "jdbc:h2:file:./data/learninglab identifica el archivo H2 del laboratorio.",
      "related": "base de datos Datasource configuración JDBC ubicación conexión"
    },
    {
      "id": "datasource-username",
      "title": "spring.datasource.username",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es el nombre de usuario usado para conectarse a la base de datos.",
      "purpose": "Identifica con qué usuario se abre la conexión.",
      "example": "El laboratorio local utiliza el usuario sa de H2.",
      "related": "base de datos Datasource configuración usuario conexión"
    },
    {
      "id": "datasource-password",
      "title": "spring.datasource.password",
      "fullName": "",
      "categories": [
        "config"
      ],
      "definition": "Es la contraseña utilizada para conectarse a la base de datos.",
      "purpose": "Completa las credenciales cuando la conexión las necesita.",
      "example": "El ejemplo PROD referencia ${DB_PASSWORD} en lugar de escribir una contraseña real.",
      "related": "base de datos Datasource configuración secreto seguridad conexión"
    },
    {
      "id": "valid",
      "title": "@Valid",
      "fullName": "",
      "categories": [
        "validation"
      ],
      "definition": "Pide que se comprueben las restricciones del objeto recibido.",
      "purpose": "Activa la validación del DTO en el punto donde se utiliza.",
      "example": "PrestamoController usa @Valid con PrestamoRequest.",
      "related": "validación Controller petición error 400"
    },
    {
      "id": "not-blank",
      "title": "@NotBlank",
      "fullName": "",
      "categories": [
        "validation"
      ],
      "definition": "Exige que un texto no sea nulo, vacío ni solo espacios.",
      "purpose": "Evita aceptar campos de texto sin información.",
      "example": "El nombre del alumno es obligatorio en PrestamoRequest.",
      "related": "validación texto vacío nombre obligatorio"
    },
    {
      "id": "email",
      "title": "@Email",
      "fullName": "",
      "categories": [
        "validation"
      ],
      "definition": "Comprueba que un texto tenga un formato de correo aceptado por el validador.",
      "purpose": "Ayuda a detectar correos mal escritos; por sí sola no exige un valor no vacío.",
      "example": "PrestamoRequest combina @Email con @NotBlank para el correo del alumno.",
      "related": "validación correo email formato 400"
    },
    {
      "id": "not-null",
      "title": "@NotNull",
      "fullName": "",
      "categories": [
        "validation"
      ],
      "definition": "Exige que se proporcione un valor distinto de null.",
      "purpose": "Evita que falte un dato requerido; no comprueba que exista en la base.",
      "example": "PrestamoRequest exige recursoId, y luego el Service verifica que el recurso exista.",
      "related": "validación nulo obligatorio identificador recurso"
    },
    {
      "id": "min",
      "title": "@Min",
      "fullName": "",
      "categories": [
        "validation"
      ],
      "definition": "Exige que un número proporcionado alcance un mínimo.",
      "purpose": "Permite rechazar valores menores que el límite establecido.",
      "example": "El módulo 3 enseña @Min(1) para un ID. Es un ejemplo educativo y no modifica el DTO real.",
      "related": "validación mínimo número identificador recurso ID"
    },
    {
      "id": "java-21",
      "title": "Java 21",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es la versión de Java utilizada por el proyecto.",
      "purpose": "Proporciona el lenguaje y el entorno donde se ejecuta la aplicación.",
      "example": "El laboratorio utiliza Spring Boot 3.x y Java 21.",
      "related": "Java moderno JDK JVM lenguaje herramientas"
    },
    {
      "id": "record",
      "title": "Record",
      "fullName": "Java Record",
      "categories": [
        "tools"
      ],
      "definition": "Es una forma compacta de declarar datos con campos finales y métodos generados por Java.",
      "purpose": "Reduce código repetitivo en estructuras como DTOs.",
      "example": "PrestamoRequest y PrestamoResponse son Records del backend.",
      "related": "Java moderno DTO constructor accesores equals hashCode toString"
    },
    {
      "id": "virtual-thread",
      "title": "Virtual Thread",
      "fullName": "Hilo virtual",
      "categories": [
        "tools"
      ],
      "definition": "Es un hilo ligero administrado por la JVM para ejecutar tareas concurrentes.",
      "purpose": "Ayuda con muchas tareas bloqueantes que esperan I/O; no acelera automáticamente un cálculo de CPU.",
      "example": "La simulación compara solicitudes esperando base de datos, HTTP y archivos.",
      "related": "Java 21 Virtual Threads hilos concurrencia entrada salida I/O"
    },
    {
      "id": "actuator",
      "title": "Actuator",
      "fullName": "Spring Boot Actuator",
      "categories": [
        "tools"
      ],
      "definition": "Añade endpoints para observar la salud e información operativa de una aplicación.",
      "purpose": "Ayuda a comprobar cómo está funcionando un servicio.",
      "example": "El módulo 3 consulta el endpoint real de salud del laboratorio.",
      "related": "monitoreo salud health estado herramientas"
    },
    {
      "id": "actuator-health",
      "title": "/actuator/health",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es la ruta de Actuator que informa el estado de salud disponible.",
      "purpose": "Permite consultar una respuesta real, por ejemplo status UP.",
      "example": "El botón del módulo 3 envía GET /actuator/health y muestra su JSON completo.",
      "related": "Actuator HTTP endpoint UP monitoreo salud"
    },
    {
      "id": "openapi",
      "title": "OpenAPI",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es una forma de describir una API y sus operaciones.",
      "purpose": "Documenta rutas, parámetros, datos de entrada, respuestas y códigos HTTP.",
      "example": "SpringDoc genera la descripción de los endpoints del laboratorio.",
      "related": "API documentación Swagger especificación request response"
    },
    {
      "id": "swagger",
      "title": "Swagger",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es el nombre de herramientas usadas para trabajar con descripciones de APIs, como Swagger UI.",
      "purpose": "Ayuda a explorar y probar una API documentada.",
      "example": "El acceso Swagger del laboratorio abre su interfaz real de documentación.",
      "related": "OpenAPI documentación endpoints herramientas API"
    },
    {
      "id": "swagger-ui",
      "title": "Swagger UI",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es la interfaz web que permite leer una descripción OpenAPI y probar sus operaciones.",
      "purpose": "Muestra los endpoints y permite enviar peticiones desde el navegador.",
      "example": "El proyecto la expone mediante /swagger-ui.html.",
      "related": "Swagger OpenAPI documentación petición API interfaz"
    },
    {
      "id": "docker",
      "title": "Docker",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es una herramienta para construir imágenes y ejecutar contenedores.",
      "purpose": "Permite ejecutar una aplicación en un entorno definido y reproducible.",
      "example": "El módulo 3 explica cómo llevar el JAR del laboratorio a un contenedor.",
      "related": "despliegue herramientas imagen contenedor entorno"
    },
    {
      "id": "dockerfile",
      "title": "Dockerfile",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es el archivo de instrucciones para construir una imagen Docker.",
      "purpose": "Define la base de ejecución y qué archivos se incluyen.",
      "example": "El Dockerfile usa Java 21 y copia el JAR del laboratorio a app.jar.",
      "related": "Docker imagen despliegue instrucciones FROM COPY ENTRYPOINT"
    },
    {
      "id": "imagen-docker",
      "title": "Imagen Docker",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es una plantilla que reúne archivos y un entorno de ejecución.",
      "purpose": "Sirve como base para iniciar contenedores.",
      "example": "La imagen del ejemplo incluye Java 21 y el JAR de Spring Boot.",
      "related": "Docker contenedor despliegue entorno reproducible"
    },
    {
      "id": "contenedor",
      "title": "Contenedor",
      "fullName": "",
      "categories": [
        "tools"
      ],
      "definition": "Es una instancia en ejecución de una imagen.",
      "purpose": "Ejecuta la aplicación con el entorno definido por esa imagen.",
      "example": "El ejemplo inicia el JAR y publica el puerto 8080 con docker run -p.",
      "related": "Docker imagen despliegue ejecución puerto"
    }
  ];

  const vocabularyCategories = {
    spring: 'Spring Boot', architecture: 'Arquitectura', data: 'Datos',
    api: 'API / HTTP', config: 'Configuración', validation: 'Validaciones',
    tools: 'Herramientas modernas'
  };
  const vocabularySearch = document.querySelector('#vocabulary-search');
  const vocabularyResults = document.querySelector('#vocabulary-results');
  const vocabularyDetail = document.querySelector('#vocabulary-detail');
  const vocabularyMeta = {
    spring: ['⚙', 'Inicio, componentes y funcionamiento del framework.'],
    architecture: ['▦', 'Capas y responsabilidades de una aplicación Spring Boot.'],
    data: ['▤', 'Persistencia, tablas y acceso a los datos.'],
    api: ['⇄', 'Peticiones, respuestas y comunicación de una API.'],
    config: ['☷', 'Archivos, entornos y ajustes de la aplicación.'],
    validation: ['✓', 'Reglas para comprobar los datos recibidos.'],
    tools: ['◇', 'Java 21 y herramientas del laboratorio.']
  };
  const vocabularyGroups = new Map();
  const vocabularyWordButtons = [];
  const vocabularyEntries = new Map();
  let vocabularyActive = null;
  let vocabularyCategory = null;
  let vocabularyReturnFocus = null;
  let vocabularyModalSource = null;
  let vocabularyPendingHash = false;
  function normalizeVocabulary(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function vocabularyCategoryTerms(key) {
    return vocabularyTerms.filter(term => term.categories.includes(key));
  }
  function openVocabularyCategory(key) {
    vocabularyGroups.forEach((group, category) => { group.details.open = category === key; });
  }
  function highlightVocabularyTerm() {
    vocabularyWordButtons.forEach(({button, term}) => button.setAttribute('aria-pressed', String(vocabularyDetail.open && vocabularyActive?.id === term.id)));
  }
  function openVocabularyDefinition(term, category, trigger, source = 'category', focus = true) {
    vocabularyCategory = category;
    vocabularyActive = term;
    vocabularyModalSource = source;
    openVocabularyCategory(category);
    vocabularyReturnFocus = trigger || vocabularyGroups.get(category).buttons.get(term.id);
    document.querySelector('#vocabulary-detail-title').textContent = term.title;
    const fullName = document.querySelector('#vocabulary-detail-full-name');
    fullName.textContent = term.fullName;
    fullName.hidden = !term.fullName;
    document.querySelector('#vocabulary-detail-category').textContent = 'Categoría: ' + term.categories.map(key => vocabularyCategories[key]).join(' · ');
    document.querySelector('#vocabulary-meaning').textContent = term.definition;
    document.querySelector('#vocabulary-purpose').textContent = term.purpose;
    document.querySelector('#vocabulary-example').textContent = term.example;
    const terms = vocabularyCategoryTerms(category);
    const index = terms.indexOf(term);
    document.querySelector('#vocabulary-previous').disabled = index <= 0;
    document.querySelector('#vocabulary-next').disabled = index >= terms.length - 1;
    if (!vocabularyDetail.open) vocabularyDetail.showModal();
    highlightVocabularyTerm();
    if (focus) document.querySelector('#vocabulary-detail-title').focus();
  }
  function closeVocabularyDefinition() {
    if (vocabularyDetail.open) vocabularyDetail.close();
    finishVocabularyClose();
  }
  // A single dialog owns all definition content. Closing never changes an accordion.
  function finishVocabularyClose() {
    // A queued close event must not reset a newer definition already opened.
    if (vocabularyDetail.open) return;
    vocabularyActive = null;
    vocabularyModalSource = null;
    highlightVocabularyTerm();
    if (vocabularyReturnFocus?.isConnected) vocabularyReturnFocus.focus({preventScroll: true});
    vocabularyReturnFocus = null;
  }
  vocabularyDetail.addEventListener('close', finishVocabularyClose);
  document.querySelector('#vocabulary-close').addEventListener('click', closeVocabularyDefinition);
  // Native dialog supplies Escape and an inert background; keep Tab inside the ficha.
  vocabularyDetail.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...vocabularyDetail.querySelectorAll('button:not(:disabled)')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !controls.includes(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
  function vocabularyWordButton(term, category, source) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vocabulary-word';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'vocabulary-detail');
    button.setAttribute('aria-pressed', 'false');
    const title = document.createElement('strong');
    title.textContent = term.title;
    const label = document.createElement('span');
    label.className = 'vocabulary-category';
    label.textContent = vocabularyCategories[category];
    const action = document.createElement('span');
    action.className = 'vocabulary-word-action';
    action.textContent = 'Ver significado ↗';
    button.append(title, label, action);
    button.addEventListener('click', () => openVocabularyDefinition(term, category, button, source));
    vocabularyWordButtons.push({button, term});
    return button;
  }
  vocabularyTerms.forEach(term => {
    const searchText = normalizeVocabulary([term.title, term.fullName, term.definition, term.purpose, term.example, term.related, ...term.categories.map(key => vocabularyCategories[key])].join(' '));
    const button = vocabularyWordButton(term, term.categories[0], 'search');
    button.hidden = true;
    vocabularyResults.append(button);
    vocabularyEntries.set(term.id, {term, button, searchText});
  });
  Object.entries(vocabularyCategories).forEach(([key, name]) => {
    const details = document.createElement('details');
    details.className = 'vocabulary-category-card';
    details.id = 'vocabulary-category-' + key;
    details.setAttribute('name', 'vocabulary-category');
    const summary = document.createElement('summary');
    const icon = document.createElement('span');
    icon.className = 'vocabulary-category-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = vocabularyMeta[key][0];
    const title = document.createElement('strong');
    title.textContent = name;
    const description = document.createElement('span');
    description.className = 'vocabulary-category-description';
    description.textContent = vocabularyMeta[key][1];
    const terms = vocabularyCategoryTerms(key);
    const count = document.createElement('span');
    count.className = 'vocabulary-category-count';
    count.textContent = terms.length + ' conceptos';
    const action = document.createElement('span');
    action.className = 'vocabulary-category-action';
    action.setAttribute('aria-hidden', 'true');
    const expanded = document.createElement('span');
    expanded.className = 'vocabulary-category-expanded';
    expanded.textContent = 'Cerrar ▲';
    const collapsed = document.createElement('span');
    collapsed.className = 'vocabulary-category-collapsed';
    collapsed.textContent = 'Explorar ▼';
    action.append(collapsed, expanded);
    summary.append(icon, title, description, count, action);
    const words = document.createElement('div');
    words.className = 'vocabulary-category-words vocabulary-words';
    const buttons = new Map();
    terms.forEach(term => {
      const button = vocabularyWordButton(term, key, 'category');
      words.append(button);
      buttons.set(term.id, button);
    });
    details.append(summary, words);
    // Also enforce exclusivity in browsers without grouped-details support.
    details.addEventListener('toggle', () => {
      if (details.open) vocabularyGroups.forEach(group => {
        if (group.details !== details) group.details.open = false;
      });
    });
    vocabularyGroups.set(key, {details, summary, buttons});
    document.querySelector('#vocabulary-category-grid').append(details);
  });
  function clearVocabularyResults() {
    document.querySelector('#vocabulary-search-results').hidden = true;
    document.querySelector('#vocabulary-empty').hidden = true;
    vocabularyEntries.forEach(({button}) => { button.hidden = true; });
    document.querySelector('#vocabulary-count').textContent = vocabularyTerms.length + ' conceptos disponibles';
  }
  function resetVocabulary(focusSearch = true) {
    closeVocabularyDefinition();
    vocabularySearch.value = '';
    clearVocabularyResults();
    vocabularyGroups.forEach(({details}) => { details.open = false; });
    if (focusSearch) vocabularySearch.focus();
  }
  function searchVocabulary() {
    // Search is entirely local: no form, submit, URL change or general navigation.
    const query = vocabularySearch.value.trim();
    if (!query) { resetVocabulary(); return; }
    closeVocabularyDefinition();
    const words = normalizeVocabulary(query).split(' ').filter(Boolean);
    const found = [];
    vocabularyEntries.forEach(entry => {
      const matches = word => word.length <= 3
        ? entry.searchText.split(/[^\p{L}\p{N}]+/u).some(part => part.startsWith(word))
        : entry.searchText.includes(word);
      const visible = words.every(matches);
      entry.button.hidden = !visible;
      if (visible) found.push(entry.term);
    });
    document.querySelector('#vocabulary-search-results').hidden = false;
    document.querySelector('#vocabulary-empty').hidden = found.length !== 0;
    document.querySelector('#vocabulary-empty-query').textContent = 'No encontramos ‘' + query + '’.';
    document.querySelector('#vocabulary-count').textContent = found.length + (found.length === 1 ? ' resultado encontrado' : ' resultados encontrados');
    const exact = found.find(term => normalizeVocabulary(term.title) === normalizeVocabulary(query) || term.id === normalizeVocabulary(query));
    if (exact) {
      openVocabularyDefinition(exact, exact.categories[0], vocabularyEntries.get(exact.id).button, 'search');
    } else {
      document.querySelector('#vocabulary-results-title').focus();
    }
  }
  document.querySelector('#vocabulary-submit').addEventListener('click', searchVocabulary);
  vocabularySearch.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      searchVocabulary();
    }
  });
  document.querySelector('#vocabulary-clear').addEventListener('click', () => resetVocabulary());
  [['#vocabulary-previous', -1], ['#vocabulary-next', 1]].forEach(([selector, offset]) => {
    document.querySelector(selector).addEventListener('click', () => {
      if (!vocabularyActive) return;
      const terms = vocabularyCategoryTerms(vocabularyCategory);
      const next = terms[terms.indexOf(vocabularyActive) + offset];
      if (next) openVocabularyDefinition(next, vocabularyCategory, vocabularyReturnFocus, vocabularyModalSource);
    });
  });
  function applyVocabularyHash() {
    const match = /^#vocabulary(?:\/(.*))?$/.exec(window.location.hash);
    if (!match) return;
    let requested = '';
    try { requested = decodeURIComponent(match[1] || '').trim(); } catch (error) { return; }
    // Preserve the opening sequence. Apply the direct link after the landing button.
    if (learningApp.classList.contains('hidden')) { vocabularyPendingHash = true; return; }
    vocabularyPendingHash = false;
    showView('vocabulary');
    resetVocabulary(false);
    if (!requested) return;
    const exact = vocabularyTerms.find(term => term.id === requested || normalizeVocabulary(term.title) === normalizeVocabulary(requested));
    if (exact) openVocabularyDefinition(exact, exact.categories[0], null, 'hash');
    else {
      vocabularySearch.value = requested;
      searchVocabulary();
    }
  }
  document.querySelector('#open-vocabulary').addEventListener('click', () => resetVocabulary(false));
  document.querySelector('#start-learning').addEventListener('click', () => {
    if (vocabularyPendingHash || /^#vocabulary(?:\/|$)/.test(window.location.hash)) applyVocabularyHash();
  });
  window.addEventListener('hashchange', applyVocabularyHash);
  clearVocabularyResults();
  applyVocabularyHash();


  // Laboratorio de apoyo. La práctica de código mantiene estado propio, sin progreso de módulos.
  // Futuras prácticas de datos/API pueden añadirse como secciones hermanas de lab-code-practice.
  const labChallenges = [...document.querySelectorAll('#practice-lab [data-lab-challenge]')];
  const labStepButtons = [...document.querySelectorAll('#practice-lab [data-lab-step]')];
  const labCheckButtons = [...document.querySelectorAll('#practice-lab [data-lab-check]')];
  const labAnswers = Array(5).fill(null);
  const labOrder = document.querySelector('#lab-layer-order');
  const labInitialLayers = [...labOrder.children];
  const labEditor = document.querySelector('#lab-dto-code');
  const labInitialCode = labEditor.value;
  const labAnnotationAnswer = document.querySelector('#lab-annotation-answer');
  let labStep = 0;

  function updateLabNavigation() {
    labStepButtons.forEach((button, index) => {
      button.setAttribute('aria-current', index === labStep ? 'step' : 'false');
      button.querySelector('.lab-step-state').textContent = labAnswers[index] === null ? 'Sin comprobar' : labAnswers[index] ? 'Correcto ✓' : 'Para repasar';
    });
    document.querySelector('#lab-previous').disabled = labStep === 0;
    const last = labStep === labChallenges.length - 1;
    const allChecked = labAnswers.every(answer => answer !== null);
    document.querySelector('#lab-next').textContent = last ? 'Ver resultado final' : 'Siguiente desafío →';
    document.querySelector('#lab-next').disabled = last ? !allChecked : labAnswers[labStep] === null;
    document.querySelector('#lab-next-hint').textContent = last
      ? (allChecked ? 'Puedes ver tu resultado o revisar cualquier desafío.' : 'Comprueba los cinco desafíos para ver el resultado.')
      : (labAnswers[labStep] === null ? 'Comprueba tu respuesta para continuar.' : 'Lee la explicación y compara con la solución antes de seguir.');
  }
  function showLabStep(index, focus = true) {
    labStep = index;
    document.querySelector('#lab-result').hidden = true;
    document.querySelector('#lab-code-practice').hidden = false;
    labChallenges.forEach((challenge, i) => { challenge.hidden = i !== index; });
    document.querySelector('#lab-position').textContent = 'Desafío ' + (index + 1) + ' de ' + labChallenges.length;
    updateLabNavigation();
    if (focus) document.querySelector('#lab-title-' + (index + 1)).focus();
  }
  function invalidateLabAnswer(index) {
    labAnswers[index] = null;
    const feedback = document.querySelector('#lab-feedback-' + (index + 1));
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.classList.remove('is-correct', 'is-wrong');
    const solution = labChallenges[index].querySelector('.lab-solution');
    solution.hidden = true;
    solution.open = false;
    updateLabNavigation();
  }
  function showLabFeedback(index, correct, message) {
    labAnswers[index] = correct;
    const feedback = document.querySelector('#lab-feedback-' + (index + 1));
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.toggle('is-correct', correct);
    feedback.classList.toggle('is-wrong', !correct);
    labChallenges[index].querySelector('.lab-solution').hidden = false;
    updateLabNavigation();
  }
  function updateLabLayerButtons() {
    [...labOrder.children].forEach((row, index, rows) => {
      row.querySelector('[data-lab-move="-1"]').disabled = index === 0;
      row.querySelector('[data-lab-move="1"]').disabled = index === rows.length - 1;
    });
  }
  labOrder.querySelectorAll('[data-lab-move]').forEach(button => button.addEventListener('click', () => {
    const row = button.closest('[data-lab-layer]');
    const rows = [...labOrder.children];
    const index = rows.indexOf(row);
    const offset = Number(button.dataset.labMove);
    const destination = rows[index + offset];
    if (!destination) return;
    if (offset < 0) labOrder.insertBefore(row, destination);
    else labOrder.insertBefore(destination, row);
    invalidateLabAnswer(1);
    updateLabLayerButtons();
    document.querySelector('#lab-order-announcement').textContent = row.dataset.labLayer + ' está en la posición ' + ([...labOrder.children].indexOf(row) + 1) + ' de 4.';
    (button.disabled ? row.querySelector('button:not(:disabled)') : button).focus();
  }));
  labChallenges.forEach((challenge, index) => {
    challenge.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', () => {
      invalidateLabAnswer(index);
      labCheckButtons[index].disabled = false;
    }));
  });
  labEditor.addEventListener('input', () => invalidateLabAnswer(2));
  labAnnotationAnswer.addEventListener('input', () => {
    invalidateLabAnswer(0);
    labCheckButtons[0].disabled = !labAnnotationAnswer.value.trim();
  });

  // Reconoce anotaciones junto a su campo. No interpreta, compila ni ejecuta Java.
  function inspectLabDto(code) {
    const clean = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/"(?:\\.|[^"\\])*"/g, '""');
    const record = /\bpublic\s+record\s+PrestamoRequest\s*\(([\s\S]*?)\)\s*\{\s*\}/.exec(clean);
    const fields = record ? record[1].split(',') : [];
    const checks = [
      { label: '@NotBlank en nombreAlumno', field: /\bString\s+nombreAlumno\s*$/, annotation: /@NotBlank\b/ },
      { label: '@Email en correoAlumno', field: /\bString\s+correoAlumno\s*$/, annotation: /@Email\b/ },
      { label: '@Min(1) en recursoId', field: /\bLong\s+recursoId\s*$/, annotation: /@Min\s*\(\s*1\s*\)/ }
    ];
    return checks.map(check => ({
      label: check.label,
      correct: fields.some(field => check.field.test(field.trim()) && check.annotation.test(field))
    }));
  }
  labCheckButtons.forEach((button, index) => button.addEventListener('click', () => {
    if (index === 0) {
      const answer = labAnnotationAnswer.value.trim();
      if (!answer) return;
      const messages = {
        '@RestController': '✓ Correcto. @RestController indica que esta clase recibe peticiones HTTP y devuelve respuestas, normalmente en formato JSON.',
        '@Entity': '@Entity se utiliza para representar datos que pueden persistirse en la base de datos. No convierte una clase en controlador.',
        '@Repository': '@Repository pertenece a la capa de acceso a datos. No recibe directamente las peticiones HTTP.'
      };
      const message = Object.hasOwn(messages, answer) ? messages[answer] : 'Revisa las opciones de apoyo e inténtalo nuevamente.';
      showLabFeedback(0, answer === '@RestController', message);
    } else if (index === 1) {
      const actual = [...labOrder.children].map(row => row.dataset.labLayer);
      const correct = actual.join('|') === 'Controller|Service|Repository|H2';
      showLabFeedback(1, correct, (correct ? 'Correcto. ' : 'Revisa el orden. ') + 'El Controller recibe la petición, el Service aplica las reglas, el Repository accede a los datos y H2 los almacena. Para registrar un préstamo, cada capa delega en la siguiente sin mezclar responsabilidades.');
    } else if (index === 2) {
      const checks = inspectLabDto(labEditor.value);
      const correct = checks.every(check => check.correct);
      const missing = checks.filter(check => !check.correct).map(check => check.label);
      showLabFeedback(2, correct, correct
        ? 'Correcto. Ubicaste las tres anotaciones en sus campos. @NotBlank exige un nombre con contenido, @Email comprueba el formato del correo y @Min(1) limita el identificador a un valor positivo. Un DTO define los datos de entrada del préstamo; con @Valid se aplican sus restricciones al recibirlo.'
        : 'Revisa tu DTO. Falta o no coincide: ' + missing.join('; ') + '. Conserva public record PrestamoRequest con los tres campos de la plantilla. Las anotaciones deben ir junto al campo que validan. Puedes comparar con la solución; esta revisión de texto no garantiza que el código compile.');
    } else if (index === 3) {
      const answer = labChallenges[3].querySelector('input:checked')?.value;
      if (!answer) return;
      const messages = {
        post: 'Correcto. POST se utiliza normalmente cuando queremos crear un nuevo recurso. @PostMapping dirige POST /api/prestamos a este método del Controller; una creación exitosa responde 201 Created.',
        get: 'Todavía no. @GetMapping atiende consultas GET, como leer préstamos, y no expresa la creación solicitada. Para crear el préstamo usamos POST /api/prestamos y respondemos 201 Created.',
        delete: 'Todavía no. @DeleteMapping atiende operaciones DELETE para eliminar recursos, no para crearlos. El registro de un préstamo corresponde a @PostMapping.'
      };
      showLabFeedback(3, answer === 'post', messages[answer]);
    } else {
      const answer = labChallenges[4].querySelector('input:checked')?.value;
      if (!answer) return;
      const messages = {
        exposure: 'Correcto. Devolver directamente una Entity puede exponer información interna como password si se serializa ese campo. Una alternativa es utilizar un DTO: controlamos exactamente los datos del alumno que devolvemos con el préstamo.',
        h2: 'Todavía no. Devolver una Entity no hace que H2 deje de funcionar. El riesgo está en la respuesta HTTP: puede incluir campos internos como password. Un DTO limita qué datos se exponen.',
        maven: 'Todavía no. Maven no elimina una Entity por devolverla desde el Controller. El problema es exponer datos internos al usuario; AlumnoResponse puede devolver id, nombre y correo sin password.'
      };
      showLabFeedback(4, answer === 'exposure', messages[answer]);
    }
  }));
  function showLabResult() {
    if (labAnswers.some(answer => answer === null)) return;
    const score = labAnswers.filter(Boolean).length;
    document.querySelector('#lab-code-practice').hidden = true;
    document.querySelector('#lab-result').hidden = false;
    document.querySelector('#lab-result-score').textContent = score + ' / 5 desafíos correctos';
    document.querySelector('#lab-result-message').textContent = score === 5
      ? 'Muy bien. Comprendiste los conceptos principales.'
      : score >= 3 ? 'Buen resultado. Puedes revisar los desafíos donde tuviste dudas.'
        : 'Conviene repasar algunos conceptos y volver a intentarlo.';
    document.querySelector('#lab-result-title').focus();
  }
  labStepButtons.forEach(button => button.addEventListener('click', () => showLabStep(Number(button.dataset.labStep))));
  document.querySelector('#lab-previous').addEventListener('click', () => {
    if (labStep > 0) showLabStep(labStep - 1);
  });
  document.querySelector('#lab-next').addEventListener('click', () => {
    if (labStep === 4) showLabResult();
    else if (labAnswers[labStep] !== null) showLabStep(labStep + 1);
  });
  document.querySelector('#lab-review').addEventListener('click', () => {
    const firstIncorrect = labAnswers.findIndex(answer => answer === false);
    showLabStep(firstIncorrect < 0 ? 0 : firstIncorrect);
  });
  document.querySelector('#lab-repeat').addEventListener('click', () => {
    labAnswers.fill(null);
    labAnnotationAnswer.value = '';
    document.querySelectorAll('#practice-lab input[type="radio"]').forEach(input => { input.checked = false; });
    labEditor.value = labInitialCode;
    labOrder.append(...labInitialLayers);
    labChallenges.forEach((challenge, index) => invalidateLabAnswer(index));
    labCheckButtons.forEach((button, index) => { button.disabled = [0, 3, 4].includes(index); });
    document.querySelector('#lab-order-announcement').textContent = 'Ordena las cuatro capas antes de comprobar.';
    updateLabLayerButtons();
    showLabStep(0);
  });
  updateLabLayerButtons();
  showLabStep(0, false);



  // Datos en H2: navegación de apoyo y consultas de lectura; estado separado de los desafíos.
  const labAreaButtons = [...document.querySelectorAll('#practice-lab [data-lab-area]')];
  labAreaButtons.forEach(button => button.addEventListener('click', () => {
    const data = button.dataset.labArea === 'data';
    document.querySelector('#lab-code-area').hidden = data;
    document.querySelector('#lab-data-area').hidden = !data;
    labAreaButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    if (data) document.querySelector('#lab-data-title').focus();
    else document.querySelector('#practice-lab-title').focus();
  }));
  const labDataSteps = [
    {
      title: 'Request / DTO · PrestamoRequest',
      explanation: 'Contiene los datos que llegan desde el formulario o la API: nombreAlumno, correoAlumno y recursoId. En el proyecto, PrestamoRequest declara restricciones y el Controller usa @Valid para comprobarlas.',
      code: 'PrestamoRequest\n  nombreAlumno: String\n  correoAlumno: String\n  recursoId: Long'
    },
    {
      title: 'Controller · PrestamoController',
      explanation: 'Recibe POST /api/prestamos, transforma el JSON en PrestamoRequest y lo envía al Service. Una creación exitosa devuelve 201 Created con un PrestamoResponse. Este recorrido solo explica ese código: no envía un POST.',
      code: '@PostMapping\npublic ResponseEntity<PrestamoResponse> registrar(\n    @Valid @RequestBody PrestamoRequest request) {\n    return ResponseEntity.status(HttpStatus.CREATED)\n        .body(prestamoService.registrar(request));\n}'
    },
    {
      title: 'Service · PrestamoService',
      explanation: 'Aplica las reglas del negocio: busca el Recurso por ID, comprueba que esté disponible, lo marca como no disponible y construye un Prestamo. El método registrar es @Transactional: las operaciones forman una transacción.',
      code: 'Recurso recurso = recursoRepository.findById(request.recursoId())\n    .orElseThrow(() -> new RecursoNoEncontradoException(request.recursoId()));\nif (!recurso.isDisponible()) {\n    throw new RecursoNoDisponibleException(recurso.getNombre());\n}\nrecurso.setDisponible(false);\nPrestamo prestamo = new Prestamo(\n    request.nombreAlumno(), request.correoAlumno(), recurso);'
    },
    {
      title: 'Repository · PrestamoRepository',
      explanation: 'Solicita guardar o consultar información. PrestamoRepository extiende JpaRepository<Prestamo, Long>; Spring Data JPA proporciona operaciones como save y findAll sin escribir su implementación a mano.',
      code: 'public interface PrestamoRepository\n    extends JpaRepository<Prestamo, Long> {\n}\n\n// En PrestamoService.registrar:\nPrestamo guardado = prestamoRepository.save(prestamo);'
    },
    {
      title: 'JPA / Hibernate · Entity Prestamo',
      explanation: 'JPA describe el mapeo y Hibernate lo implementa: relaciona Prestamo con PRESTAMO, los atributos con columnas y recurso con RECURSO_ID. Gestiona el SQL y la sincronización de los cambios dentro de la transacción.',
      code: '@Entity\npublic class Prestamo {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    // Otros atributos: nombreAlumno, correoAlumno, fechaPrestamo, estado\n    @ManyToOne(fetch = FetchType.EAGER, optional = false)\n    private Recurso recurso;\n}'
    },
    {
      title: 'H2 · tabla PRESTAMO',
      explanation: 'Almacena finalmente la información. Con la configuración actual H2 usa un archivo: los préstamos quedan en PRESTAMO y su recurso se relaciona mediante RECURSO_ID. ID identifica cada fila. Los cambios se confirman al completar la transacción; puedes consultar los registros reales debajo.',
      code: 'PRESTAMO\n  ID · clave primaria\n  NOMBRE_ALUMNO · CORREO_ALUMNO\n  FECHA_PRESTAMO · ESTADO\n  RECURSO_ID → RECURSO.ID\n\n// Este panel no inserta ni actualiza registros.'
    }
  ];
  const labDataStepButtons = [...document.querySelectorAll('#practice-lab [data-lab-data-step]')];
  let labDataStep = -1;
  let labDataReached = -1;
  function showLabDataStep(index) {
    labDataStep = index;
    labDataReached = Math.max(labDataReached, index);
    const step = labDataSteps[index];
    document.querySelector('#lab-data-step-count').textContent = 'Etapa ' + (index + 1) + ' de ' + labDataSteps.length;
    document.querySelector('#lab-data-step-title').textContent = step.title;
    document.querySelector('#lab-data-step-explanation').textContent = step.explanation;
    document.querySelector('#lab-data-step-code').textContent = step.code;
    labDataStepButtons.forEach((button, i) => {
      button.disabled = i > labDataReached;
      button.setAttribute('aria-pressed', String(i === index));
      button.classList.toggle('is-visited', i <= labDataReached);
    });
    document.querySelector('#lab-follow-data').textContent = index === labDataSteps.length - 1 ? 'Repetir recorrido' : 'Siguiente etapa →';
  }
  document.querySelector('#lab-follow-data').addEventListener('click', () => {
    if (labDataStep === labDataSteps.length - 1) {
      labDataReached = -1;
      showLabDataStep(0);
    } else showLabDataStep(labDataStep + 1);
  });
  labDataStepButtons.forEach(button => button.addEventListener('click', () => showLabDataStep(Number(button.dataset.labDataStep))));

  const labDataColumns = ['id', 'nombreAlumno', 'correoAlumno', 'recursoId', 'recurso', 'tipoRecurso', 'estado', 'fechaPrestamo'];
  let labDataLoading = false;
  async function loadLabStoredData() {
    if (labDataLoading) return;
    labDataLoading = true;
    const load = document.querySelector('#lab-load-data');
    const refresh = document.querySelector('#lab-refresh-data');
    const status = document.querySelector('#lab-data-status');
    const table = document.querySelector('#lab-data-table-region');
    const empty = document.querySelector('#lab-data-empty');
    const technical = document.querySelector('#lab-data-error');
    load.disabled = true;
    refresh.hidden = false;
    refresh.disabled = true;
    status.textContent = 'Cargando datos…';
    status.classList.remove('is-success', 'is-error');
    table.hidden = true;
    empty.hidden = true;
    technical.hidden = true;
    technical.open = false;
    table.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/prestamos', {
        method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal
      });
      if (!response.ok) throw new Error('GET /api/prestamos respondió HTTP ' + response.status + '.');
      const data = await response.json();
      if (!Array.isArray(data) || !data.every(row => row && typeof row === 'object' && labDataColumns.every(key =>
        Object.hasOwn(row, key) && (row[key] === null || ['string', 'number'].includes(typeof row[key]))))) {
        throw new Error('La respuesta no coincide con la lista de PrestamoResponse esperada.');
      }
      const rows = document.querySelector('#lab-data-rows');
      rows.replaceChildren();
      data.forEach(item => {
        const row = document.createElement('tr');
        labDataColumns.forEach(key => {
          const cell = document.createElement('td');
          cell.textContent = item[key] === null ? 'Sin dato' : String(item[key]);
          row.append(cell);
        });
        rows.append(row);
      });
      empty.hidden = data.length !== 0;
      table.hidden = data.length === 0;
      status.textContent = data.length
        ? 'Datos obtenidos correctamente. ' + data.length + (data.length === 1 ? ' préstamo consultado.' : ' préstamos consultados.')
        : 'No hay registros.';
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = 'No fue posible consultar los datos. Puedes intentarlo nuevamente con “Actualizar datos”. No se ha solicitado crear ni modificar registros.';
      status.classList.add('is-error');
      technical.hidden = false;
      document.querySelector('#lab-data-error-text').textContent = error.name === 'AbortError'
        ? 'La consulta GET /api/prestamos superó el tiempo de espera.'
        : error.message;
    } finally {
      window.clearTimeout(timeout);
      table.setAttribute('aria-busy', 'false');
      labDataLoading = false;
      load.disabled = false;
      refresh.disabled = false;
    }
  }
  document.querySelector('#lab-load-data').addEventListener('click', loadLabStoredData);
  document.querySelector('#lab-refresh-data').addEventListener('click', loadLabStoredData);


  updateProgress();
})();

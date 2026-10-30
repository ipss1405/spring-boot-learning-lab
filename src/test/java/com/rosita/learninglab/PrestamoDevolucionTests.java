package com.rosita.learninglab;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.rosita.learninglab.dto.PrestamoRequest;
import com.rosita.learninglab.entity.Recurso;
import com.rosita.learninglab.repository.RecursoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:devolucion-tests;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class PrestamoDevolucionTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired RecursoRepository recursos;
    @Autowired JdbcTemplate jdbc;

    private Long nuevoRecurso() {
        return recursos.save(new Recurso("Recurso de prueba de devolución", "LIBRO")).getId();
    }

    private JsonNode registrar(Long recursoId) throws Exception {
        String body = mapper.writeValueAsString(new PrestamoRequest(
                "Prueba devolución", "devolucion@example.test", recursoId));
        return mapper.readTree(mvc.perform(post("/api/prestamos")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }

    @Test
    void devuelveSinBorrarNiCambiarLosDatosOriginales() throws Exception {
        Long recursoId = nuevoRecurso();
        JsonNode original = registrar(recursoId);
        long id = original.get("id").asLong();
        LocalDateTime fechaGuardada = jdbc.queryForObject(
                "SELECT FECHA_PRESTAMO FROM PRESTAMO WHERE ID = ?", LocalDateTime.class, id);
        assertThat(recursos.findById(recursoId).orElseThrow().isDisponible()).isFalse();

        JsonNode devuelto = mapper.readTree(mvc.perform(patch("/api/prestamos/{id}/devolucion", id))
                .andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("DEVUELTO"))
                .andReturn().getResponse().getContentAsString());

        ObjectNode datosOriginales = original.deepCopy();
        ObjectNode datosDevueltos = devuelto.deepCopy();
        datosOriginales.remove("estado");
        datosDevueltos.remove("estado");
        // H2 almacena microsegundos; el POST puede devolver nanosegundos antes de leer la fila.
        datosOriginales.remove("fechaPrestamo");
        datosDevueltos.remove("fechaPrestamo");
        assertThat(datosDevueltos).isEqualTo(datosOriginales);
        assertThat(jdbc.queryForObject("SELECT FECHA_PRESTAMO FROM PRESTAMO WHERE ID = ?", LocalDateTime.class, id))
                .isEqualTo(fechaGuardada);
        assertThat(LocalDateTime.parse(devuelto.get("fechaPrestamo").asText())).isEqualTo(fechaGuardada);
        assertThat(jdbc.queryForObject("SELECT ESTADO FROM PRESTAMO WHERE ID = ?", String.class, id))
                .isEqualTo("DEVUELTO");
        assertThat(jdbc.queryForObject("SELECT DISPONIBLE FROM RECURSO WHERE ID = ?", Boolean.class, recursoId))
                .isTrue();
    }

    @Test
    void repetirUnaDevolucionNoLiberaElRecursoPrestadoNuevamente() throws Exception {
        Long recursoId = nuevoRecurso();
        long anterior = registrar(recursoId).get("id").asLong();
        mvc.perform(patch("/api/prestamos/{id}/devolucion", anterior)).andExpect(status().isOk());
        long nuevo = registrar(recursoId).get("id").asLong();

        mvc.perform(patch("/api/prestamos/{id}/devolucion", anterior))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.status").value(409));
        assertThat(jdbc.queryForObject("SELECT DISPONIBLE FROM RECURSO WHERE ID = ?", Boolean.class, recursoId))
                .isFalse();
        assertThat(jdbc.queryForObject("SELECT ESTADO FROM PRESTAMO WHERE ID = ?", String.class, nuevo))
                .isEqualTo("ACTIVO");
        assertThat(jdbc.queryForObject("SELECT ESTADO FROM PRESTAMO WHERE ID = ?", String.class, anterior))
                .isEqualTo("DEVUELTO");
    }

    @Test
    void rechazaIdsInvalidosYPrestamosInexistentes() throws Exception {
        for (String id : List.of("0", "-1", "abc", "99999999999999999999999999")) {
            mvc.perform(patch("/api/prestamos/{id}/devolucion", id))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        }
        mvc.perform(patch("/api/prestamos/{id}/devolucion", Long.MAX_VALUE))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void conservaValidacionesYReglaDeDisponibilidadDelRegistro() throws Exception {
        mvc.perform(post("/api/prestamos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombreAlumno\":\"\",\"correoAlumno\":\"incorrecto\",\"recursoId\":null}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.nombreAlumno").exists());
        Long recursoId = nuevoRecurso();
        registrar(recursoId);
        mvc.perform(post("/api/prestamos").contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(new PrestamoRequest(
                                "Otra prueba", "otra@example.test", recursoId))))
                .andExpect(status().isConflict());
    }

    @Test
    void dosDevolucionesSimultaneasSoloAceptanUnaTransicion() throws Exception {
        long id = registrar(nuevoRecurso()).get("id").asLong();
        CountDownLatch inicio = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var primera = executor.submit(() -> {
                inicio.await();
                return mvc.perform(patch("/api/prestamos/{id}/devolucion", id))
                        .andReturn().getResponse().getStatus();
            });
            var segunda = executor.submit(() -> {
                inicio.await();
                return mvc.perform(patch("/api/prestamos/{id}/devolucion", id))
                        .andReturn().getResponse().getStatus();
            });
            inicio.countDown();
            assertThat(List.of(primera.get(), segunda.get())).containsExactlyInAnyOrder(200, 409);
        }
    }
}

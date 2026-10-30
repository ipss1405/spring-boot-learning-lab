package com.rosita.learninglab.config;

import com.rosita.learninglab.entity.Recurso;
import com.rosita.learninglab.repository.RecursoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatosInicialesConfig {

    @Bean
    CommandLineRunner cargarRecursos(RecursoRepository recursoRepository) {
        return args -> {
            if (recursoRepository.count() == 0) {
                recursoRepository.save(new Recurso("Notebook Lenovo ThinkPad", "EQUIPO"));
                recursoRepository.save(new Recurso("Libro Java 21", "LIBRO"));
                recursoRepository.save(new Recurso("Tablet Samsung", "EQUIPO"));
                recursoRepository.save(new Recurso("Libro Spring Boot", "LIBRO"));
            }
        };
    }
}

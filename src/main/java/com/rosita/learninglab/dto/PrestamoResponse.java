package com.rosita.learninglab.dto;

import com.rosita.learninglab.entity.Prestamo;

import java.time.LocalDateTime;

public record PrestamoResponse(
        Long id,
        String nombreAlumno,
        String correoAlumno,
        Long recursoId,
        String recurso,
        String tipoRecurso,
        String estado,
        LocalDateTime fechaPrestamo
) {
    public static PrestamoResponse fromEntity(Prestamo prestamo) {
        return new PrestamoResponse(
                prestamo.getId(),
                prestamo.getNombreAlumno(),
                prestamo.getCorreoAlumno(),
                prestamo.getRecurso().getId(),
                prestamo.getRecurso().getNombre(),
                prestamo.getRecurso().getTipo(),
                prestamo.getEstado(),
                prestamo.getFechaPrestamo()
        );
    }
}

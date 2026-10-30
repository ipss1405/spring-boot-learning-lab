package com.rosita.learninglab.dto;

import com.rosita.learninglab.entity.Recurso;

public record RecursoResponse(
        Long id,
        String nombre,
        String tipo,
        boolean disponible
) {
    public static RecursoResponse fromEntity(Recurso recurso) {
        return new RecursoResponse(
                recurso.getId(), recurso.getNombre(), recurso.getTipo(), recurso.isDisponible());
    }
}

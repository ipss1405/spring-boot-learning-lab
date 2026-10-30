package com.rosita.learninglab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PrestamoRequest(
        @NotBlank(message = "El nombre del alumno es obligatorio")
        @Size(min = 3, max = 80, message = "El nombre debe tener entre 3 y 80 caracteres")
        String nombreAlumno,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo debe tener un formato válido")
        String correoAlumno,

        @NotNull(message = "Debes seleccionar un recurso")
        Long recursoId
) {
}

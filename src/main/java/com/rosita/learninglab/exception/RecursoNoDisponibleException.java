package com.rosita.learninglab.exception;

public class RecursoNoDisponibleException extends RuntimeException {
    public RecursoNoDisponibleException(String nombre) {
        super("El recurso '" + nombre + "' no está disponible para préstamo");
    }
}

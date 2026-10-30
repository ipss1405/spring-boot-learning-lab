package com.rosita.learninglab.exception;

public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(Long id) {
        super("No se encontró el recurso con id " + id);
    }
}

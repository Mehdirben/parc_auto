package com.parcautomobile.shared;

import java.util.List;

import org.springframework.data.domain.Page;

public record PageResponse<T>(
        List<T> contenu,
        int page,
        int taille,
        long totalElements,
        int totalPages,
        boolean premiere,
        boolean derniere) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
}

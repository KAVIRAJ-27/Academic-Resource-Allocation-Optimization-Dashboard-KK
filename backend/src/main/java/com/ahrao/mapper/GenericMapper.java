package com.ahrao.mapper;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Generic mapper utility foundation for converting entities to DTOs.
 */
public final class GenericMapper {

    private GenericMapper() {
        // Prevent instantiation
    }

    public static <E, D> List<D> mapList(List<E> entities, Function<E, D> converter) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream().map(converter).collect(Collectors.toList());
    }
}

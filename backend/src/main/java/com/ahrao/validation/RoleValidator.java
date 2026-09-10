package com.ahrao.validation;

import com.ahrao.security.Role;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;

public class RoleValidator implements ConstraintValidator<ValidRole, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }
        return Arrays.stream(Role.values())
                .anyMatch(r -> r.name().equalsIgnoreCase(value.trim()));
    }
}

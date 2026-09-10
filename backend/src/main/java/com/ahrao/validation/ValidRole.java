package com.ahrao.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RoleValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRole {
    String message() default "Invalid system role specified. Allowed values: ADMIN, PRINCIPAL, HOD, FACULTY, STUDENT, WARDEN";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

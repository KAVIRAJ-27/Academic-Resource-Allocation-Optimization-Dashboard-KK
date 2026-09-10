package com.ahrao.util;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class DateUtil {

    private DateUtil() {
        // Prevent instantiation
    }

    private static final DateTimeFormatter ISO_FORMATTER =
            DateTimeFormatter.ISO_OFFSET_DATE_TIME.withZone(ZoneId.of("UTC"));

    public static String formatIsoUtc(Instant instant) {
        if (instant == null) return null;
        return ISO_FORMATTER.format(instant);
    }
}

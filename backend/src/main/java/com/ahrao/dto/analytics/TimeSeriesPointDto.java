package com.ahrao.dto.analytics;

public class TimeSeriesPointDto {

    private String label;
    private String date;
    private long count;
    private double value;

    public TimeSeriesPointDto() {
    }

    public TimeSeriesPointDto(String label, String date, long count, double value) {
        this.label = label;
        this.date = date;
        this.count = count;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}

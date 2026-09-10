package com.ahrao.dto.optimization;

public class ScoreBreakdownDto {
    private String factor;
    private double weight;
    private double rawScore;
    private double weightedScore;
    private String description;

    public ScoreBreakdownDto() {
    }

    public ScoreBreakdownDto(String factor, double weight, double rawScore, double weightedScore, String description) {
        this.factor = factor;
        this.weight = weight;
        this.rawScore = rawScore;
        this.weightedScore = weightedScore;
        this.description = description;
    }

    public String getFactor() {
        return factor;
    }

    public void setFactor(String factor) {
        this.factor = factor;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public double getRawScore() {
        return rawScore;
    }

    public void setRawScore(double rawScore) {
        this.rawScore = rawScore;
    }

    public double getWeightedScore() {
        return weightedScore;
    }

    public void setWeightedScore(double weightedScore) {
        this.weightedScore = weightedScore;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

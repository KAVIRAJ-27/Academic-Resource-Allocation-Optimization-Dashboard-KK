package com.ahrao.config.optimization;

import org.springframework.stereotype.Component;

@Component
public class AcademicOptimizationWeights {

    public static final double DEFAULT_RESOURCE_SUITABILITY = 30.0;
    public static final double DEFAULT_CAPACITY_EFFICIENCY = 25.0;
    public static final double DEFAULT_UTILIZATION_BENEFIT = 20.0;
    public static final double DEFAULT_PREFERENCE_MATCH = 15.0;
    public static final double DEFAULT_WORKLOAD_BALANCE = 10.0;

    private double resourceSuitabilityWeight = DEFAULT_RESOURCE_SUITABILITY;
    private double capacityEfficiencyWeight = DEFAULT_CAPACITY_EFFICIENCY;
    private double utilizationBenefitWeight = DEFAULT_UTILIZATION_BENEFIT;
    private double preferenceMatchWeight = DEFAULT_PREFERENCE_MATCH;
    private double workloadBalanceWeight = DEFAULT_WORKLOAD_BALANCE;

    public AcademicOptimizationWeights() {
    }

    public AcademicOptimizationWeights(double resourceSuitabilityWeight,
                                     double capacityEfficiencyWeight,
                                     double utilizationBenefitWeight,
                                     double preferenceMatchWeight,
                                     double workloadBalanceWeight) {
        this.resourceSuitabilityWeight = resourceSuitabilityWeight;
        this.capacityEfficiencyWeight = capacityEfficiencyWeight;
        this.utilizationBenefitWeight = utilizationBenefitWeight;
        this.preferenceMatchWeight = preferenceMatchWeight;
        this.workloadBalanceWeight = workloadBalanceWeight;
    }

    public double getResourceSuitabilityWeight() {
        return resourceSuitabilityWeight;
    }

    public void setResourceSuitabilityWeight(double resourceSuitabilityWeight) {
        this.resourceSuitabilityWeight = resourceSuitabilityWeight;
    }

    public double getCapacityEfficiencyWeight() {
        return capacityEfficiencyWeight;
    }

    public void setCapacityEfficiencyWeight(double capacityEfficiencyWeight) {
        this.capacityEfficiencyWeight = capacityEfficiencyWeight;
    }

    public double getUtilizationBenefitWeight() {
        return utilizationBenefitWeight;
    }

    public void setUtilizationBenefitWeight(double utilizationBenefitWeight) {
        this.utilizationBenefitWeight = utilizationBenefitWeight;
    }

    public double getPreferenceMatchWeight() {
        return preferenceMatchWeight;
    }

    public void setPreferenceMatchWeight(double preferenceMatchWeight) {
        this.preferenceMatchWeight = preferenceMatchWeight;
    }

    public double getWorkloadBalanceWeight() {
        return workloadBalanceWeight;
    }

    public void setWorkloadBalanceWeight(double workloadBalanceWeight) {
        this.workloadBalanceWeight = workloadBalanceWeight;
    }

    public double getTotalWeight() {
        return resourceSuitabilityWeight + capacityEfficiencyWeight + utilizationBenefitWeight + preferenceMatchWeight + workloadBalanceWeight;
    }
}

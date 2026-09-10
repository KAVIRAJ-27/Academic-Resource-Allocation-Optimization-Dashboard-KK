package com.ahrao.service.optimization;

import com.ahrao.dto.optimization.HostelOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.entity.user.User;

public interface HostelAllocationOptimizer {
    OptimizationResultDto optimizeHostelAllocation(HostelOptimizationRequestDto request, User actor);
}

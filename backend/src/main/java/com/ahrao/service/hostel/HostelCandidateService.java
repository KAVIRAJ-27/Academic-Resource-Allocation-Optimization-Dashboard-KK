package com.ahrao.service.hostel;

import com.ahrao.dto.hostel.allocation.HostelCandidateDto;
import com.ahrao.entity.hostel.HostelBed;

import java.util.List;
import java.util.Set;

public interface HostelCandidateService {

    List<HostelCandidateDto> evaluateCandidates(Long requestedHostelId, Set<Long> authorizedHostelIds);

    HostelBed selectBestCandidateBed(Long requestedHostelId, Set<Long> authorizedHostelIds);

    HostelCandidateDto mapToCandidateDto(HostelBed bed, boolean available, List<String> conflicts);
}

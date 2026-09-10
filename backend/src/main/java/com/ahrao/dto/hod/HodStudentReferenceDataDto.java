package com.ahrao.dto.hod;

import java.util.ArrayList;
import java.util.List;

public class HodStudentReferenceDataDto {

    private List<ProgramOption> programs = new ArrayList<>();
    private List<SectionOption> sections = new ArrayList<>();

    public static class ProgramOption {
        private Long id;
        private String code;
        private String name;
        private String degreeType;

        public ProgramOption() {}
        public ProgramOption(Long id, String code, String name, String degreeType) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.degreeType = degreeType;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDegreeType() { return degreeType; }
        public void setDegreeType(String degreeType) { this.degreeType = degreeType; }
    }

    public static class SectionOption {
        private Long id;
        private String name;
        private Long programId;
        private String programCode;

        public SectionOption() {}
        public SectionOption(Long id, String name, Long programId, String programCode) {
            this.id = id;
            this.name = name;
            this.programId = programId;
            this.programCode = programCode;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getProgramId() { return programId; }
        public void setProgramId(Long programId) { this.programId = programId; }
        public String getProgramCode() { return programCode; }
        public void setProgramCode(String programCode) { this.programCode = programCode; }
    }

    public HodStudentReferenceDataDto() {
    }

    public List<ProgramOption> getPrograms() {
        return programs;
    }

    public void setPrograms(List<ProgramOption> programs) {
        this.programs = programs;
    }

    public List<SectionOption> getSections() {
        return sections;
    }

    public void setSections(List<SectionOption> sections) {
        this.sections = sections;
    }
}

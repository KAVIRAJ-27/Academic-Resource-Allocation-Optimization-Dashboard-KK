$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "C:\maven\apache-maven-3.9.16\bin\mvn.cmd" clean compile -DskipTests
if ($LASTEXITCODE -eq 0) {
    & "C:\maven\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
}

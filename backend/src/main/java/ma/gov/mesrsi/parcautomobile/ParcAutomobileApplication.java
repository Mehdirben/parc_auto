package ma.gov.mesrsi.parcautomobile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider", modifyOnCreate = false)
public class ParcAutomobileApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParcAutomobileApplication.class, args);
    }
}

package com.parcautomobile.config;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/** Loads a small, relationally consistent dataset for local demos. */
@Component
@ConditionalOnProperty(name = "app.mock-data.enabled", havingValue = "true")
public class MockDataSeeder implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(MockDataSeeder.class);
    private final DataSource dataSource;

    public MockDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.setSeparator("@@");
        populator.addScript(new ClassPathResource("db/seed/mock-data.sql"));
        populator.execute(dataSource);
        LOGGER.info("Mock fleet data is ready.");
    }
}

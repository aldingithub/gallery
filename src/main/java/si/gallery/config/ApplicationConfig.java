package si..gallery.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
@Validated
public class ApplicationConfig {

    private String securityUsername;

    private String securityPass;

    private String securityRole;
}

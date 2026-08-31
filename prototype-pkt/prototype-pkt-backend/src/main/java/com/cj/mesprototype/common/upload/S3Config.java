package com.cj.mesprototype.common.upload;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(S3Properties.class)
public class S3Config {

    @Bean
    public S3Client s3Client(S3Properties props) {
        S3ClientBuilder builder = S3Client.builder().region(resolveRegion(props));
        if (props.hasStaticCredentials()) {
            builder.credentialsProvider(staticCredentials(props));
        }
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner(S3Properties props) {
        S3Presigner.Builder builder = S3Presigner.builder().region(resolveRegion(props));
        if (props.hasStaticCredentials()) {
            builder.credentialsProvider(staticCredentials(props));
        }
        return builder.build();
    }

    private Region resolveRegion(S3Properties props) {
        return Region.of(props.region() != null ? props.region() : "ap-northeast-2");
    }

    private StaticCredentialsProvider staticCredentials(S3Properties props) {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(props.accessKey(), props.secretKey())
        );
    }
}

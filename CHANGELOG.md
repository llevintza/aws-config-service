# 1.0.0 (2025-08-12)

### Bug Fixes

- add retry logic for yarn install in multiple jobs to improve dependency installation ([722bed5](https://github.com/llevintza/aws-config-service/commit/722bed562def50eb66d86574a32a4ba8ca6bcabd))
- fixing the release pipeline and formatting inconsistencies ([#18](https://github.com/llevintza/aws-config-service/issues/18)) ([493598c](https://github.com/llevintza/aws-config-service/commit/493598ca30fb8a1f8768ceac4d1f75bc5efce101))
- replace logical OR with nullish coalescing for environment variables in DynamoDB configuration ([b6f4706](https://github.com/llevintza/aws-config-service/commit/b6f4706451d1acc8d4137136030948d4a6e7d912))
- update GITHUB_TOKEN in semantic-release step for improved security ([#25](https://github.com/llevintza/aws-config-service/issues/25)) ([d75d9f5](https://github.com/llevintza/aws-config-service/commit/d75d9f5e210dde85d5d5181343a3ae5f9964a826))
- update permissions and enhance Node.js setup in release workflow ([#26](https://github.com/llevintza/aws-config-service/issues/26)) ([34cc3d7](https://github.com/llevintza/aws-config-service/commit/34cc3d749bda9f4aa160603002b65fc457ef6922))
- update release pipeline to use new secret tokens and adjust release command ([#24](https://github.com/llevintza/aws-config-service/issues/24)) ([b0d30fa](https://github.com/llevintza/aws-config-service/commit/b0d30fab50d2676758a3abf3b7f86bc26f4916e0))
- update token usage in release workflow for NPM publishing ([#27](https://github.com/llevintza/aws-config-service/issues/27)) ([3789a12](https://github.com/llevintza/aws-config-service/commit/3789a122dd0bef6d8408df6de12d779e7bf211f0))
- use coalescing ([b025305](https://github.com/llevintza/aws-config-service/commit/b025305a5de82d52d0141cce5e28fd19c5dea0cd))
- use queryCommnad ([85052f0](https://github.com/llevintza/aws-config-service/commit/85052f0d1d374e320e45ce43531bd8eed4354c5d))

### Features

- add EditorConfig, ESLint, Prettier configurations, and update package scripts ([6a365af](https://github.com/llevintza/aws-config-service/commit/6a365af924b0c2472a4382d7876f8ab6ff18e798))
- add husky pre-commit hooks with eslint and prettier ([3750e53](https://github.com/llevintza/aws-config-service/commit/3750e53c0262199c15c34d0a00ed1b1c4717cf62))
- add JSON schemas for config and health routes, refactor route schemas ([66fc3e7](https://github.com/llevintza/aws-config-service/commit/66fc3e71bf1dbfdd37f3b6b7aef0ceb4309a011b))
- add VS Code configuration files and update README with debugging instructions ([441f323](https://github.com/llevintza/aws-config-service/commit/441f323d84a88d1eaac209a6fab48b72d1302d26))
- **dynamodb:** add scripts for creating and migrating DynamoDB tables ([e3a1ea9](https://github.com/llevintza/aws-config-service/commit/e3a1ea9fff9cc99d86f4f60d3a530753a2b29bc6))
- implement design patterns architecture with factory, strategy and DI ([09bb74e](https://github.com/llevintza/aws-config-service/commit/09bb74e802e86239d0820ad718f7903458991c7f))
- implement DynamoDB support with configuration management, migration tools, and documentation ([4a0d16c](https://github.com/llevintza/aws-config-service/commit/4a0d16cebc88478a240519de60a3adc7501623d6))
- **logging:** add request logging plugin with structured semantic logging ([5cbff0f](https://github.com/llevintza/aws-config-service/commit/5cbff0f0a7f9aad90f9e75a94471f067d49fc99e))
- update README to include Husky, ESLint, Prettier, and Commitlint details ([45877aa](https://github.com/llevintza/aws-config-service/commit/45877aaa44f7533fb36e1140e208a411f6c99368))

## 1.0.0 (2025-08-06)

- chore: add debug step for secret availability and update Codecov upload conditions ([56a6005](https://github.com/llevintza/aws-config-service/commit/56a6005))
- chore: add health endpoint testing scripts for local CI setup ([d67d69a](https://github.com/llevintza/aws-config-service/commit/d67d69a))
- chore: add local CI testing scripts and Docker integration ([b28616e](https://github.com/llevintza/aws-config-service/commit/b28616e))
- chore: add missing commas in various TypeScript files for syntax correctness ([4b9cc63](https://github.com/llevintza/aws-config-service/commit/4b9cc63))
- chore: add permissions section for GitHub Actions workflow ([e078af4](https://github.com/llevintza/aws-config-service/commit/e078af4))
- chore: add scripts for local CI testing, Docker build, and DynamoDB setup ([cc30260](https://github.com/llevintza/aws-config-service/commit/cc30260))
- chore: comment out commit message format check in PR workflow ([3858457](https://github.com/llevintza/aws-config-service/commit/3858457))
- chore: comment out push trigger in CI workflow for clarity ([ec896a4](https://github.com/llevintza/aws-config-service/commit/ec896a4))
- chore: enhance CI setup with improved DynamoDB health checks and add docker-compose configuration ([6ea5d69](https://github.com/llevintza/aws-config-service/commit/6ea5d69))
- chore: enhance DynamoDB connectivity testing scripts and update CI workflow ([2fa85ec](https://github.com/llevintza/aws-config-service/commit/2fa85ec))
- chore: enhance DynamoDB readiness checks and improve testing tool installation ([6278003](https://github.com/llevintza/aws-config-service/commit/6278003))
- chore: enhance local CI testing script with cleanup function and improve plugin initialization ([19f6828](https://github.com/llevintza/aws-config-service/commit/19f6828))
- chore: enhance local CI testing script with timeout handling and improved container checks ([17f3a3c](https://github.com/llevintza/aws-config-service/commit/17f3a3c))
- chore: enhance logging behavior for test environment and improve health route logging ([e4f6a73](https://github.com/llevintza/aws-config-service/commit/e4f6a73))
- chore: fix linting errors ([11e6aa7](https://github.com/llevintza/aws-config-service/commit/11e6aa7))
- chore: fixed linting errors ([2eda957](https://github.com/llevintza/aws-config-service/commit/2eda957))
- chore: implement GitHub Actions security scanning fix and add local testing scripts ([74da0c5](https://github.com/llevintza/aws-config-service/commit/74da0c5))
- chore: implement robust yarn install with retry logic and fallback for network errors ([373a550](https://github.com/llevintza/aws-config-service/commit/373a550))
- chore: improve DynamoDB readiness checks and update Codecov token usage ([8c29fff](https://github.com/llevintza/aws-config-service/commit/8c29fff))
- chore: reduce Node.js version matrix and enhancing DynamoDB setup with health checks ([3b9bb0b](https://github.com/llevintza/aws-config-service/commit/3b9bb0b))
- chore: rename workflow from "Pull Request Checks" to "PR" for brevity ([c4cfe90](https://github.com/llevintza/aws-config-service/commit/c4cfe90))
- chore: simplify lint-staged configuration by removing ESLint and TypeScript checks ([61b94d4](https://github.com/llevintza/aws-config-service/commit/61b94d4))
- chore: update AWS CLI installation steps to handle updates and improve clarity ([17fd385](https://github.com/llevintza/aws-config-service/commit/17fd385))
- chore: update AWS CLI installation to version 2 for improved functionality in DynamoDB checks ([b191a36](https://github.com/llevintza/aws-config-service/commit/b191a36))
- chore: update docs and scripts for local CI testing setup, prerequisites and usage ([678e2f7](https://github.com/llevintza/aws-config-service/commit/678e2f7))
- chore: update ESLint and Prettier configurations for improved code formatting ([93fd5a4](https://github.com/llevintza/aws-config-service/commit/93fd5a4))
- chore: update Node.js version in CI configuration to 22 ([9d5e8f4](https://github.com/llevintza/aws-config-service/commit/9d5e8f4))
- chore: update Node.js version matrix in CI configuration to include 20, 22, and 24 ([1dedcbb](https://github.com/llevintza/aws-config-service/commit/1dedcbb))
- chore: update Node.js version to 22 in CI and Dockerfile, ([700b4f3](https://github.com/llevintza/aws-config-service/commit/700b4f3))
- chore: update Node.js version to 22 in CI workflows for consistency ([df9bebd](https://github.com/llevintza/aws-config-service/commit/df9bebd))
- chore: update Node.js version to 22 in workflows and package files ([82a5d05](https://github.com/llevintza/aws-config-service/commit/82a5d05))
- chore: update permissions section in CI workflow for enhanced security ([addef79](https://github.com/llevintza/aws-config-service/commit/addef79))
- chore: update README and add TESTING_COMMANDS.md for comprehensive CI testing guidance ([eef1dbe](https://github.com/llevintza/aws-config-service/commit/eef1dbe))
- chore: update script paths for CI testing and DynamoDB migration ([4a978c7](https://github.com/llevintza/aws-config-service/commit/4a978c7))
- chore: updated the yarn.lock file ([94a85ab](https://github.com/llevintza/aws-config-service/commit/94a85ab))
- add bolierplate code ([2d0f946](https://github.com/llevintza/aws-config-service/commit/2d0f946))
- Changes before error encountered ([d115d57](https://github.com/llevintza/aws-config-service/commit/d115d57))
- cleanup ([ce44299](https://github.com/llevintza/aws-config-service/commit/ce44299))
- deps:(deps-dev): bump @commitlint/config-conventional (#6) ([6f1e6be](https://github.com/llevintza/aws-config-service/commit/6f1e6be)), closes [#6](https://github.com/llevintza/aws-config-service/issues/6)
- deps:(deps-dev): bump concurrently from 8.2.2 to 9.2.0 ([28ed8fb](https://github.com/llevintza/aws-config-service/commit/28ed8fb))
- deps:(deps-dev): bump concurrently from 8.2.2 to 9.2.0 ([c119637](https://github.com/llevintza/aws-config-service/commit/c119637))
- deps:(deps-dev): bump husky from 8.0.3 to 9.1.7 (#5) ([4fc96f9](https://github.com/llevintza/aws-config-service/commit/4fc96f9)), closes [#5](https://github.com/llevintza/aws-config-service/issues/5)
- deps:(deps-dev): bump pino-pretty from 10.3.1 to 13.1.1 (#4) ([b2656af](https://github.com/llevintza/aws-config-service/commit/b2656af)), closes [#4](https://github.com/llevintza/aws-config-service/issues/4)
- deps:(deps): bump the minor-and-patch group across 1 directory with 4 updates (#12) ([63f91c5](https://github.com/llevintza/aws-config-service/commit/63f91c5)), closes [#12](https://github.com/llevintza/aws-config-service/issues/12)
- Initial commit ([4338207](https://github.com/llevintza/aws-config-service/commit/4338207))
- Initial plan ([fd03405](https://github.com/llevintza/aws-config-service/commit/fd03405))
- fix: add retry logic for yarn install in multiple jobs to improve dependency installation ([722bed5](https://github.com/llevintza/aws-config-service/commit/722bed5))
- fix: replace logical OR with nullish coalescing for environment variables in DynamoDB configuration ([b6f4706](https://github.com/llevintza/aws-config-service/commit/b6f4706))
- fix: use coalescing ([b025305](https://github.com/llevintza/aws-config-service/commit/b025305))
- fix: use queryCommnad ([85052f0](https://github.com/llevintza/aws-config-service/commit/85052f0))
- refactor: enhance type safety and null checks in logger functions ([dccc242](https://github.com/llevintza/aws-config-service/commit/dccc242))
- refactor: improve null checks and type assertions across services and tests ([3bd1273](https://github.com/llevintza/aws-config-service/commit/3bd1273))
- refactor: migrate ESLint configuration to new format and improve rules ([70c74c4](https://github.com/llevintza/aws-config-service/commit/70c74c4))
- refactor: refactor code structure for improved readability and maintainability ([c0a3dc6](https://github.com/llevintza/aws-config-service/commit/c0a3dc6))
- feat: add EditorConfig, ESLint, Prettier configurations, and update package scripts ([6a365af](https://github.com/llevintza/aws-config-service/commit/6a365af))
- feat: add husky pre-commit hooks with eslint and prettier ([3750e53](https://github.com/llevintza/aws-config-service/commit/3750e53))
- feat: add JSON schemas for config and health routes, refactor route schemas ([66fc3e7](https://github.com/llevintza/aws-config-service/commit/66fc3e7))
- feat: add VS Code configuration files and update README with debugging instructions ([441f323](https://github.com/llevintza/aws-config-service/commit/441f323))
- feat: implement design patterns architecture with factory, strategy and DI ([09bb74e](https://github.com/llevintza/aws-config-service/commit/09bb74e))
- feat: implement DynamoDB support with configuration management, migration tools, and documentation ([4a0d16c](https://github.com/llevintza/aws-config-service/commit/4a0d16c))
- feat: update README to include Husky, ESLint, Prettier, and Commitlint details ([45877aa](https://github.com/llevintza/aws-config-service/commit/45877aa))
- feat(dynamodb): add scripts for creating and migrating DynamoDB tables ([e3a1ea9](https://github.com/llevintza/aws-config-service/commit/e3a1ea9))
- feat(logging): add request logging plugin with structured semantic logging ([5cbff0f](https://github.com/llevintza/aws-config-service/commit/5cbff0f))

# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-06

### Added

- Initial release of AWS Config Service
- REST API for configuration management
- Support for DynamoDB and file-based configuration sources
- Docker containerization support
- Comprehensive CI/CD pipeline
- Swagger/OpenAPI documentation
- Health check endpoints
- Logging with Winston
- TypeScript support
- ESLint and Prettier configuration
- Jest testing framework setup
- Husky git hooks for code quality
- Semantic versioning support

### Features

- **Configuration Management**: Load configurations for tenant, environment, cloud, and service
- **Multiple Data Sources**: Support for both DynamoDB and file-based configuration storage
- **API Documentation**: Auto-generated Swagger UI for API exploration
- **Container Ready**: Full Docker support with multi-stage builds
- **Production Ready**: Comprehensive error handling, logging, and health checks
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Code Quality**: Automated linting, formatting, and commit message validation

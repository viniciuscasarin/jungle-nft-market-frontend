## ADDED Requirements

### Requirement: Shared page content boundaries
The application SHALL align page content, header, breadcrumbs and footer with one shared container, capped at 1280px and using horizontal spacing tokens 4, 6 at sm and 8 at lg.

#### Scenario: Responsive content alignment
- **WHEN** a page is displayed at 390, 768 or 1440px
- **THEN** its content container and footer container have equal horizontal boundaries and padding
- **AND** the document has no horizontal overflow

#### Scenario: Product detail states
- **WHEN** product detail is loading, unavailable, failed or loaded
- **THEN** the content uses the same shared container

#### Scenario: Internal page composition
- **WHEN** a page contains a shared header or mobile content sections
- **THEN** horizontal page padding is applied once
- **AND** existing internal columns and modal widths remain appropriate to their content

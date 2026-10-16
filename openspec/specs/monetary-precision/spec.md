# Monetary Precision Specification

## Purpose

Define as regras de cálculo, representação, validação e formatação monetária em ETH utilizando representação decimal pura sem perda de precisão binária IEEE-754, garantindo encapsulamento rigoroso de decimal.js e exportando um tipo opaco seguro para consumo no monorepo.

## Requirements

### Requirement: Opaque Type and Strict String Parsing
The `@nft/shared-money` module SHALL provide an opaque branded type `EthAmount` and a pure parser that converts validated decimal strings into `EthAmount` while rejecting non-string inputs, empty strings, IEEE-754 floats, and scientific notation with a typed `InvalidEthAmountError`.

#### Scenario: Parse valid decimal string
- **WHEN** `parse("1.2500")` is called
- **THEN** it SHALL return an `EthAmount` representing `"1.2500"` without errors.

#### Scenario: Reject number input
- **WHEN** a `number` such as `0.1` or `15` is passed to `parse`
- **THEN** it SHALL throw `InvalidEthAmountError` and reject the operation.

#### Scenario: Reject scientific notation
- **WHEN** a string with exponential notation such as `"1e-18"` or `"2.5E4"` is passed to `parse`
- **THEN** it SHALL throw `InvalidEthAmountError`.

#### Scenario: Reject invalid characters or malformed strings
- **WHEN** an empty string, whitespace-only string, or text containing non-decimal characters like `"abc"` or `"--1.0"` is passed to `parse`
- **THEN** it SHALL throw `InvalidEthAmountError`.

### Requirement: Decimal Precision and Arithmetic Operations
The `@nft/shared-money` module SHALL execute pure arithmetic operations (`add`, `sub`, `mul`, `percent`, `sum`) with a minimum precision of 18 decimal places and `ROUND_HALF_UP` rounding, completely avoiding binary floating-point rounding errors.

#### Scenario: Exact addition of decimal values
- **WHEN** `add(parse("0.1"), parse("0.2"))` is executed
- **THEN** the result SHALL evaluate strictly to `"0.3"`.

#### Scenario: Subtraction of decimal values
- **WHEN** `sub(parse("1.0000"), parse("0.0001"))` is executed
- **THEN** the result SHALL evaluate strictly to `"0.9999"`.

#### Scenario: Multiplication with integer quantity
- **WHEN** `mul(parse("0.05"), 3)` is executed with integer quantity 3
- **THEN** the result SHALL evaluate strictly to `"0.15"`.

#### Scenario: Percent calculation
- **WHEN** `percent(parse("200.00"), 10)` is executed for a 10% discount
- **THEN** the result SHALL evaluate strictly to `"20.00"`.

#### Scenario: Sum across multiple amounts
- **WHEN** `sum([parse("1.1"), parse("2.2"), parse("3.3")])` is executed
- **THEN** the result SHALL evaluate strictly to `"6.6"`.

#### Scenario: Handling 18 decimal places precision
- **WHEN** amounts with 18 decimal places such as `"0.000000000000000001"` and `"0.000000000000000002"` are added
- **THEN** the resulting `EthAmount` SHALL strictly preserve all 18 decimal places as `"0.000000000000000003"` without rounding down or overflowing.

### Requirement: Comparison and Zero Checks
The `@nft/shared-money` module SHALL provide pure comparison helpers `compare` and `isZero` to evaluate `EthAmount` values accurately.

#### Scenario: Comparison of distinct values
- **WHEN** comparing `parse("1.5")` and `parse("1.2")`
- **THEN** `compare` SHALL return `1`.

#### Scenario: Comparison of equal values with different decimal representation
- **WHEN** comparing `parse("1.5000")` and `parse("1.5")`
- **THEN** `compare` SHALL return `0`.

#### Scenario: Zero check
- **WHEN** `isZero(parse("0.0000"))` is evaluated
- **THEN** it SHALL return `true`.

### Requirement: Locale Formatting and API Serialization
The `@nft/shared-money` module SHALL provide `format` and `toApi` helpers that format values for display according to Brazilian Portuguese locale (`pt-BR`) conventions without scientific notation, and serialize to clean strings for REST transport.

#### Scenario: Format with custom decimal places
- **WHEN** `format(parse("2.55555"), { decimals: 2 })` is called with `pt-BR` locale
- **THEN** the output SHALL format using comma as decimal separator, yielding `"2,56"`.

#### Scenario: Format large numbers with thousands separator
- **WHEN** `format(parse("1250.50"), { decimals: 2 })` is called with `pt-BR` locale
- **THEN** the output SHALL format as `"1.250,50"` without exponential drift.

#### Scenario: Serialization to API
- **WHEN** `toApi(parse("1.250000000000000000"))` is called
- **THEN** it SHALL return the canonical string `"1.250000000000000000"`.

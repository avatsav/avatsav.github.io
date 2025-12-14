+++
title = "The Case Against Nullable Booleans in API Design"
date = "2025-01-15"
description = "hy nullable booleans create ambiguity and complexity in API design, and better alternatives for representing uncertain states."
tags = [
    "api-design",
    "best-practices",
    "software-architecture",
]
+++

Boolean fields that can be `null` are one of the most deceptive anti-patterns in API design. While they might seem like
a convenient way to represent "unknown" or "unset" states, they introduce fundamental ambiguity that cascades through
your entire system.

## The Three-State Problem

A nullable boolean creates three possible states: `true`, `false`, and `null`. This violates the fundamental principle
of boolean logic [^1] and creates semantic confusion:

```json
{
  "user": {
    "emailVerified": null,
    "marketingOptIn": true,
    "isActive": false
  }
}
```

What does `emailVerified: null` mean? Does it mean:

- The email verification status is unknown?
- Email verification hasn't been attempted yet?
- The verification process failed?
- The field is not applicable for this user type?

This ambiguity forces every consumer of your API to make assumptions, leading to inconsistent behavior across different
clients and implementations.

## The Cognitive Load Burden

Nullable booleans impose significant cognitive overhead on developers. Consider the decision tree a frontend developer
must navigate:

```typescript
// The developer must handle three states instead of two
if (user.emailVerified === true) {
    showVerifiedBadge();
} else if (user.emailVerified === false) {
    showUnverifiedWarning();
} else if (user.emailVerified === null) {
    // What should happen here? Guess based on context?
    showPendingVerification(); // Maybe?
}
```

This pattern multiplies across every boolean field, creating an exponential increase in complexity. A form with five
nullable boolean fields has 3⁵ = 243 possible state combinations, most of which are never properly tested or considered.

## Database Inconsistency

Nullable booleans often stem from database schema decisions where `NOT NULL` constraints are avoided for perceived
flexibility[^2]. However, this creates data integrity issues:

```sql
-- Queries become unnecessarily complex
SELECT *
FROM users
WHERE email_verified IS NOT NULL
  AND email_verified = TRUE;

-- Aggregations become ambiguous
SELECT COUNT(*) as verified_users
FROM users
WHERE email_verified = TRUE; -- Does this exclude nulls? Yes, but is that intended?
```

## Real-World Consequences

I've witnessed production incidents caused by nullable boolean ambiguity:

- A payment system treated `null` as `false` for `isPremiumCustomer`, denying legitimate premium users access to
  features
- An email service interpreted `marketingOptIn: null` as consent, violating GDPR compliance[^3]
- A mobile app crashed when attempting to bind a nullable boolean to a native switch component that expected a
  definitive state

## Better Alternatives

### 1. Explicit State Enums

Replace nullable booleans with explicit state representations:

```json
{
  "emailVerificationStatus": "pending",
  // "verified", "failed", "pending"
  "marketingConsent": "granted",
  // "granted", "denied", "not_requested"
  "accountStatus": "active"
  // "active", "inactive", "suspended"
}
```

### 2. Separate Existence and Value Fields

When the presence of information is meaningful:

```json
{
  "hasMarketingPreference": true,
  "marketingOptIn": false,
  "emailVerificationAttempted": true,
  "emailVerified": false
}
```

### 3. Optional Fields with Default Semantics

Omit fields entirely when they don't apply, with clear documentation about default behavior:

```json
{
  "isActive": true,
  // marketingOptIn omitted = no consent given (safe default)
  "settings": {
    "emailNotifications": true
    // explicit preference set
  }
}
```

### 4. Status Objects for Complex States

For workflows with multiple dimensions:

```json
{
  "verification": {
    "email": {
      "status": "verified",
      "verifiedAt": "2024-02-15T10:30:00Z",
      "method": "email_link"
    },
    "phone": {
      "status": "pending",
      "attemptsRemaining": 2
    }
  }
}
```

## The Path Forward

When designing APIs, resist the temptation to use nullable booleans as a shortcut for handling uncertainty. Instead:

1. **Define explicit states** for each business concept
2. **Document the meaning** of each possible state clearly
3. **Choose safe defaults** when fields can be omitted
4. **Use type systems** that prevent null-related bugs[^4]
5. **Test edge cases** thoroughly, especially state transitions

## Conclusion

Nullable booleans are a false friend in API design. They promise flexibility but deliver confusion, bugs, and
maintenance overhead. By choosing more explicit representations, we create APIs that are easier to understand, implement
correctly, and maintain over time.

The extra upfront effort of modeling states explicitly pays dividends in reduced support burden, fewer production
issues, and happier developers consuming your API.

[^1]: **Boolean Logic Fundamentals**: Classical boolean algebra operates on exactly two values: true and false. The
introduction of a third state (null/undefined) creates a three-valued logic system that requires different rules and
operators. See [Three-valued logic](https://en.wikipedia.org/wiki/Three-valued_logic) on Wikipedia for mathematical
foundations.

[^2]: **Database Design Principles**: The choice between nullable and non-nullable columns should be driven by business
requirements, not developer convenience. C.J. Date's "Database in Depth" extensively covers the problems with nullable
fields in relational databases. PostgreSQL's documentation provides practical guidance
on [when to use NULL](https://www.postgresql.org/docs/current/ddl-default.html).

[^3]: **GDPR and Consent**: The General Data Protection Regulation requires explicit, informed consent for data
processing. Ambiguous consent states can lead to compliance violations.
The [ICO's guidance on consent](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/)
emphasizes the need for clear, positive opt-in mechanisms.

[^4]: **Type Safety**: Languages with strong type systems like Rust, Haskell, or TypeScript with strict null checks help
prevent nullable boolean issues at compile time.
The [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/null-and-undefined.html) discusses
strictNullChecks and how they improve code reliability.

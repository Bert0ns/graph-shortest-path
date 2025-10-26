# Developer Guidelines

This document provides instructions for developers and code assistants to ensure contributions align with the project's standards and conventions.

## 1. Code Style & Principles

### SOLID Principles

Apply SOLID principles to create maintainable and scalable code:

- **Single Responsibility:** Each component/function should have one clear purpose
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Subtypes must be substitutable for their base types
- **Interface Segregation:** Many specific interfaces over one general interface
- **Dependency Inversion:** Depend on abstractions, not concretions

### Code Quality Standards

- **Self-Documenting Code:** Write code that explains itself through clear naming and structure
- **Separation of Concerns:** Keep business logic, UI, and data management separate
- **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions
- **KISS (Keep It Simple):** Prefer simple, straightforward solutions
- **Comments:** Explain _why_, not _what_
  - Good: `// Using binary search for O(log n) performance`
  - Bad: `// Loop through array`
- **Remove dead code:** No commented-out code; use git history

## 2. TypeScript Guidelines

- **Strict mode enabled:** Enable all TypeScript strict flags
- **Avoid `any`:** Use `unknown` or proper types instead
- **Define interfaces:** For objects, API responses, and component props
- **Type inference:** Let TypeScript infer when obvious
- **Generic types:** Use generics for reusable components/functions

```typescript
// ❌ Bad
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ Good
interface DataItem {
  value: number;
  label: string;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

## 3. Next.js App Router Conventions

### Project Structure

```
/src
  /app                    # App Router - pages and layouts
  /components             # Reusable React components
  /lib                    # Core utilities and business logic
  /hooks                  # Custom React hooks
  /types                  # TypeScript type definitions
  /utils                  # Helper functions
  /constants              # Application constants
```

### Server vs Client Components

- **Server Components (default):** Use for data fetching and static content
- **Client Components:** Add `"use client"` only when needed:
  - Interactive elements (onClick, onChange)
  - React hooks (useState, useEffect)
  - Browser APIs (localStorage, window)

### Component Guidelines

- **Keep components small:** Under 250 lines; split if larger
- **Single responsibility:** Each component does one thing
- **Props:** Use TypeScript interfaces; avoid prop drilling beyond 2 levels
- **Composition over inheritance:** Build complex UIs from simple components

```typescript
// ❌ Bad - Too many responsibilities
function UserDashboard() {
  // Fetches data, manages state, renders UI, handles forms
}

// ✅ Good - Separated concerns
function UserDashboard() {
  return (
    <>
      <UserProfile />
      <UserStats />
      <UserActions />
    </>
  );
}
```

## 4. Naming Conventions

- **Components:** PascalCase - `UserProfile`, `DataTable`
- **Files/folders:** kebab-case - `user-profile.tsx`, `data-utils.ts`
- **Functions/variables:** camelCase - `getUserData`, `isLoading`
- **Constants:** UPPER_SNAKE_CASE - `MAX_RETRY_ATTEMPTS`, `API_URL`
- **Boolean variables:** Prefix with `is`, `has`, `should` - `isActive`, `hasError`
- **Event handlers:** Prefix with `handle` - `handleClick`, `handleSubmit`

## 5. Function Design

- **Small functions:** Aim for < 50 lines
- **Pure functions preferred:** Same input → same output, no side effects
- **Single responsibility:** Each function does one thing well
- **Return early:** Use guard clauses to reduce nesting

```typescript
// ❌ Bad - Nested conditions
function validateUser(user) {
  if (user) {
    if (user.email) {
      if (user.age > 18) {
        return true;
      }
    }
  }
  return false;
}

// ✅ Good - Early returns
function validateUser(user) {
  if (!user) return false;
  if (!user.email) return false;
  if (user.age <= 18) return false;
  return true;
}
```

## 6. State Management

- **Local state:** `useState` for component-specific state
- **Server state:** Fetch in Server Components when possible
- **Custom hooks:** Extract complex state logic into reusable hooks
- **URL state:** Use searchParams for filters, pagination, sorting
- **Keep state close to where it's used:** Avoid unnecessary global state

## 7. Error Handling

- **Always handle errors:** Use try-catch for async operations
- **Provide user feedback:** Show meaningful error messages
- **Fail gracefully:** Provide fallback UI for errors
- **Log errors:** Use proper error logging in production

```typescript
// ✅ Good error handling
async function fetchData() {
  try {
    const data = await api.getData();
    return { data, error: null };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { data: null, error: "Failed to load data" };
  }
}
```

## 8. Code Formatting

- **Prettier:** Auto-format on save
- **ESLint:** Enforce code quality rules
- **Line length:** 100 characters maximum
- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Quotes:** Single quotes for strings
- **Trailing commas:** Use for multi-line objects/arrays

## 10. Performance

- **Avoid premature optimization:** Write clean code first
- **Memoization:** Use `React.memo`, `useMemo`, `useCallback` when beneficial
- **Code splitting:** Dynamic imports for heavy components
- **Optimize images:** Always use `next/image`
- **Profile before optimizing:** Measure actual performance issues

## 11. Git Workflow

### Branch Naming

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `refactor/short-description` - Code refactoring
- `docs/short-description` - Documentation updates

### Commit Messages

Follow conventional commits:

```
<type>: <subject>

Types: feat, fix, refactor, test, docs, style, perf, chore

Examples:
  feat: add user authentication
  fix: correct calculation in total price
  refactor: simplify data processing logic
  test: add unit tests for validation
```

### Pull Requests

- **Keep PRs focused:** One feature/fix per PR
- **Size matters:** Prefer smaller PRs (<400 lines)
- **Clear description:** What, why, and how
- **All tests pass:** Verify before submitting
- **Self-review:** Review your own code before requesting review

## 12. Code Review Checklist

Before submitting a PR:

- [ ] Code follows naming conventions
- [ ] TypeScript types properly defined
- [ ] No `any` types used
- [ ] Functions are small and focused
- [ ] Error handling implemented
- [ ] No console.logs or debug code
- [ ] Tests written and passing
- [ ] Code is self-explanatory
- [ ] Comments explain _why_, not _what_
- [ ] No unnecessary complexity

## 13. AI Assistant Guidelines

When working with AI code assistants:

- **Provide context:** Share relevant code and project structure
- **Reference this document:** Ask AI to follow these guidelines
- **Review generated code:** Always review and test AI suggestions
- **Ask for explanations:** Understand what the code does
- **Maintain standards:** Ensure AI code aligns with project conventions

---

**Remember:** Good code is code that others (including your future self) can easily understand and modify. Prioritize clarity and maintainability over cleverness.

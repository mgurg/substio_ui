# Agent Instructions

### For AI Agents

When working on this codebase:

1. **Always use `bun`** instead of `npm`, `pnpm`, or `yarn`.
2. **Use `bun run <script>`** to execute scripts defined in `package.json`.
3. **Use `vitest`** for running tests.

## Project Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **UI Components**: [Nuxt UI v4](https://ui.nuxt.com/) (Tailwind CSS)
- **Validation**: [Yup](https://github.com/jquense/yup) for schemas
- **Testing**: [Vitest](https://vitest.dev/)
- **API Client**: Generated via [@hey-api/openapi-ts](https://hey-api.vercel.app/) (Axios)
- **Dependencies**: Managed via `package.json` and `bun.lockb`

## Project Architecture

The project follows the standard Nuxt 3 directory structure with some custom conventions:

- **`app/pages/`**: File-based routing.
- **`app/components/`**: Reusable Vue components.
- **`app/composables/`**: Shared logic and state (Vue Composition API).
- **`app/client/`**: Generated API client and types (do not edit directly).
- **`app/utils/`**: Helper functions and business logic utilities.
- **`server/api/`**: Nitro server routes.

## Coding Conventions

- **Context First**: Study related code before making changes to fully **understand the context**.
- **Simplicity**: Try to **remove all unavoidable complexity** from the task before you start coding. **Ask challenging questions if needed** to simplify solutions.
- **DRY & Modular**: Write clean, modular, readable code.
- **TypeScript**: Use explicit types or `unknown` instead of `any`.
- **Async/Await**: Ensure you use `await` for API calls and other asynchronous operations.
- **Composition API**: Use the `<script setup>` syntax for Vue components.

## Testing

- New features should include appropriate unit or integration tests in the `tests/` directory or alongside the component/composable if appropriate (Vitest).
- Run tests using `bun test`.
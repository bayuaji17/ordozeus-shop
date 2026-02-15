# AGENTS.md

Guidelines for AI agents working in the OrdoZeus Shop codebase.

## Build/Lint/Test Commands

```bash
# Development
bun dev                        # Start dev server (localhost:3000)
bun run build                  # Production build
bun run start                  # Start production server

# Linting
bun run lint                   # Run ESLint
bun run lint -- --fix          # Auto-fix ESLint issues

# Database
bun run db:generate            # Generate Drizzle migrations
bun run db:migrate             # Run migrations
bun run db:push                # Push schema to database (quick dev workflow)
bun run db:studio              # Open Drizzle Studio GUI
bun run db:seed                # Seed database with test data

# Package Management
bun install                    # Install dependencies
bun add <package>              # Add dependency
bun add -d <package>           # Add dev dependency
bun remove <package>           # Remove dependency
```

**Note**: This project uses **Bun** as the package manager. Always use `bun` commands, not npm/yarn/pnpm.

## Pre-Development Checklist

**BEFORE starting ANY development task:**

### 1. React/Next.js Work
- **MUST** invoke `vercel-react-best-practices` skill FIRST
- Apply guidelines throughout implementation

### 2. UI Component Additions
- **MUST** use shadcn MCP tools (NOT CLI):
  - `mcp__shadcn__search_items_in_registries`
  - `mcp__shadcn__view_items_in_registries`
  - `mcp__shadcn__get_item_examples_from_registries`
  - `mcp__shadcn__get_add_command_for_items`
- Fallback ONLY if MCP fails: `bunx shadcn@latest add`

### 3. Package Management
- **MUST** use Bun (NEVER npm/yarn/pnpm)

## Post-Development Quality Checks (MANDATORY)

**After ANY code changes, run in this order:**

### Step 1: Lint Check
```bash
bun run lint
```
- If fails: Fix all errors immediately
  - Use `bun run lint --fix` for auto-fixes
  - Manually fix remaining errors
  - Re-run until clean
- If succeeds: Proceed to Step 2

### Step 2: Build Check
```bash
bun run build
```
- If fails: Fix all TypeScript/build errors immediately
  - Check output for specific file:line issues
  - Fix type errors, missing imports, invalid syntax
  - Re-run until successful
- If succeeds: Code is ready for commit

**Quality Check Workflow:**
```
Code Changes → bun run lint → (fix if needed) → bun run build → (fix if needed) → Ready
```

**When to skip:** Only documentation-only changes (README, comments, .env.example, .gitignore)

## Code Style Guidelines

### Imports
- Use `@/` path aliases for all imports (e.g., `@/components`, `@/lib`, `@/app`)
- Group imports: React/Next → third-party → internal (components, lib, types)
- Use named imports for components: `import { Button } from "@/components/ui/button"`

### Formatting
- No semicolons (enforced by ESLint)
- Single quotes for strings
- 2-space indentation
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters

### Types & Naming
- Use TypeScript strict mode
- PascalCase for: components, types, interfaces, enums
- camelCase for: variables, functions, methods, hooks
- UPPER_SNAKE_CASE for constants
- Prefix boolean variables with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)

### Component Patterns
- Default to Server Components (no "use client")
- Use "use client" only when needed: hooks, browser APIs, interactivity
- Pass server-fetched data as props to client components
- Use `Suspense` with skeleton loaders for loading states

### Server Actions
- Mark with `"use server"` at top of file
- Place in `lib/actions/<feature>.ts`
- Return `{ success: boolean, data?, error? }` pattern
- Use `revalidatePath()` after mutations

### Error Handling
- Use try/catch in Server Actions with specific error messages
- Log errors to console with context: `console.error("Context:", error)`
- Return user-friendly error messages in action results
- Use Zod for form validation before processing

### Database (Drizzle)
- Define schema in `lib/db/schema.ts`
- Use relations for relational queries with `.with()`
- Store prices as integers (cents/sen)
- Use transactions for multi-table operations

### UI Components (shadcn/ui)
- **ALWAYS use shadcn MCP tools first** when adding components
- Use New York style variant
- Place feature-specific components in `components/admin/<feature>/`

### Currency (IDR)
- Store as integers in DB, format with `lib/currency.ts`:
  - `formatCurrency(amount)` → "Rp 1.234.567"
  - `abbreviateIDR(amount)` → "Rp 1,2 Jt"
- **NEVER** format manually: ❌ `Rp ${price}`

### Validation
- Use Zod schemas in `lib/validations/<feature>.ts`
- Export types with `z.infer<typeof schema>`
- Use with React Hook Form: `zodResolver(schema)`

### Authentication (Better Auth)
- Server: `import { auth } from "@/lib/auth"` → `auth.api.getSession({ headers })`
- Client: `import { useSession } from "@/lib/auth-client"`
- Users have `role: "admin" | "user"`

## Tool Usage Rules

### Priority Hierarchy
1. **Use dedicated tools FIRST** (never Bash equivalents):
   - ✅ `Read` ❌ `cat, head, tail, sed`
   - ✅ `Edit` ❌ `sed, awk`
   - ✅ `Write` ❌ `echo >, cat <<EOF`
   - ✅ `Glob` ❌ `find, ls`
   - ✅ `Grep` ❌ `grep, rg`

2. **MCP-Enhanced Tools** (when available):
   - `mcp__acp__Read`, `mcp__acp__Write`, `mcp__acp__Edit`, `mcp__acp__Bash`

### Complex Task Management
- Use `TodoWrite` for tasks with **3+ steps**
- Use `Task` tool for open-ended codebase exploration
- Use `EnterPlanMode` for multi-file changes (3+ files)

## File Operations Rules

### CRITICAL - Before Editing
1. **MUST** Read file first (Edit tool fails otherwise)
2. **MUST** preserve exact indentation (tabs/spaces)
3. **MUST** match formatting from Read output

### File Creation Policy
- ❌ **NEVER** create files unless absolutely necessary
- ❌ **NEVER** create README/docs unless explicitly requested
- ✅ **PREFER** editing existing files over creating new ones
- ✅ **DELETE** unused code completely (no backwards-compatibility hacks)

### What NOT to Add
- ❌ Emojis (unless explicitly requested)
- ❌ Docstrings to unchanged code
- ❌ Comments to unchanged code
- ❌ Type annotations to unchanged code
- ❌ "Improvements" beyond requested changes

## Anti-Patterns (AVOID)
- ❌ Over-engineering (keep solutions simple)
- ❌ Creating helpers for one-time operations
- ❌ Designing for hypothetical future requirements
- ❌ Adding error handling for impossible scenarios
- ❌ Cleaning up surrounding code during bug fixes
- ❌ Adding features beyond what was requested
- ❌ Feature flags for simple changes
- ❌ Premature abstractions
- ❌ Backwards-compatibility hacks

## Security Requirements
- ✅ Prevent OWASP Top 10 vulnerabilities
- ✅ Validate at system boundaries (user input, external APIs)
- ❌ DON'T validate internal code (trust framework guarantees)

## Risky Actions Protocol

### MUST Confirm with User Before:
- Deleting files/branches/database tables
- Killing processes
- `rm -rf` commands
- Overwriting uncommitted changes
- Force-pushing (`git push --force`)
- `git reset --hard`
- Amending published commits
- Pushing code to remote
- Creating/closing PRs or issues
- Modifying shared infrastructure/permissions

### Investigation First, Destruction Second
- ✅ Identify root causes before fixing
- ✅ Investigate unexpected state
- ✅ Resolve merge conflicts (don't discard changes)
- ❌ Bypass safety checks (--no-verify)
- ❌ Delete unfamiliar state without investigation

## Communication Style
- ✅ Short and concise
- ✅ Use periods (not colons) before tool calls
- ✅ Reference code: `file_path:line_number`
- ✅ Github-flavored markdown
- ❌ NO emojis (unless explicitly requested)
- ❌ NO time estimates or predictions
- ❌ NO verbose explanations

## Database Workflow

```bash
# Development cycle
# 1. Modify schema: lib/db/schema.ts
# 2. Apply changes: bun run db:push
# 3. Production: bun run db:generate → bun run db:migrate
# 4. View data: bun run db:studio
```

## File Organization

```
app/                    # Next.js App Router
├── (auth)/             # Auth route group
├── admin/              # Admin panel
├── api/                # API routes
components/
├── ui/                 # shadcn/ui primitives
└── admin/              # Admin components by feature
lib/
├── actions/            # Server Actions
├── db/                 # Drizzle schema & connection
├── types/              # TypeScript types
├── validations/        # Zod schemas
└── utils.ts            # Utility functions
```

## Complete Development Checklist

### Before Development
- [ ] Invoke `vercel-react-best-practices` (if React/Next.js)
- [ ] Plan to use shadcn MCP tools (if adding components)
- [ ] Ensure using Bun (not npm/yarn/pnpm)

### During Development
- [ ] Read files before editing
- [ ] Make only necessary changes
- [ ] Use path aliases (@/components, @/lib, @/app)
- [ ] Follow Server Component patterns
- [ ] Use currency utils for prices
- [ ] Ensure type safety

### After Development (CRITICAL)
- [ ] Run `bun run lint` → Fix errors → Re-run until clean
- [ ] Run `bun run build` → Fix errors → Re-run until clean
- [ ] Verify all quality checks passed ✅

### Before Commit
- [ ] All lint checks passing ✅
- [ ] All build checks passing ✅
- [ ] No TypeScript errors ✅
- [ ] Code follows project patterns ✅
- [ ] Ready for git commit/push

## Quick Reference

| Task | Tool/Action |
|------|-------------|
| Read file | `Read` or `mcp__acp__Read` |
| Edit file | `Edit` (after reading) |
| Create file | `Write` (only if necessary) |
| Search files | `Glob`, `Grep` |
| Add UI component | shadcn MCP tools |
| React dev | Invoke `vercel-react-best-practices` skill |
| Install package | `bun add <package>` |
| DB schema change | Edit → `bun run db:push` |
| Format currency | `formatCurrency(amount)` from `@/lib/currency` |
| Server Action | Mark with `"use server"`, put in `lib/actions/` |
| After code change | `bun run lint` → `bun run build` (MANDATORY) |
| Risky operation | Confirm with user first |

**Philosophy**: Measure twice, cut once. Read before editing. Use the right tool for the job. Keep it simple. Always verify with lint and build. Fix errors immediately. Confirm destructive actions.

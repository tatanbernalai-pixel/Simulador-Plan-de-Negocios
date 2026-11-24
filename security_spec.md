# Security Specification: Simulador Modelo Financiero Plan de Negocio

## 1. Data Invariants
1. **Strict Ownership**: Every document in `/projects/{projectId}` MUST have `ownerId == request.auth.uid`, and only verified authenticated users (`request.auth != null && request.auth.token.email_verified == true`) can read, list, create, update, or delete their own projects.
2. **Immutable Identity & Creation Timestamp**: `ownerId` and `createdAt` cannot be modified after document creation.
3. **Server-Enforced Timestamps**: `createdAt` (on create) and `updatedAt` (on create/update) MUST equal `request.time`.
4. **Strict Key & Type Validation**: Only allowed keys (`ownerId`, `name`, `createdAt`, `updatedAt`, `inputs`, `diagnosis`, `summary`) may exist on `/projects/{projectId}` documents. No shadow/ghost fields are allowed.
5. **Bounded Arrays & Path IDs**: All document IDs (`projectId`) must match `^[a-zA-Z0-9_\-]+$` with length <= 128. Arrays inside `inputs` (`investments`, `products`, `operatingExpenses`, `teamMembers`) are strictly bounded in size (`<= 50` / `<= 20`) and validated for map items.

## 2. Adversarial Payloads ("Dirty Dozen") Expected to Return PERMISSION_DENIED
1. **Unauthenticated Create/Read**: Attempting `get` or `create` on `/projects/proj_1` with `request.auth == null`.
2. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempting `create` or `list`.
3. **Cross-Tenant Read (`get`)**: User B attempting `get` on `/projects/proj_userA` where `resource.data.ownerId == userA`.
4. **Blanket Query Scraping (`list`)**: User B querying `/projects` without `.where('ownerId', '==', userB)`.
5. **Identity Spoofing on Create**: User B creating `/projects/proj_2` with `ownerId: userA`.
6. **Shadow Field Injection on Create**: Creating `/projects/proj_3` with an extra field `isAdmin: true`.
7. **Shadow Field Injection on Update**: Updating `/projects/proj_1` with an extra field `role: "admin"` outside `affectedKeys().hasOnly(...)`.
8. **Owner Hijack on Update**: User A updating `ownerId` to `userB`.
9. **Client Timestamp Forgery (Create)**: Creating with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
10. **Client Timestamp Forgery (Update)**: Updating `createdAt` or providing an arbitrary `updatedAt` not equal to `request.time`.
11. **Path ID Poisoning**: Creating `/projects/invalid$id..with..dots` or an ID > 128 characters.
12. **Array Exhaustion / Type Poisoning**: Creating `/projects/proj_4` with `name: 12345` or > 50 items in `inputs.products`, or `inputs.name` > 150 chars.

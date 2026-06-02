# Security Specification: Patient Reservations Database

## 1. Data Invariants
- **Public Creation, Private Reading**: Any guest interface can submit (create) a reservation, but no guest user can ever read, list, update, or delete any reservation document.
- **Admin Access Only**: Only verified administrators securely logged in with the pre-approved email identifier (`jimmymanalel@gmail.com`) can list or inspect reservation entries.
- **Strict Size Restrictions**: Patient fields must not be empty or exceed safe boundaries (e.g., patient name length bounded to prevent buffer bloating or denial-of-wallet resource exhausts).
- **Temporal Invariant**: The `createdAt` property must match the exact server-side request time `request.time`.

## 2. The "Dirty Dozen" Malicious Payloads (Integrity Targets)

1. **The Ghost Field (Shadow Update)**: Inject rogue fields like `isAdmin: true` or `vipStatus: true` on creation.
2. **The Spoofed Identifier**: Document ID containing unsafe junk characters or path traversal elements.
3. **The Blank Name**: Submitting reservation with empty name field (`""`).
4. **The Giant Name**: Submitting a name exceeding 100 characters.
5. **The Missing E-mail**: Omitting the email field.
6. **The Invalid E-mail**: Email lacking standard formatting pattern constraints.
7. **The Spoofed Time**: Backdating or postdating `createdAt` using arbitrary client-controlled timestamps.
8. **The PII Snoop**: Authenticated non-admin trying to retrieve a list of reservations.
9. **The Orphaned Update**: Client trying to change reservation data after registration.
10. **The Impostor Admin**: Querying under a non-verified email or unverified token claiming to be admin.
11. **The Malformed Code**: ProgramId selection containing code injection characters.
12. **The Unauthenticated Delete**: Guest trying to truncate or clear the compilation of reservations.

## 3. Test Runner Design for Verification
Matches verification against our final secure rules schema.
- Creating a reservation returns success if structural invariants match.
- Querying list of reservations as admin returns success.
- Reading any reservation as non-admin or anonymous return PERMISSION_DENIED.

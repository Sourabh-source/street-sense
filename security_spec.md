# Security Specification: Street Sense

## 1. Data Invariants
- A `User` profile must match the authenticated user's UID.
- Only admins can assign the `admin` role to users.
- A `ViolationReport` must have a `reporterUid` matching the creator's UID.
- Once a `ViolationReport` status is terminal (e.g., 'resolved', 'rejected', 'fined'), it cannot be updated by a citizen.
- `Notifications` are private to the recipient.
- `People` records can only be created/modifed by admins.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Privilege Escalation**: Attempt to set `role: 'admin'` during registration.
3. **Ghost Update**: Attempt to add a field like `isVerified: true` to a report.
4. **ID Poisoning**: Attempt to use a 1MB string as a Document ID for a report.
5. **PII Leak**: Unauthorized user trying to read another user's email via list query.
6. **State Shortcut**: Citizen trying to move a report from `submitted` to `resolved`.
7. **Resource Exhaustion**: Sending a 1MB string in the `notes` field.
8. **Relational Breakage**: Creating a report with a `reporterUid` that doesn't exist.
9. **Terminal Edit**: Citizen trying to update a report after an admin has `rejected` it.
10. **Immutability Breach**: Attempting to change the `createdAt` timestamp of a report.
11. **Spoofed Status**: Creating a report directly in `fined` status.
12. **Anonymous Write**: Attempting to create a report without being authenticated.

## 3. Test Runner (Planned)
The `firestore.rules.test.ts` will verify these scenarios.

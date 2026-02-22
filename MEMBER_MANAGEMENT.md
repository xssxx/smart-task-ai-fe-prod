# Project Member Management Implementation

This document describes the implementation of project member management features.

## API Endpoints

### 1. Add Member to Project

```
POST /api/projects/:projectId/members
```

**Request Body:**

```json
{
  "account_id": "acc_abc123",
  "role": "member" // optional: "owner" or "member", defaults to "member"
}
```

### 2. Remove Member from Project

```
DELETE /api/projects/:projectId/members/:accountId
```

**Note:** Cannot remove project owner

### 3. List Project Members

```
GET /api/projects/:projectId/members
```

## Implementation Files

### 1. API Service (`src/services/api.ts`)

Added three new API functions:

- `addProjectMember(projectId, payload)` - Add a member to a project
- `removeProjectMember(projectId, accountId)` - Remove a member from a project
- `listProjectMembers(projectId)` - Get all members of a project

**Types:**

- `ProjectMember` - Member data structure
- `AddMemberRequest` - Request payload for adding members
- `AddMemberResponse` - Response data for adding members
- `ListMembersResponse` - Response data for listing members

### 2. Custom Hook (`src/hooks/useProjectMembers.ts`)

A reusable hook for managing project members:

- `members` - Array of project members
- `loading` - Loading state
- `error` - Error message if any
- `fetchMembers()` - Fetch members list
- `addMember(payload)` - Add a new member
- `removeMember(accountId, role)` - Remove a member

### 3. Member Management Modal (`src/components/ManageMembersModal.tsx`)

A dialog component for managing project members with:

- Add member form with account ID and role selection
- List of current members with their roles
- Remove member functionality (except for owners)
- Visual indicators for owner role (crown icon)
- Loading states and error handling

### 4. Sidebar Integration (`src/components/Sidebar.tsx`)

Updated the workspace dropdown menu to include:

- "จัดการสมาชิก" (Manage Members) option
- Opens the ManageMembersModal when clicked
- Added Users icon from lucide-react

## Features

1. **Add Members**: Enter account ID and select role (member/owner)
2. **Remove Members**: Click trash icon to remove (owners cannot be removed)
3. **View Members**: See all members with their roles and join dates
4. **Role Badges**: Visual distinction between owners (with crown icon) and members
5. **Toast Notifications**: Success/error feedback for all operations
6. **Loading States**: Skeleton loaders while fetching data

## Usage Example

```tsx
import { useProjectMembers } from "@/hooks/useProjectMembers";

function MyComponent({ projectId }: { projectId: string }) {
  const { members, loading, addMember, removeMember } =
    useProjectMembers(projectId);

  const handleAdd = async () => {
    await addMember({
      account_id: "acc_123",
      role: "member",
    });
  };

  return (
    <div>
      {loading
        ? "Loading..."
        : members.map((m) => <div key={m.account_id}>{m.account_id}</div>)}
    </div>
  );
}
```

## Security Notes

- All routes require JWT authentication with AccountId and NodeId claims
- Project owners cannot be removed
- Role validation is handled on the backend

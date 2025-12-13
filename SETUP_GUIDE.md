# Research Platform Setup Guide

## Quick Start for Testing with Data

### Step 1: Seed ROSCA Groups to Firebase

After signing up your first user, seed the groups database:

**Method 1: Browser Console**
1. Open browser DevTools (F12)
2. Run: `window.seedGroupsToFirebase()`
3. Wait for confirmation

**Method 2: Add Seed Button to Dashboard**
- Temporarily add a seed button to test easily

### Step 2: Join Groups for Testing

To see "Due Soon" and "Next Payout" cards on dashboard, users need to join groups.

**Manually Join Groups:**
1. Navigate to ROSCA section
2. Browse available groups
3. Click "Join Group"
4. Confirm to join

**Auto-Join for Testing (Add this helper):**

```javascript
// Add to page.js for testing
const autoJoinGroupsForTesting = async (userId) => {
  // Pick 2-3 random groups
  const groupsToJoin = [
    INITIAL_ROSCA_GROUPS[0], // Budget Squad - 3k weekly
    INITIAL_ROSCA_GROUPS[10], // Monthly 30k
  ];

  for (const group of groupsToJoin) {
    // Simulate joining the group
    // This would populate jG array with group data
  }
};
```

### Step 3: Simulate Group Activity

For groups to show "Due Soon" and "Next Payout":

**Groups need:**
- `started: true`
- `nextDeduction: <future date>`
- `weeksPaid: <number>`
- `payoutWeek: <number>` (user's position)

**Example joined group data:**
```javascript
{
  id: "wk1",
  n: "Budget Squad",
  a: 3000,
  currency: "NGN",
  started: true,
  weeksPaid: 2,        // Already made 2 payments
  payoutWeek: 4,       // Will get payout in week 4
  nextDeduction: "2025-12-19T00:00:00Z", // Next payment due
  jAt: "2025-12-05T00:00:00Z",          // Joined 1 week ago
  pos: 4,              // Position in rotation
  m: 6                 // Max members
}
```

### Step 4: Test Dashboard Cards

With proper group data, dashboard will show:

**Due Soon Card:**
- Shows earliest `nextDeduction` date
- Amount due
- Group name

**Next Payout Card:**
- Calculates weeks until payout (`payoutWeek - weeksPaid`)
- Shows payout amount (group amount × max members)
- Displays payout date

---

## For 1000 Users Research Setup

### Automated Data Generation

Use the backdating script to create realistic research data:

```bash
node scripts/backdateUserData.js
```

This creates:
- 10 test users with different financial profiles
- 2 months of backdated activity
- ROSCA groups with participation history
- Loan history
- Savings and investment data

### Baseline Survey Data

All new users complete the baseline survey capturing:
- Current financial situation
- Savings and borrowing habits
- ROSCA experience
- Financial goals
- Demographics

This data enables before/after comparison for research.

---

## Quick Test Scenario

1. **Start server:** `npm run dev`
2. **Seed groups:** Browser console → `window.seedGroupsToFirebase()`
3. **Sign up new user:**
   - Name: Test User
   - Email: test@example.com
   - Phone: +234 800 000 0000
   - Currency: NGN
   - Password: password123

4. **Complete baseline survey:**
   - Answer all questions
   - Or skip for now

5. **Join 2-3 groups manually:**
   - Go to ROSCA tab
   - Click "Join Group" on a few groups
   - Confirm with wallet balance

6. **Check dashboard:**
   - View "Your Groups" section
   - See joined groups
   - Note: Groups need to be "started" to show due dates

7. **Start a group (admin function):**
   - Groups auto-start when full (6/6 members)
   - Or use admin panel to manually start

---

## Firebase Security Rules

Make sure Firestore rules allow authenticated access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }

    match /groups/{groupId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /actions/{actionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

**Dashboard shows no data:**
- Seed groups first: `window.seedGroupsToFirebase()`
- Join groups manually from ROSCA tab
- Check browser console for errors

**"Due Soon" card not showing:**
- User must join a group first
- Group must be started (`started: true`)
- Group must have `nextDeduction` date set

**Currency not working:**
- Check user's `selectedCurrency` field
- Verify wallets object has all currencies
- Currency set during signup

**Baseline survey not saving:**
- Check Firebase security rules
- Verify `saveData` function is called
- Check browser console for errors

# Research Data Management Scripts

This directory contains scripts to manage research data for the ROSCA application.

## Prerequisites

1. **Firebase Admin SDK Setup**
   - Download your Firebase service account key from Firebase Console
   - Save it as `serviceAccountKey.json` in the project root
   - Update the `databaseURL` in each script with your Firebase project URL

2. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

## Scripts

### 1. Clear All Data (`clearAllData.js`)

**Purpose:** Delete all existing test data from Firebase to start fresh.

**Usage:**
```bash
node scripts/clearAllData.js
```

**What it does:**
- Deletes ALL user accounts
- Deletes ALL ROSCA groups
- Deletes ALL analytics data
- Deletes ALL savings, investments, and loan records

**Safety:** Requires typing "DELETE ALL DATA" to confirm.

---

### 2. Generate Backdated Data (`backdateUserData.js`)

**Purpose:** Create realistic research data spanning the past 2 months.

**Usage:**
```bash
node scripts/backdateUserData.js
```

**What it creates:**

#### **10 Test Users** with different profiles:
- **High Trust (4 users)**: Active savers, reliable payers
  - Regular borrowers: 2 users
  - Conservative (no loans): 1 user
  - Non-borrowers: 1 user

- **Medium Trust (4 users)**: Moderate activity
  - Regular borrowers: 1 user
  - Occasional borrowers: 2 users
  - Non-borrowers: 1 user

- **Low Trust (2 users)**: Inconsistent payments
  - Regular borrowers with some late payments

#### **Activities Generated** (per user over 2 months):
- ✅ ROSCA group joins (1-3 groups each)
- ✅ Weekly/monthly ROSCA payments
- ✅ Loan applications and repayments
- ✅ Fixed savings deposits
- ✅ Target savings goals
- ✅ Investment activities

#### **ROSCA Groups Created:**
1. Naira Savers Weekly (₦5,000)
2. Dollar Circle Monthly ($50)
3. Pound Partners (£40)
4. Fast Cash Naira (₦10,000)
5. Euro Builders (€60)

---

## Workflow

### Complete Data Reset for Research

1. **Clear existing data:**
   ```bash
   node scripts/clearAllData.js
   ```
   Type `DELETE ALL DATA` when prompted.

2. **Generate new backdated data:**
   ```bash
   node scripts/backdateUserData.js
   ```
   This creates 10 users with 2 months of activity.

3. **Verify the data:**
   - Login as superadmin
   - Navigate to Analytics dashboard
   - Check the following tabs:
     - **Overview**: Total users, groups, loans
     - **Borrowing**: Who borrowed vs who didn't
     - **ROSCA Analysis**: Group participation patterns
     - **Charts**: Visual trends over time

---

## Data Structure

### User Data Format
```javascript
{
  id: "user_xxx",
  name: "Adebayo Johnson",
  phone: "+234 801 234 5678",
  email: "adebayo.johnson@example.com",
  createdAt: "2024-09-29T...",

  wallets: {
    NGN: 35000,
    USD: 75,
    GBP: 50,
    EUR: 60
  },

  jG: [...], // Joined ROSCA groups
  fS: [...], // Fixed savings
  tS: [...], // Target savings
  iV: [...], // Investments
  ln: [...], // Loans

  trustScore: 85,
  creditScore: 750
}
```

### Activity Tracking
All user activities are tracked in the `actions` collection for analytics:
- `rosca_join` - User joins a ROSCA group
- `rosca_payment` - Weekly/monthly contribution
- `loan_taken` - User takes a loan
- `loan_declined` - User declines loan offer
- `fixed_savings` - User creates fixed deposit

---

## Research Insights

After running the backdating script, you'll be able to analyze:

1. **Borrowing Behavior**
   - Who borrowed money vs who didn't
   - Average loan amounts
   - Acceptance/rejection rates
   - Trust score correlations

2. **ROSCA Participation**
   - Group formation patterns
   - Payment consistency
   - Trust building over time
   - Impact on credit scores

3. **Savings Patterns**
   - Fixed vs target savings preferences
   - Savings rates by user trust level
   - Investment adoption

---

## Customization

### Adding More Users

Edit `userProfiles` array in `backdateUserData.js`:
```javascript
const userProfiles = [
  {
    name: 'New User',
    phone: '+234 XXX XXX XXXX',
    trustLevel: 'high', // or 'medium', 'low'
    borrowerType: 'regular' // or 'conservative', 'occasional', 'none'
  },
  // ... add more
];
```

### Adjusting Date Range

Change the date calculation in `getDateDaysAgo()`:
```javascript
// Current: 60 days (2 months)
const joinDate = getDateDaysAgo(60 - index * 2);

// For 3 months:
const joinDate = getDateDaysAgo(90 - index * 3);
```

### Adding New Activity Types

Add to `generateUserActivities()`:
```javascript
activities.push({
  type: 'new_activity_type',
  amount: xxx,
  date: someDate
});
```

---

## Troubleshooting

**Error: "Cannot find module 'firebase-admin'"**
```bash
npm install firebase-admin
```

**Error: "serviceAccountKey.json not found"**
- Download from Firebase Console → Project Settings → Service Accounts
- Save as `serviceAccountKey.json` in project root

**Error: "Permission denied"**
- Check Firebase security rules
- Verify service account has admin privileges

---

## Notes

- ⚠️ **Never commit `serviceAccountKey.json` to version control**
- ✅ Scripts are safe to run multiple times
- 📊 Analytics update in real-time after data generation
- 🔄 Users are created with staggered join dates for realistic trends


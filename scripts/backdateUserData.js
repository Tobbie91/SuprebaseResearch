// scripts/backdateUserData.js - Generate backdated research data
// Usage: node scripts/backdateUserData.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse if already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://suprebaseresearch.firebaseio.com"
  });
}

const db = admin.firestore();

// Helper to generate dates in the past
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Sample user profiles for research
const userProfiles = [
  { name: 'Adebayo Johnson', phone: '+234 801 234 5678', trustLevel: 'high', borrowerType: 'regular' },
  { name: 'Chioma Okafor', phone: '+234 802 345 6789', trustLevel: 'high', borrowerType: 'conservative' },
  { name: 'Emeka Nwankwo', phone: '+234 803 456 7890', trustLevel: 'medium', borrowerType: 'regular' },
  { name: 'Fatima Ibrahim', phone: '+234 804 567 8901', trustLevel: 'high', borrowerType: 'none' },
  { name: 'Grace Adeleke', phone: '+234 805 678 9012', trustLevel: 'medium', borrowerType: 'occasional' },
  { name: 'Hassan Mohammed', phone: '+234 806 789 0123', trustLevel: 'low', borrowerType: 'regular' },
  { name: 'Ifeoma Chukwu', phone: '+234 807 890 1234', trustLevel: 'high', borrowerType: 'none' },
  { name: 'Joseph Obi', phone: '+234 808 901 2345', trustLevel: 'medium', borrowerType: 'occasional' },
  { name: 'Khadija Bello', phone: '+234 809 012 3456', trustLevel: 'high', borrowerType: 'conservative' },
  { name: 'Lekan Adeyemi', phone: '+234 810 123 4567', trustLevel: 'low', borrowerType: 'regular' }
];

// ROSCA group configurations
const roscaGroups = [
  { name: 'Naira Savers Weekly', currency: 'NGN', amount: 5000, members: 6, frequency: 'weekly' },
  { name: 'Dollar Circle Monthly', currency: 'USD', amount: 50, members: 6, frequency: 'monthly' },
  { name: 'Pound Partners', currency: 'GBP', amount: 40, members: 6, frequency: 'weekly' },
  { name: 'Fast Cash Naira', currency: 'NGN', amount: 10000, members: 6, frequency: 'weekly' },
  { name: 'Euro Builders', currency: 'EUR', amount: 60, members: 6, frequency: 'monthly' }
];

async function createBackdatedUser(profile, index) {
  const userId = `user_${Date.now()}_${index}`;
  const joinDate = getDateDaysAgo(60 - index * 2); // Stagger join dates over 2 months

  console.log(`\n👤 Creating user: ${profile.name}`);

  // Create user document
  const userData = {
    id: userId,
    name: profile.name,
    phone: profile.phone,
    email: `${profile.name.toLowerCase().replace(/ /g, '.')}@example.com`,
    createdAt: joinDate.toISOString(),
    kycComplete: profile.trustLevel !== 'low',

    // Wallets
    wallets: {
      NGN: Math.floor(Math.random() * 50000) + 10000,
      USD: Math.floor(Math.random() * 100) + 50,
      GBP: Math.floor(Math.random() * 80) + 30,
      EUR: Math.floor(Math.random() * 90) + 40
    },
    selectedCurrency: 'NGN',

    // Joined groups
    jG: [],

    // Fixed savings
    fS: [],

    // Target savings
    tS: [],

    // Investments
    iV: [],

    // Loans
    ln: [],

    // Trust and credit scores
    trustScore: profile.trustLevel === 'high' ? 85 : profile.trustLevel === 'medium' ? 70 : 55,
    creditScore: profile.trustLevel === 'high' ? 750 : profile.trustLevel === 'medium' ? 650 : 550
  };

  await db.collection('users').doc(userId).set(userData);
  console.log(`   ✓ User created with ID: ${userId}`);

  // Generate activities over 2 months
  await generateUserActivities(userId, profile, joinDate);

  return userId;
}

async function generateUserActivities(userId, profile, joinDate) {
  const activities = [];

  // Join 1-3 ROSCA groups
  const numGroups = profile.trustLevel === 'high' ? 3 : profile.trustLevel === 'medium' ? 2 : 1;
  const selectedGroups = roscaGroups.slice(0, numGroups);

  for (let i = 0; i < selectedGroups.length; i++) {
    const group = selectedGroups[i];
    const joinedDate = getDateDaysAgo(55 - i * 10);

    activities.push({
      type: 'rosca_join',
      groupId: `group_${group.name.replace(/ /g, '_')}`,
      groupName: group.name,
      amount: group.amount,
      currency: group.currency,
      date: joinedDate
    });

    // Generate weekly payments if applicable
    if (group.frequency === 'weekly') {
      const weeksElapsed = Math.floor((new Date() - joinedDate) / (7 * 24 * 60 * 60 * 1000));
      for (let week = 1; week <= Math.min(weeksElapsed, 8); week++) {
        const paymentDate = new Date(joinedDate);
        paymentDate.setDate(paymentDate.getDate() + week * 7);

        activities.push({
          type: 'rosca_payment',
          groupId: `group_${group.name.replace(/ /g, '_')}`,
          amount: group.amount,
          currency: group.currency,
          date: paymentDate,
          onTime: profile.trustLevel !== 'low' || Math.random() > 0.3
        });
      }
    }
  }

  // Generate loan activities based on borrower type
  if (profile.borrowerType === 'regular') {
    // Take 3-4 loans over 2 months
    for (let i = 0; i < 4; i++) {
      const loanDate = getDateDaysAgo(50 - i * 15);
      const loanAmount = Math.floor(Math.random() * 30000) + 10000;

      activities.push({
        type: 'loan_taken',
        amount: loanAmount,
        date: loanDate,
        repaid: i < 3 // Last loan still active
      });
    }
  } else if (profile.borrowerType === 'occasional') {
    // Take 1-2 loans
    const loanDate = getDateDaysAgo(35);
    activities.push({
      type: 'loan_taken',
      amount: Math.floor(Math.random() * 20000) + 15000,
      date: loanDate,
      repaid: true
    });
  } else if (profile.borrowerType === 'conservative') {
    // Declined loans
    activities.push({
      type: 'loan_declined',
      amount: Math.floor(Math.random() * 25000) + 10000,
      date: getDateDaysAgo(40)
    });
  }

  // Generate fixed savings
  if (profile.trustLevel === 'high' || Math.random() > 0.5) {
    const savingsDate = getDateDaysAgo(45);
    const savingsAmount = Math.floor(Math.random() * 50000) + 20000;

    activities.push({
      type: 'fixed_savings',
      amount: savingsAmount,
      duration: '3 months',
      rate: 10,
      date: savingsDate
    });
  }

  console.log(`   ✓ Generated ${activities.length} activities`);

  // Track all activities in analytics
  for (const activity of activities) {
    await trackActivity(userId, profile.name, activity);
  }
}

async function trackActivity(userId, userName, activity) {
  // Build metadata object, excluding undefined values
  const metadata = {};
  if (activity.amount !== undefined) metadata.amount = activity.amount;
  if (activity.currency !== undefined) metadata.currency = activity.currency;
  if (activity.groupId !== undefined) metadata.groupId = activity.groupId;
  if (activity.groupName !== undefined) metadata.groupName = activity.groupName;
  if (activity.duration !== undefined) metadata.duration = activity.duration;
  if (activity.rate !== undefined) metadata.rate = activity.rate;
  if (activity.onTime !== undefined) metadata.onTime = activity.onTime;
  if (activity.repaid !== undefined) metadata.repaid = activity.repaid;

  const actionDoc = {
    userId,
    userName,
    actionType: activity.type,
    timestamp: activity.date.toISOString(),
    metadata
  };

  await db.collection('actions').add(actionDoc);
}

async function generateBackdatedData() {
  console.log('\n🚀 Starting backdated data generation...');
  console.log(`📅 Date range: ${getDateDaysAgo(60).toLocaleDateString()} to ${new Date().toLocaleDateString()}\n`);

  try {
    // Create all users
    const userIds = [];
    for (let i = 0; i < userProfiles.length; i++) {
      const userId = await createBackdatedUser(userProfiles[i], i);
      userIds.push(userId);
    }

    console.log('\n✅ Backdated data generation complete!');
    console.log(`   📊 Total users: ${userIds.length}`);
    console.log(`   📅 Date range: 2 months`);
    console.log('\n💡 You can now view the analytics dashboard to see the research data!\n');

  } catch (error) {
    console.error('\n❌ Error generating data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
generateBackdatedData();

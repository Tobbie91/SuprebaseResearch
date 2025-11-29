// scripts/clearAllData.js - Clear all research data from Firebase
// Usage: node scripts/clearAllData.js

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://suprebaseresearch.firebaseio.com"
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearAllData() {
  console.log('\n⚠️  WARNING: This will delete ALL data from Firebase!');
  console.log('   - All user accounts');
  console.log('   - All ROSCA groups');
  console.log('   - All analytics data');
  console.log('   - All savings and investments');
  console.log('   - All loan records\n');

  rl.question('Are you absolutely sure? Type "DELETE ALL DATA" to confirm: ', async (answer) => {
    if (answer !== 'DELETE ALL DATA') {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      rl.close();
      process.exit(0);
    }

    console.log('\n🗑️  Starting data deletion...\n');

    try {
      // Collections to clear
      const collections = [
        'users',
        'groups',
        'analytics',
        'loanPrompts',
        'actions',
        'roscaPools',
        'fixedSavings',
        'targetSavings',
        'investments'
      ];

      for (const collectionName of collections) {
        console.log(`📦 Deleting collection: ${collectionName}`);
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.get();

        if (snapshot.empty) {
          console.log(`   ✓ ${collectionName} is already empty`);
          continue;
        }

        const batchSize = 500;
        let deletedCount = 0;

        while (true) {
          const batch = db.batch();
          const docs = await collectionRef.limit(batchSize).get();

          if (docs.empty) break;

          docs.forEach(doc => {
            batch.delete(doc.ref);
            deletedCount++;
          });

          await batch.commit();
        }

        console.log(`   ✓ Deleted ${deletedCount} documents from ${collectionName}`);
      }

      console.log('\n✅ All data has been successfully deleted!');
      console.log('\n📝 Next steps:');
      console.log('   1. Register new test users');
      console.log('   2. Run the backdate script to generate historical data');
      console.log('   3. Verify analytics are populating correctly\n');

    } catch (error) {
      console.error('\n❌ Error during deletion:', error);
    } finally {
      rl.close();
      process.exit(0);
    }
  });
}

// Run the script
clearAllData();

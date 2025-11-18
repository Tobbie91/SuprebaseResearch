// MIGRATION SCRIPT: Backfill Existing User Actions to Analytics
// Run this ONCE after deploying the fixed page.js

import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackRoscaJoin, trackLoanTaken, trackFixedSavings, trackTargetSavings, trackInvestment, trackTokenClaim } from './analytics';

/**
 * This script reads existing data from user documents
 * and creates corresponding entries in the actions collection
 * 
 * RUN THIS ONCE to migrate historical data
 */

export const migrateExistingData = async () => {
  console.log("🔄 Starting data migration...");
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migratedActions = 0;
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name || user.id}`);
      
      // 1️⃣ MIGRATE TOKEN CLAIMS
      if (user.hC) {
        await trackTokenClaim(user.id, user.name || "Unknown", true);
        console.log("  ✅ Migrated: Token claim");
        migratedActions++;
      }
      
      // 2️⃣ MIGRATE ROSCA JOINS
      if (user.jG && user.jG.length > 0) {
        for (const group of user.jG) {
          await trackRoscaJoin(user.id, user.name || "Unknown", {
            id: group.id,
            n: group.n,
            a: group.a,
            f: group.f,
            m: group.m,
            pos: group.pos,
            hadBalance: true, // Assume they had balance (they joined)
            tookLoan: false,  // Unknown, assume false for migration
          });
          console.log(`  ✅ Migrated: ROSCA join - ${group.n}`);
          migratedActions++;
          
          // If they made payments, track those too
          if (group.weeksPaid && group.weeksPaid > 0) {
            for (let i = 1; i <= group.weeksPaid; i++) {
              await addDoc(collection(db, 'actions'), {
                userId: user.id,
                userName: user.name || "Unknown",
                userEmail: user.email || "",
                actionType: "rosca_payment",
                metadata: {
                  groupId: group.id,
                  groupName: group.n,
                  amount: group.a,
                  paymentNumber: i,
                  totalPayments: group.m,
                  onTime: true, // Assume on time for migration
                },
                timestamp: serverTimestamp(),
                sessionId: "migration",
                deviceInfo: {},
              });
              console.log(`  ✅ Migrated: ROSCA payment ${i}/${group.weeksPaid}`);
              migratedActions++;
            }
          }
        }
      }
      
      // 3️⃣ MIGRATE LOANS
      if (user.ln && user.ln.length > 0) {
        for (const loan of user.ln) {
          await trackLoanTaken(user.id, user.name || "Unknown", {
            amt: loan.amt,
            pur: loan.pur,
            ir: loan.ir,
            tot: loan.tot,
            groupId: loan.groupId || null,
          });
          console.log(`  ✅ Migrated: Loan - ₦${loan.amt.toLocaleString()}`);
          migratedActions++;
        }
      }
      
      // 4️⃣ MIGRATE FIXED SAVINGS
      if (user.fS && user.fS.length > 0) {
        for (const saving of user.fS) {
          await trackFixedSavings(user.id, user.name || "Unknown", {
            amt: saving.amt,
            dur: saving.dur,
            rt: saving.rt,
            ret: saving.ret,
          });
          console.log(`  ✅ Migrated: Fixed Savings - ₦${saving.amt.toLocaleString()}`);
          migratedActions++;
        }
      }
      
      // 5️⃣ MIGRATE TARGET SAVINGS
      if (user.tS && user.tS.length > 0) {
        for (const target of user.tS) {
          // Track goal creation
          await trackTargetSavings(user.id, user.name || "Unknown", {
            n: target.n,
            tg: target.tg,
            wk: target.wk,
            wks: target.wks,
          }, false);
          console.log(`  ✅ Migrated: Target Goal - ${target.n}`);
          migratedActions++;
          
          // Track contributions made
          if (target.wkD && target.wkD > 0) {
            for (let i = 1; i <= target.wkD; i++) {
              await trackTargetSavings(user.id, user.name || "Unknown", {
                id: target.id,
                n: target.n,
                wk: target.wk,
                cur: target.wk * i, // Estimated cumulative
                tg: target.tg,
                wkD: i,
              }, true);
              console.log(`  ✅ Migrated: Target Contribution ${i}/${target.wkD}`);
              migratedActions++;
            }
          }
        }
      }
      
      // 6️⃣ MIGRATE INVESTMENTS
      if (user.inv && user.inv.length > 0) {
        for (const investment of user.inv) {
          await trackInvestment(user.id, user.name || "Unknown", {
            id: investment.id,
            n: investment.n,
            t: investment.t,
            amt: investment.amt,
            r: investment.r,
            d: investment.d,
            ri: investment.ri,
          });
          console.log(`  ✅ Migrated: Investment - ${investment.n}`);
          migratedActions++;
        }
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log(`✅ MIGRATION COMPLETE!`);
    console.log(`📊 Total users processed: ${users.length}`);
    console.log(`📈 Total actions migrated: ${migratedActions}`);
    console.log("=".repeat(50) + "\n");
    
    return {
      success: true,
      usersProcessed: users.length,
      actionsMigrated: migratedActions,
    };
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// HOW TO RUN THIS:
// 1. Add this file to your project as: lib/migrate.js
// 2. Create a temporary admin page or button
// 3. Call migrateExistingData() ONCE
// 4. Check Firebase console to verify actions were created
// 5. Check analytics dashboard - numbers should appear!

export default migrateExistingData;
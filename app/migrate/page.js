// app/migrate/page.js - ONE-TIME MIGRATION PAGE
"use client";
import React, { useState } from 'react';
import { migrateExistingData } from '@/lib/migrate';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function MigrationPage() {
  const [status, setStatus] = useState('idle'); // idle, running, success, error
  const [result, setResult] = useState(null);

  const runMigration = async () => {
    const confirmed = confirm(
      "⚠️ MIGRATION WARNING\n\n" +
      "This will backfill all existing user data into the analytics collection.\n\n" +
      "• Only run this ONCE\n" +
      "• Takes 1-2 minutes\n" +
      "• Cannot be undone (but safe)\n\n" +
      "Ready to proceed?"
    );

    if (!confirmed) return;

    setStatus('running');
    console.log("🚀 Starting migration...");

    try {
      const migrationResult = await migrateExistingData();
      
      if (migrationResult.success) {
        setStatus('success');
        setResult(migrationResult);
        console.log("✅ Migration completed successfully!");
      } else {
        setStatus('error');
        setResult(migrationResult);
        console.error("❌ Migration failed:", migrationResult.error);
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: error.message });
      console.error("❌ Migration error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Data Migration</h1>
          <p className="text-gray-600 mb-8">
            Backfill existing user actions into analytics collection
          </p>

          {/* Idle State */}
          {status === 'idle' && (
            <>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-2">⚠️ Important Notice</h3>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li>• This migration should be run <strong>ONCE</strong> after deploying the fixed code</li>
                      <li>• It will read all existing user data and create entries in the analytics collection</li>
                      <li>• This process takes 1-2 minutes depending on user count</li>
                      <li>• After completion, your analytics dashboard will show real historical data</li>
                      <li>• <strong>DO NOT run this multiple times</strong> (it will create duplicate entries)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-3">What Will Be Migrated:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Token Claims</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>ROSCA Joins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>ROSCA Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Loans Taken</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Fixed Savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Target Savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Target Contributions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Investments</span>
                  </div>
                </div>
              </div>

              <button
                onClick={runMigration}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition"
              >
                🚀 Run Migration Now
              </button>
            </>
          )}

          {/* Running State */}
          {status === 'running' && (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-xl font-bold mb-2">Migration in Progress...</h3>
              <p className="text-gray-600">
                Reading user data and creating analytics entries
              </p>
              <p className="text-sm text-gray-500 mt-4">
                This may take 1-2 minutes. Please don't close this page.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && result && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                ✅ Migration Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                All existing data has been successfully migrated
              </p>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-gray-600">Users Processed</p>
                    <p className="text-3xl font-bold text-green-900">{result.usersProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Actions Migrated</p>
                    <p className="text-3xl font-bold text-green-900">{result.actionsMigrated}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900 font-semibold mb-2">✨ Next Steps:</p>
                <ol className="text-sm text-blue-800 text-left space-y-1">
                  <li>1. Go to Analytics Dashboard</li>
                  <li>2. Click "Refresh" button</li>
                  <li>3. You should see real numbers now!</li>
                  <li>4. Check Firebase Console → actions collection</li>
                  <li>5. You can delete this migration page</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <a
                  href="/admin"
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  View Analytics Dashboard
                </a>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Check Firebase Console
                </a>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && result && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                ❌ Migration Failed
              </h3>
              <p className="text-gray-600 mb-6">
                An error occurred during migration
              </p>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 text-left">
                <p className="text-sm font-bold text-red-900 mb-2">Error Details:</p>
                <code className="text-xs text-red-800 break-all">
                  {result.error || "Unknown error"}
                </code>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-900 font-semibold mb-2">Troubleshooting:</p>
                <ul className="text-sm text-yellow-800 text-left space-y-1">
                  <li>• Check Firebase console for error logs</li>
                  <li>• Verify Firestore rules allow writes to "actions" collection</li>
                  <li>• Ensure you're logged in as admin</li>
                  <li>• Check browser console for detailed error</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setStatus('idle');
                  setResult(null);
                }}
                className="w-full py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 Tip: After successful migration, you can safely delete this page</p>
        </div>
      </div>
    </div>
  );
}
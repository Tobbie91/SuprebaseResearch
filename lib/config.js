// lib/config.js
// All static configuration and data

export const colors = {
    primary: '#2D9B7B',
    primaryDark: '#1F6B56',
    primaryLight: '#A8E6CF',
    white: '#FFFFFF',
    dark: '#1A202C',
    lightGray: '#F7FAFC',
    gray: '#718096',
    warning: '#F6AD55',
    danger: '#FC8181'
  };
  
  // REAL ROSCA GROUPS - 30+ groups for 200 users
  export const INITIAL_ROSCA_GROUPS = [
    // Weekly 5k Groups
    {id: 'wk1', name: 'Weekly Hustlers', amount: 5000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 2, admin: 'Admin Tunde', completionRate: 92},
    {id: 'wk2', name: 'Fast Track Savers', amount: 5000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 3, admin: 'Admin Chioma', completionRate: 95},
    {id: 'wk3', name: 'Quick Returns', amount: 5000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 1, admin: 'Admin Yemi', completionRate: 88},
    {id: 'wk4', name: 'Side Hustle Gang', amount: 5000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 4, admin: 'Admin Bola', completionRate: 90},
    {id: 'wk5', name: 'Weekend Warriors', amount: 5000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 0, admin: 'Admin Tunde', completionRate: 93},
    
    // Weekly 10k Groups
    {id: 'wk6', name: 'Big Moves Weekly', amount: 10000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 1, admin: 'Admin Chioma', completionRate: 91},
    {id: 'wk7', name: 'High Rollers', amount: 10000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 2, admin: 'Admin Yemi', completionRate: 89},
    {id: 'wk8', name: 'Power Savers', amount: 10000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 0, admin: 'Admin Bola', completionRate: 94},
    {id: 'wk9', name: 'Goal Getters', amount: 10000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 3, admin: 'Admin Tunde', completionRate: 87},
    
    // Weekly 3k Groups (Budget friendly)
    {id: 'wk10', name: 'Budget Squad', amount: 3000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 2, admin: 'Admin Chioma', completionRate: 96},
    {id: 'wk11', name: 'Small Steps', amount: 3000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 1, admin: 'Admin Yemi', completionRate: 93},
    {id: 'wk12', name: 'Starter Circle', amount: 3000, frequency: 'Weekly', duration: '6 weeks', maxMembers: 6, currentMembers: 0, admin: 'Admin Bola', completionRate: 91},
    
    // Monthly 30k Groups
    {id: 'mn1', name: 'Monthly 30K Squad', amount: 30000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 2, admin: 'Admin Tunde', completionRate: 90},
    {id: 'mn2', name: 'Salary Savers', amount: 30000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 1, admin: 'Admin Chioma', completionRate: 92},
    {id: 'mn3', name: 'Smart Money', amount: 30000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 3, admin: 'Admin Yemi', completionRate: 88},
    {id: 'mn4', name: 'Wealth Builders', amount: 30000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 0, admin: 'Admin Bola', completionRate: 93},
    
    // Monthly 50k Groups
    {id: 'mn5', name: 'Monthly 50K Club', amount: 50000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 2, admin: 'Admin Tunde', completionRate: 91},
    {id: 'mn6', name: 'Business Builders', amount: 50000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 1, admin: 'Admin Chioma', completionRate: 89},
    {id: 'mn7', name: 'Elite Savers', amount: 50000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 0, admin: 'Admin Yemi', completionRate: 94},
    
    // Monthly 100k Groups (Premium)
    {id: 'mn8', name: 'Century Club', amount: 100000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 1, admin: 'Admin Bola', completionRate: 90},
    {id: 'mn9', name: 'Big League', amount: 100000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 0, admin: 'Admin Tunde', completionRate: 92},
    
    // Monthly 20k Groups
    {id: 'mn10', name: 'Young Professionals', amount: 20000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 2, admin: 'Admin Chioma', completionRate: 95},
    {id: 'mn11', name: 'Steady Growth', amount: 20000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 1, admin: 'Admin Yemi', completionRate: 91},
    {id: 'mn12', name: 'Future Fund', amount: 20000, frequency: 'Monthly', duration: '6 months', maxMembers: 6, currentMembers: 3, admin: 'Admin Bola', completionRate: 93},
  ];
  
  // INVESTMENTS
  export const INVESTMENTS = [
    {
      id: 'sf1', 
      name: 'SupreFarm - Rice Production', 
      type: 'Agriculture', 
      returns: '18%', 
      duration: '6 months', 
      minInvest: 50000, 
      risk: 'Low',
      description: 'Climate-smart rice farming with guaranteed returns. Harvest-backed investment.'
    },
    {
      id: 'sf2', 
      name: 'SupreFarm - Maize Cultivation', 
      type: 'Agriculture', 
      returns: '15%', 
      duration: '4 months', 
      minInvest: 30000, 
      risk: 'Low',
      description: 'Sustainable maize production with predictable yields.'
    },
    {
      id: 'sf3', 
      name: 'SupreFarm - Poultry', 
      type: 'Agriculture', 
      returns: '20%', 
      duration: '3 months', 
      minInvest: 40000, 
      risk: 'Low',
      description: 'Fast-cycle poultry farming with high returns.'
    },
    {
      id: 'ab1', 
      name: 'Airbnb Co-hosting', 
      type: 'Real Estate', 
      returns: '25%', 
      duration: '12 months', 
      minInvest: 100000, 
      risk: 'Medium',
      description: 'Share in Airbnb property revenue. Monthly payouts.'
    },
    {
      id: 'ab2', 
      name: 'Short Stay Property Fund', 
      type: 'Real Estate', 
      returns: '30%', 
      duration: '12 months', 
      minInvest: 200000, 
      risk: 'Medium',
      description: 'Own a share of vacation rental properties.'
    },
    {
      id: 'tb1', 
      name: 'Treasury Bills', 
      type: 'Government', 
      returns: '12%', 
      duration: '3 months', 
      minInvest: 10000, 
      risk: 'Very Low',
      description: 'Government-backed securities. Zero risk.'
    },
    {
      id: 'tech1', 
      name: 'Tech Startup Fund', 
      type: 'Equity', 
      returns: '40%', 
      duration: '12 months', 
      minInvest: 150000, 
      risk: 'High',
      description: 'Invest in Nigerian tech startups. High risk, high reward.'
    },
  ];
  
  // FIXED SAVINGS PLANS
  export const FIXED_SAVINGS_PLANS = [
    {duration: '3 months', rate: 8, minAmount: 10000, label: '3 Months - 8% Returns'},
    {duration: '6 months', rate: 12, minAmount: 25000, label: '6 Months - 12% Returns'},
    {duration: '9 months', rate: 15, minAmount: 50000, label: '9 Months - 15% Returns'},
    {duration: '12 months', rate: 18, minAmount: 50000, label: '12 Months - 18% Returns'},
  ];
  
  // LOAN SETTINGS
  export const LOAN_CONFIG = {
    interestRate: 0.05, // 5%
    maxLoanAmount: 500000,
    minLoanAmount: 5000,
    purposes: [
      'ROSCA Contribution',
      'Emergency',
      'Business',
      'Education',
      'Medical',
      'Other'
    ]
  };
// hooks/useStatutorySettings.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Default settings fallback (keep this outside the hook)
// hooks/useStatutorySettings.js
const getDefaultSettings = () => ({
  payeBrackets: [
    { threshold: 24000, rate: 0.10 },
    { threshold: 32333, rate: 0.25 },
    { threshold: 500000, rate: 0.30 },
    { threshold: 800000, rate: 0.325 },
    { threshold: 999999999, rate: 0.35 } // Replaced Infinity
  ],
  personalRelief: 2400,
  nssfLowerLimit: 8000,
  nssfUpperLimit: 72000,
  nssfRate: 0.06,
  nssfMaximum: 4320,
  nhifRates: [
    { threshold: 5999, amount: 150 },
    { threshold: 7999, amount: 300 },
    { threshold: 11999, amount: 400 },
    { threshold: 14999, amount: 500 },
    { threshold: 19999, amount: 600 },
    { threshold: 24999, amount: 750 },
    { threshold: 29999, amount: 850 },
    { threshold: 34999, amount: 900 },
    { threshold: 39999, amount: 950 },
    { threshold: 44999, amount: 1000 },
    { threshold: 49999, amount: 1100 },
    { threshold: 59999, amount: 1200 },
    { threshold: 69999, amount: 1300 },
    { threshold: 79999, amount: 1400 },
    { threshold: 89999, amount: 1500 },
    { threshold: 99999, amount: 1600 }
  ],
  nhifDefault: 1700,
  housingLevyRate: 0.015,
  currency: 'KSh',
  effectiveDate: new Date().toISOString().split('T')[0]
});

// Create the hook
const useStatutorySettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestSettings();
  }, []);

  const loadLatestSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('statutory_settings')
        .select('settings')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSettings(data.settings);
      } else {
        // Fallback to default settings
        setSettings(getDefaultSettings());
      }
    } catch (error) {
      console.error('Error loading statutory settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePAYE = (taxableIncome) => {
    if (!settings) return 0;
    
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (let i = 0; i < settings.payeBrackets.length; i++) {
      const bracket = settings.payeBrackets[i];
      const prevBracket = i > 0 ? settings.payeBrackets[i - 1] : { threshold: 0 };
      
      if (remainingIncome > 0) {
        const bracketAmount = i === 0 
          ? Math.min(remainingIncome, bracket.threshold)
          : Math.min(remainingIncome, bracket.threshold - prevBracket.threshold);
        
        tax += bracketAmount * bracket.rate;
        remainingIncome -= bracketAmount;
      }
    }

    // Apply personal relief
    tax = Math.max(0, tax - settings.personalRelief);
    
    return tax;
  };

  const calculateNSSF = (grossSalary) => {
    if (!settings) return 0;

    const tier1 = Math.min(grossSalary, settings.nssfLowerLimit) * settings.nssfRate;
    let tier2 = 0;

    if (grossSalary > settings.nssfLowerLimit) {
      const tier2Salary = Math.min(
        grossSalary - settings.nssfLowerLimit, 
        settings.nssfUpperLimit - settings.nssfLowerLimit
      );
      tier2 = tier2Salary * settings.nssfRate;
    }

    return Math.min(tier1 + tier2, settings.nssfMaximum);
  };

  const calculateNHIF = (grossPay) => {
    if (!settings) return 0;

    for (const rate of settings.nhifRates) {
      if (grossPay <= rate.threshold) {
        return rate.amount;
      }
    }
    
    return settings.nhifDefault;
  };

  const calculateHousingLevy = (grossSalary, hasTaxPIN) => {
    if (!settings || !hasTaxPIN) return 0;
    return grossSalary * settings.housingLevyRate;
  };

  return {
    settings,
    isLoading,
    calculatePAYE,
    calculateNSSF,
    calculateNHIF,
    calculateHousingLevy,
    reloadSettings: loadLatestSettings
  };
};

export default useStatutorySettings;
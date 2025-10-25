// StatutorySettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Save, X, DollarSign, Calculator, Users, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const StatutorySettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    // PAYE Settings
    payeBrackets: [
      { threshold: 24000, rate: 0.10 },
      { threshold: 32333, rate: 0.25 },
      { threshold: 500000, rate: 0.30 },
      { threshold: 800000, rate: 0.325 },
      { threshold: Infinity, rate: 0.35 }
    ],
    personalRelief: 2400,
    
    // NSSF Settings
    nssfLowerLimit: 8000,
    nssfUpperLimit: 72000,
    nssfRate: 0.06,
    nssfMaximum: 4320,
    
    // NHIF Settings
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
    
    // Housing Levy
    housingLevyRate: 0.015,
    
    // General
    currency: 'KSh',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from database
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('statutory_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('statutory_settings')
        .insert([
          {
            settings,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Statutory settings updated successfully!');
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updatePayeBracket = (index, field, value) => {
    const updatedBrackets = [...settings.payeBrackets];
    updatedBrackets[index] = { ...updatedBrackets[index], [field]: parseFloat(value) };
    updateSettings('payeBrackets', updatedBrackets);
  };

  const updateNhifRate = (index, field, value) => {
    const updatedRates = [...settings.nhifRates];
    updatedRates[index] = { ...updatedRates[index], [field]: parseFloat(value) };
    updateSettings('nhifRates', updatedRates);
  };

  const addPayeBracket = () => {
    const newBrackets = [...settings.payeBrackets];
    newBrackets.splice(newBrackets.length - 1, 0, { threshold: 0, rate: 0 });
    updateSettings('payeBrackets', newBrackets);
  };

  const removePayeBracket = (index) => {
    if (settings.payeBrackets.length <= 2) {
      toast.error('Must have at least 2 tax brackets');
      return;
    }
    const newBrackets = settings.payeBrackets.filter((_, i) => i !== index);
    updateSettings('payeBrackets', newBrackets);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            
            Statutory Calculations Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* PAYE Tax Settings */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              
              PAYE Tax Brackets
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Relief
                  </label>
                  <input
                    type="number"
                    value={settings.personalRelief}
                    onChange={(e) => updateSettings('personalRelief', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {settings.payeBrackets.map((bracket, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Threshold {index === settings.payeBrackets.length - 1 ? '(Maximum)' : ''}
                      </label>
                      <input
                        type="number"
                        value={bracket.threshold === Infinity ? '' : bracket.threshold}
                        onChange={(e) => updatePayeBracket(index, 'threshold', 
                          index === settings.payeBrackets.length - 1 ? Infinity : parseFloat(e.target.value))}
                        placeholder={index === settings.payeBrackets.length - 1 ? 'Maximum' : 'Threshold'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={index === settings.payeBrackets.length - 1}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={bracket.rate * 100}
                        onChange={(e) => updatePayeBracket(index, 'rate', parseFloat(e.target.value) / 100)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {index !== settings.payeBrackets.length - 1 && (
                      <button
                        onClick={() => removePayeBracket(index)}
                        className="mt-6 px-2 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={addPayeBracket}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors duration-200"
              >
                <span className="text-lg">+</span> Add Tax Bracket
              </button>
            </div>
          </div>

          {/* NSSF Settings */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        
              NSSF Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lower Limit
                </label>
                <input
                  type="number"
                  value={settings.nssfLowerLimit}
                  onChange={(e) => updateSettings('nssfLowerLimit', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upper Limit
                </label>
                <input
                  type="number"
                  value={settings.nssfUpperLimit}
                  onChange={(e) => updateSettings('nssfUpperLimit', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.nssfRate * 100}
                  onChange={(e) => updateSettings('nssfRate', parseFloat(e.target.value) / 100)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Contribution
                </label>
                <input
                  type="number"
                  value={settings.nssfMaximum}
                  onChange={(e) => updateSettings('nssfMaximum', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* NHIF Settings */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              
              NHIF Rates
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {settings.nhifRates.map((rate, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Salary Threshold</label>
                    <input
                      type="number"
                      value={rate.threshold}
                      onChange={(e) => updateNhifRate(index, 'threshold', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Deduction Amount</label>
                    <input
                      type="number"
                      value={rate.amount}
                      onChange={(e) => updateNhifRate(index, 'amount', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Amount (Above {settings.nhifRates[settings.nhifRates.length - 1]?.threshold || 0})
                </label>
                <input
                  type="number"
                  value={settings.nhifDefault}
                  onChange={(e) => updateSettings('nhifDefault', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* Housing Levy Settings */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              
              Housing Levy Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Levy Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.housingLevyRate * 100}
                  onChange={(e) => updateSettings('housingLevyRate', parseFloat(e.target.value) / 100)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={settings.effectiveDate}
                  onChange={(e) => updateSettings('effectiveDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-400 flex items-center gap-2 disabled:opacity-100 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatutorySettingsModal;
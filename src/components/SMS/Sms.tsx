import { useState, useMemo } from 'react';
import { 
  MessageSquare, Send, Upload, FileText, CreditCard, 
  CheckCircle, AlertCircle, Info, Package, Receipt,
  Building, User, Phone, Mail, Download
} from 'lucide-react';

// SMS Package types
type SMSPackage = {
  id: string;
  name: string;
  smsCount: number;
  cost: number;
  costPerSMS: number;
  popular?: boolean;
};

// Sender ID types
type SenderIDType = 'zirahr' | 'custom';

// SMS Stats types
type SMSStats = {
  sentThisMonth: number;
  remaining: number;
  deliveryRate: number;
  failed: number;
};

// Main SMS Center Component
export function SMSCenter() {
  const [senderType, setSenderType] = useState<SenderIDType>('zirahr');
  const [selectedPackage, setSelectedPackage] = useState<SMSPackage | null>(null);
  const [businessCert, setBusinessCert] = useState<File | null>(null);
  const [requestLetter, setRequestLetter] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SMS Packages
  const smsPackages: SMSPackage[] = [
    {
      id: '1',
      name: 'Starter',
      smsCount: 30000,
      cost: 18000, // 30,000 * 0.6
      costPerSMS: 0.6,
    },
    {
      id: '2',
      name: 'Professional',
      smsCount: 60000,
      cost: 36000, // 60,000 * 0.6
      costPerSMS: 0.6,
      popular: true,
    },
    {
      id: '3',
      name: 'Enterprise',
      smsCount: 100000,
      cost: 60000, // 100,000 * 0.6
      costPerSMS: 0.6,
    },
  ];

  // Mock SMS Stats
  const smsStats: SMSStats = {
    sentThisMonth: 1250,
    remaining: 28750,
    deliveryRate: 94.2,
    failed: 75,
  };

  // Handle file upload
  const handleFileUpload = (setter: React.Dispatch<React.SetStateAction<File | null>>) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setter(file);
      }
    };

  // Handle package selection
  const handlePackageSelect = (pkg: SMSPackage) => {
    setSelectedPackage(pkg);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (senderType === 'custom' && (!businessCert || !requestLetter)) {
      alert('Please upload both required documents for custom sender ID');
      return;
    }

    if (!selectedPackage) {
      alert('Please select an SMS package');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('SMS package purchase request submitted successfully!');
    }, 2000);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        
      </div>

      {/* SMS Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-normal mb-1">Sent This Month</p>
              <p className="text-2xl font-normal text-slate-900">{smsStats.sentThisMonth.toLocaleString()}</p>
            </div>
            <Send className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-normal mb-1">Remaining SMS</p>
              <p className="text-2xl font-normal text-slate-900">{smsStats.remaining.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-5 h-5 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-normal mb-1">Delivery Rate</p>
              <p className="text-2xl font-normal text-slate-900">{smsStats.deliveryRate}%</p>
            </div>
            <CheckCircle className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-normal mb-1">Failed SMS</p>
              <p className="text-2xl font-normal text-slate-900">{smsStats.failed}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender ID Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-normal text-slate-900 mb-4">Sender ID Configuration</h3>
          
          <div className="space-y-4">
            {/* Sender Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-normal text-slate-700">Choose Sender ID Type</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSenderType('zirahr')}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    senderType === 'zirahr' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      senderType === 'zirahr' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`} />
                    <div>
                      <p className="text-sm font-normal text-slate-900">ZiraHR Sender ID</p>
                      <p className="text-xs text-slate-500 mt-1">Use "ZiraHR" as your sender ID</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSenderType('custom')}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    senderType === 'custom' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      senderType === 'custom' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`} />
                    <div>
                      <p className="text-sm font-normal text-slate-900">Custom Sender ID</p>
                      <p className="text-xs text-slate-500 mt-1">Use your business name</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Sender ID Requirements */}
            {senderType === 'custom' && (
              <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-normal text-amber-800">Custom Sender ID Requirements</p>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-amber-700">
                      Certificate of Business Registration
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload(setBusinessCert)}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center cursor-pointer hover:bg-amber-25 transition-all">
                          <Upload className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                          <p className="text-xs text-amber-700 font-normal">
                            {businessCert ? businessCert.name : 'Upload Business Certificate'}
                          </p>
                          <p className="text-xs text-amber-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                        </div>
                      </label>
                      {businessCert && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-amber-700">
                      Formal Request Letter
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload(setRequestLetter)}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center cursor-pointer hover:bg-amber-25 transition-all">
                          <FileText className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                          <p className="text-xs text-amber-700 font-normal">
                            {requestLetter ? requestLetter.name : 'Upload Request Letter'}
                          </p>
                          <p className="text-xs text-amber-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                        </div>
                      </label>
                      {requestLetter && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-amber-600 font-normal">
                  <p>• The request letter should be on official letterhead</p>
                  <p>• Clearly state the desired sender ID name</p>
                  <p>• Include authorized signatory details</p>
                </div>
              </div>
            )}

            {/* Current Sender ID Display */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 font-normal">Current Sender ID</p>
              <p className="text-sm font-normal text-slate-900 mt-1">
                {senderType === 'zirahr' ? 'ZiraHR' : 'Custom (Pending Approval)'}
              </p>
            </div>
          </div>
        </div>

        {/* SMS Packages */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-normal text-slate-900 mb-4">SMS Packages</h3>
          <p className="text-sm text-slate-600 font-normal mb-6">
            Cost: {formatCurrency(0.6)} per SMS
          </p>

          <div className="space-y-4">
            {smsPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${pkg.popular ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPackage?.id === pkg.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-normal text-slate-900">{pkg.name}</p>
                        {pkg.popular && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-normal">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {pkg.smsCount.toLocaleString()} SMS
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-normal text-slate-900">{formatCurrency(pkg.cost)}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(pkg.costPerSMS)}/SMS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Information */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-normal text-slate-900">Payment Instructions</p>
            </div>
            
            <div className="space-y-2 text-xs text-slate-600 font-normal">
              <div className="flex items-center justify-between">
                <span>Paybill Number:</span>
                <span className="font-medium">4157991</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Number:</span>
                <span className="font-medium">Your Phone Number</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Amount:</span>
                <span className="font-medium">
                  {selectedPackage ? formatCurrency(selectedPackage.cost) : 'Select package'}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-normal">
                Your account will be activated automatically once payment is confirmed
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedPackage || isSubmitting || (senderType === 'custom' && (!businessCert || !requestLetter))}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-normal transition-all text-sm"
          >
            {isSubmitting ? 'Processing...' : 'Proceed with Selected Package'}
          </button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-normal text-slate-900 mb-4">Important Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-normal text-slate-900">SMS Delivery</p>
            </div>
            <ul className="text-xs text-slate-600 font-normal space-y-1">
              <li>• SMS are delivered instantly to recipients</li>
              <li>• Delivery reports available in real-time</li>
              <li>• Failed SMS are automatically retried</li>
              <li>• No expiry on purchased SMS credits</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-normal text-slate-900">Requirements</p>
            </div>
            <ul className="text-xs text-slate-600 font-normal space-y-1">
              <li>• Custom sender IDs require 2-3 business days for approval</li>
              <li>• Sender ID must be 11 characters or less</li>
              <li>• No promotional content in sender ID</li>
              <li>• Valid business registration required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { GiPlantSeed } from 'react-icons/gi';
import { MdMedicalServices } from 'react-icons/md';
import { Button } from '../components/Button';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen">
      {/* Center the whole page content */}
      <div className="px-6 py-6" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Stack sections with some vertical space */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mt-4 mb-3">
              Health Savings Account
            </h1>
            <p className="text-3xl font-extrabold text-gray-900">
              Maximize your health, minimize your taxes
            </p>
          </div>

          {/* Cards (even, centered) */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl shadow-lg border p-8 card-hover" style={{ minHeight: 360 }}>
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center text-blue-600">
                    <FaShieldAlt size={28} />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">Tax-Deductible Contributions</h3>
                  <p className="text-gray-600" style={{ maxWidth: 300 }}>
                    Lower your taxable income on every dollar you contribute.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl shadow-lg border p-8 card-hover" style={{ minHeight: 360 }}>
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center text-blue-600">
                    <GiPlantSeed size={30} />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">Tax-Free Growth</h3>
                  <p className="text-gray-600" style={{ maxWidth: 300 }}>
                    Watch your savings grow without paying taxes on investment earnings.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl shadow-lg border p-8 card-hover" style={{ minHeight: 360 }}>
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center text-blue-600">
                    <MdMedicalServices size={30} />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">Tax-Free Withdrawals</h3>
                  <p className="text-gray-600" style={{ maxWidth: 300 }}>
                    Pay for qualified medical expenses with tax-free funds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md btn-animate"
              style={{ minWidth: 220 }}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #F3F7FF 0%, #FFFFFF 40%, #E6F1FE 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Center hero vertically */}
        <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center w-full">
          {/* Title + message (per your spec) */}
          <div className="text-center mb-10">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-4">Health Savings Account</h1>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-800">Maximize your health, minimize your taxes</p>
          </div>

        {/* Features */}
          <div className="px-2 w-full">
            <div className="max-w-6xl mx-auto grid grid-cols-3 md:grid-cols-1 gap-16 justify-items-center items-stretch">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-12 py-14 w-full" style={{ maxWidth: 440, minHeight: 260 }}>
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><FaShieldAlt size={32} /></div>
                  <div className="font-semibold text-gray-900">Tax‑Deductible Contributions:</div>
                  <div className="text-gray-600 text-sm max-w-[300px]">Lower your taxable income in every dollar you contribute.</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-12 py-14 w-full" style={{ maxWidth: 440, minHeight: 260 }}>
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><GiPlantSeed size={34} /></div>
                  <div className="font-semibold text-gray-900">Tax‑Free Growth</div>
                  <div className="text-gray-600 text-sm max-w-[300px]">Watch your savings grow without paying taxes or investment earnings</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-12 py-14 w-full" style={{ maxWidth: 440, minHeight: 260 }}>
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><MdMedicalServices size={34} /></div>
                  <div className="font-semibold text-gray-900">Tax‑Free Withdrawals:</div>
                  <div className="text-gray-600 text-sm max-w-[300px]">Pay for qualified medical expenses with tax‑free funds</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center mt-28">
          <Button size="lg" onClick={onGetStarted} className="px-10 py-3 rounded-full bg-blue-900 hover:bg-gray-800 text-white shadow-md " style={{ minWidth: 220 }}>
            Create Account
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

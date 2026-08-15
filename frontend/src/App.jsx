import React, { useState } from 'react';
import VehicleForm from './components/VehicleForm';
import SymptomReportForm from './components/SymptomReportForm';

function App() {
  const [currentStep, setCurrentStep] = useState('vehicle'); // 'vehicle' | 'symptom'
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelected = (vehicleData) => {
    setSelectedVehicle(vehicleData);
    setCurrentStep('symptom');
  };

  const handleBackToVehicle = () => {
    setCurrentStep('vehicle');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fiatGray to-gray-200 overflow-hidden">
      {currentStep === 'vehicle' ? (
        <VehicleForm onNext={handleVehicleSelected} />
      ) : (
        <SymptomReportForm
          vehicleData={selectedVehicle}
          onBack={handleBackToVehicle}
        />
      )}
    </div>
  );
}

export default App;

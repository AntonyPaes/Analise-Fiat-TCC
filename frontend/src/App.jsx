import React, { useState } from 'react';
import VehicleForm from './components/VehicleForm';
import SymptomReportForm from './components/SymptomReportForm';
import DiagnosisResult from './components/DiagnosisResult';

function App() {
  const [currentStep, setCurrentStep] = useState('vehicle'); // 'vehicle' | 'symptom' | 'diagnosis'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [diagnosisResults, setDiagnosisResults] = useState([]);

  const handleVehicleSelected = (vehicleData) => {
    setSelectedVehicle(vehicleData);
    setCurrentStep('symptom');
  };

  const handleBackToVehicle = () => {
    setCurrentStep('vehicle');
  };

  const handleDiagnosisComplete = (results) => {
    setDiagnosisResults(results);
    setCurrentStep('diagnosis');
  };

  const handleBackToSymptom = () => {
    setCurrentStep('symptom');
  };

  const handleBackToStart = () => {
    setSelectedVehicle(null);
    setDiagnosisResults([]);
    setCurrentStep('vehicle');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fiatGray to-gray-200 overflow-hidden">
      {currentStep === 'vehicle' && (
        <VehicleForm onNext={handleVehicleSelected} />
      )}
      {currentStep === 'symptom' && (
        <SymptomReportForm
          vehicleData={selectedVehicle}
          onBack={handleBackToVehicle}
          onNext={handleDiagnosisComplete}
        />
      )}
      {currentStep === 'diagnosis' && (
        <DiagnosisResult
          vehicleData={selectedVehicle}
          diagnosisData={diagnosisResults}
          onBackToSymptom={handleBackToSymptom}
          onBackToStart={handleBackToStart}
        />
      )}
    </div>
  );
}

export default App;


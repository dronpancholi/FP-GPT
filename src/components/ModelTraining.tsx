import React, { useState, useEffect } from 'react';
import { Brain, Save, Trash2, Play } from 'lucide-react';
import { DataManager } from '../services/ai/training/dataManager';
import { LocalAI } from '../services/ai/localAI';
import { TrainingData } from '../types';

const dataManager = new DataManager();
const localAI = new LocalAI();

export function ModelTraining() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    setTrainingData(dataManager.getData());
  }, []);

  const handleAddData = () => {
    if (newInput.trim() && newOutput.trim()) {
      dataManager.addData(newInput, newOutput);
      setTrainingData(dataManager.getData());
      setNewInput('');
      setNewOutput('');
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      await localAI.train();
    } finally {
      setIsTraining(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all training data?')) {
      dataManager.clear();
      setTrainingData([]);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Model Training</h2>
        
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder="Input text"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={newOutput}
            onChange={(e) => setNewOutput(e.target.value)}
            placeholder="Expected output"
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Save size={16} />
              Add Data
            </button>
            <button
              onClick={handleTrain}
              disabled={isTraining || trainingData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <Play size={16} />
              {isTraining ? 'Training...' : 'Train Model'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Training Data ({trainingData.length} items)</h3>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-3 py-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {trainingData.map((data, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium">Input: {data.input}</div>
                <div className="text-sm text-gray-600">Output: {data.output}</div>
                <div className="text-xs text-gray-400">
                  {new Date(data.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
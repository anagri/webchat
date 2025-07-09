import React from 'react';
import { useModels } from '../hooks/useModels';
import type { ModelSelectorProps } from '../types';

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const { models, loading, error } = useModels();

  const getModelDisplayName = (modelId: string): string => {
    if (modelId === 'test-model') return 'Test Model';
    if (modelId.includes('Llama')) return 'Llama 3.1 8B';
    if (modelId.includes('Phi')) return 'Phi 4 Mini';
    
    // Extract a readable name from the model ID
    const parts = modelId.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split(':')[0] || modelId;
  };

  if (loading) {
    return (
      <div className="model-selector">
        <label htmlFor="model-select" className="model-label">
          Model:
        </label>
        <div className="model-loading">Loading models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-selector">
        <label htmlFor="model-select" className="model-label">
          Model:
        </label>
        <div className="model-error">
          Error loading models. Using fallback.
        </div>
      </div>
    );
  }

  return (
    <div className="model-selector">
      <label htmlFor="model-select" className="model-label">
        Model:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        className="model-select"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {getModelDisplayName(model.id)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 
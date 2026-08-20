'use client';

import { Topic } from '@/lib/types';
import { Check, AlertCircle, CheckSquare, Square } from 'lucide-react';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopicIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function TopicSelector({
  topics,
  selectedTopicIds,
  onChange,
  disabled = false,
}: TopicSelectorProps) {
  const allTopicIds = topics.map((t) => t.id);
  const isAllSelected = topics.length > 0 && selectedTopicIds.length === topics.length;
  const isNoneSelected = selectedTopicIds.length === 0;

  const handleSelectAll = () => {
    if (disabled) return;
    onChange([...allTopicIds]);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const toggleTopic = (id: string) => {
    if (disabled) return;
    if (selectedTopicIds.includes(id)) {
      onChange(selectedTopicIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedTopicIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block font-mono text-xs font-semibold text-on-surface uppercase tracking-wider">
            SELECT TOPICS
          </label>
          <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">
            Choose the topics you want to practice. Questions will only be generated from your selected topics.
          </p>
        </div>

        {/* Controls & Counter */}
        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto font-mono text-xs">
          <button
            type="button"
            disabled={disabled || isAllSelected}
            onClick={handleSelectAll}
            className="px-2.5 py-1 bg-surface-container border border-outline-variant rounded-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            Select All
          </button>
          <button
            type="button"
            disabled={disabled || isNoneSelected}
            onClick={handleClearAll}
            className="px-2.5 py-1 bg-surface-container border border-outline-variant rounded-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            Clear All
          </button>
          <span className="text-[11px] text-primary font-bold px-2 py-0.5 bg-surface-container-high rounded-sm border border-outline-variant">
            {selectedTopicIds.length}/{topics.length}
          </span>
        </div>
      </div>

      {/* Zero Selection Validation Warning */}
      {isNoneSelected && (
        <div className="p-3 bg-error-container/20 border border-error/30 rounded-sm flex items-center font-mono text-xs text-error">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>Select at least one topic to continue.</span>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {topics.map((topic) => {
          const isSelected = selectedTopicIds.includes(topic.id);
          return (
            <button
              type="button"
              key={topic.id}
              disabled={disabled}
              onClick={() => toggleTopic(topic.id)}
              className={`p-2.5 rounded-sm border text-left font-mono text-xs transition-all flex items-start space-x-2 disabled:opacity-50 ${
                isSelected
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-semibold truncate ${isSelected ? 'text-primary font-bold' : ''}`}>
                  {topic.name}
                </div>
                {topic.description && (
                  <div className="text-[10px] text-on-surface-variant/80 truncate mt-0.5">
                    {topic.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

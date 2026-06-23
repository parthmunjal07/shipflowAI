"use client";

import { useState } from "react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

type PRD = {
  id: string;
  featureRequestId: string;
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  edgeCases: string[];
  successMetrics: string[];
  isFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function PrdEditor({ prd, isLocked = false }: { prd: PRD, isLocked?: boolean }) {
  const router = useRouter();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    problemStatement: prd.problemStatement,
    goals: prd.goals,
    nonGoals: prd.nonGoals,
    userStories: prd.userStories,
    acceptanceCriteria: prd.acceptanceCriteria,
    edgeCases: prd.edgeCases,
    successMetrics: prd.successMetrics,
  });

  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = trpc.featureRequest.updatePrd.useMutation();
  const finalizeMutation = trpc.featureRequest.finalizePrd.useMutation();
  const generateTasksMutation = trpc.featureRequest.generateTasks.useMutation();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      prdId: prd.id,
      data: formData,
    });
    setIsEditing(false);
    router.refresh();
  };

  const handleFinalize = async () => {
    if (isEditing) {
      await handleSave();
    }
    await finalizeMutation.mutateAsync({ prdId: prd.id });
    router.refresh();
  };

  const handleGenerateTasks = async () => {
    await generateTasksMutation.mutateAsync({ featureRequestId: prd.featureRequestId });
    router.refresh();
  };

  const handleArrayChange = (field: keyof typeof formData, index: number, value: string) => {
    const newArray = [...(formData[field] as string[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: keyof typeof formData) => {
    setFormData({ ...formData, [field]: [...(formData[field] as string[]), ""] });
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    const newArray = [...(formData[field] as string[])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const renderArrayField = (
    label: string, 
    field: keyof typeof formData, 
    description: string, 
    isMultiline: boolean = false
  ) => {
    const items = formData[field] as string[];
    return (
      <div className="space-y-3 mb-6">
        <div>
          <h3 className="text-lg font-medium">{label}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            {isEditing ? (
              <>
                {isMultiline ? (
                  <textarea
                    value={item}
                    onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                    className="flex-1 min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                ) : (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                    className="flex-1 h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
                <button 
                  type="button"
                  onClick={() => removeArrayItem(field, idx)}
                  className="px-3 py-2 text-sm text-red-500 hover:text-red-700 shrink-0 border border-red-200 rounded-md hover:bg-red-50"
                >
                  Remove
                </button>
              </>
            ) : (
              <div className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
                {item || <span className="text-gray-400 italic">Empty item</span>}
              </div>
            )}
          </div>
        ))}
        {isEditing && (
          <button 
            type="button" 
            onClick={() => addArrayItem(field)} 
            className="mt-2 text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            + Add {label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto my-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Requirements Document</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${prd.isFinalized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {prd.isFinalized ? "Finalized" : "Draft (Pending Human Review)"}
            </span>
          </div>
        </div>
        
        {!prd.isFinalized && !isLocked && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">Cancel</button>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium border rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Draft"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">Edit PRD</button>
            )}
            <button 
              type="button" 
              onClick={handleFinalize} 
              disabled={finalizeMutation.isPending || isEditing} 
              className="px-4 py-2 text-sm font-medium border rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {finalizeMutation.isPending ? "Finalizing..." : "Finalize PRD"}
            </button>
          </div>
        )}
        
        {prd.isFinalized && !isLocked && (
          <button 
            type="button" 
            onClick={handleGenerateTasks}
            disabled={generateTasksMutation.isPending}
            className="px-4 py-2 text-sm font-medium border rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {generateTasksMutation.isPending ? "Generating Tasks..." : "Generate Task Breakdown ➡️"}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Problem Statement */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-medium">Problem Statement</h3>
            <p className="text-sm text-gray-500">The core issue or opportunity this feature addresses.</p>
          </div>
          {isEditing ? (
            <textarea
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="min-h-[100px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100 text-sm whitespace-pre-wrap">
              {formData.problemStatement}
            </div>
          )}
        </div>

        {/* Array Fields */}
        {renderArrayField("Goals", "goals", "Primary objectives for this feature.")}
        {renderArrayField("Non-Goals", "nonGoals", "What this feature explicitly does NOT try to do.")}
        {renderArrayField("User Stories", "userStories", "As a [user], I want to [action] so that [benefit].", true)}
        {renderArrayField("Acceptance Criteria", "acceptanceCriteria", "Testable conditions that must be met.", true)}
        {renderArrayField("Edge Cases", "edgeCases", "Uncommon scenarios to handle.")}
        {renderArrayField("Success Metrics", "successMetrics", "Quantifiable metrics to measure adoption/success.")}
      </div>
    </div>
  );
}

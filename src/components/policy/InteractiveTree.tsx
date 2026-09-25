import React, { useState, useEffect } from 'react';
import { POLICY_TREE_DATA, PolicyTreeNode } from '@/core/policy-tree-data';
import { ChevronRight, ChevronDown, Shield, FileCode, CheckCircle2, AlertCircle, Info, GitBranch, UploadCloud, Sparkles, Filter } from 'lucide-react';

interface InteractiveTreeProps {
  tree?: PolicyTreeNode | null;
  highlightedPath?: string[];
  onSelectNode?: (node: PolicyTreeNode) => void;
  onLoadSampleTree?: () => void;
  onOpenUploader?: () => void;
  onApplyToCurrentRun?: () => void;
  canApplyToCurrentRun?: boolean;
  isApplying?: boolean;
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({
  tree,
  highlightedPath = ["Communication", "Transactional", "Payment", "Payment Successful", "Order Failed"],
  onSelectNode,
  onLoadSampleTree,
  onOpenUploader,
  onApplyToCurrentRun,
  canApplyToCurrentRun = false,
  isApplying = false,
}) => {
  const activeTreeData = tree;

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    tx: true,
    'tx-pay': true,
    gov: true,
    custom_root: true,
    'custom-tx': true,
    'custom-fin': true,
  });

  // Helper to check if a node matches the highlighted path
  const isNodeHighlighted = (node: PolicyTreeNode): boolean => {
    if (!highlightedPath || highlightedPath.length === 0) return false;
    return highlightedPath.some(
      (p) =>
        node.name.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(node.name.toLowerCase()) ||
        (node.ruleCode && p.toLowerCase().includes(node.ruleCode.toLowerCase()))
    );
  };

  // Helper to check if a node or any of its descendants are highlighted
  const hasHighlightedDescendant = (node: PolicyTreeNode): boolean => {
    if (isNodeHighlighted(node)) return true;
    if (node.children && node.children.length > 0) {
      return node.children.some((child) => hasHighlightedDescendant(child));
    }
    return false;
  };

  // Expand all nodes on the active path when tree or highlightedPath updates
  useEffect(() => {
    if (!activeTreeData) return;
    const newExpanded: Record<string, boolean> = { ...expandedNodes };
    const expandActive = (node: PolicyTreeNode) => {
      if (hasHighlightedDescendant(node)) {
        newExpanded[node.id] = true;
      }
      if (node.children) {
        node.children.forEach(expandActive);
      }
    };
    expandActive(activeTreeData);
    setExpandedNodes(newExpanded);
  }, [activeTreeData, highlightedPath]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: PolicyTreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] !== undefined ? expandedNodes[node.id] : true;
    const hasChildren = node.children && node.children.length > 0;
    const isHighlighted = isNodeHighlighted(node);

    return (
      <div key={node.id} className="space-y-1.5" style={{ marginLeft: `${depth * 18}px` }}>
        <div
          onClick={() => onSelectNode?.(node)}
          className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
            isHighlighted
              ? 'bg-aurora-primary-light border-aurora-primary text-aurora-primary font-bold shadow-sm'
              : 'bg-aurora-neutral-0 border-aurora-neutral-200 text-aurora-neutral-900 hover:border-aurora-neutral-300 hover:bg-aurora-neutral-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-1 hover:bg-aurora-neutral-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-700" />
                ) : (
                  <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-aurora-neutral-700" />
                )}
              </button>
            ) : (
              <span className="w-6 text-center text-xs font-mono text-aurora-neutral-500">•</span>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold">{node.name}</span>
                {node.ruleCode && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-aurora-neutral-200 text-aurora-neutral-700 font-semibold">
                    {node.ruleCode}
                  </span>
                )}
                {isHighlighted && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-aurora-primary text-white font-bold">
                    Active Path
                  </span>
                )}
              </div>
              <p className="text-[11px] text-aurora-neutral-500 font-normal">{node.description}</p>
            </div>
          </div>

          {node.allowedSummary && (
            <div className="hidden md:flex items-center space-x-2 text-[10px] text-aurora-neutral-500">
              <Info strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>Inspect Rules</span>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1.5 border-l-2 border-aurora-neutral-200 pl-2">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-aurora-neutral-0 rounded-lg p-5 border border-aurora-neutral-200 shadow-aurora">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-aurora-neutral-900">Interactive Policy Decision Hierarchy</h3>
          <p className="text-xs text-aurora-neutral-500">
            {activeTreeData
              ? 'Expand decision nodes to inspect deterministic governance rules, condition operators, and prohibitions.'
              : 'Policy tree is currently empty (bypassed). Created dynamically only when sample is selected or custom doc uploaded.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onApplyToCurrentRun && (
            <button
              type="button"
              onClick={onApplyToCurrentRun}
              disabled={!canApplyToCurrentRun || isApplying}
              className={`flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded-lg font-bold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 ${
                canApplyToCurrentRun && !isApplying
                  ? 'bg-aurora-primary hover:bg-aurora-primary-hover text-white cursor-pointer ring-1 ring-aurora-primary'
                  : 'bg-aurora-neutral-200 text-aurora-neutral-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Applying & Regenerating...' : 'Apply to Current Run'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTreeData ? (
        <div className="space-y-2">{renderNode(activeTreeData)}</div>
      ) : (
        <div className="py-12 px-6 text-center border-2 border-dashed border-aurora-neutral-300 rounded-xl space-y-4 bg-aurora-neutral-50/50">
          <div className="w-12 h-12 rounded-full bg-aurora-neutral-200 text-aurora-neutral-600 flex items-center justify-center mx-auto">
            <GitBranch strokeWidth={1.5} className="w-6 h-6 text-aurora-neutral-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-aurora-neutral-900">Policy Tree is Currently Empty</h4>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onLoadSampleTree && (
              <button
                type="button"
                onClick={onLoadSampleTree}
                className="px-4 py-2 bg-aurora-primary text-white rounded-lg text-xs font-bold hover:bg-aurora-primary-hover shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
              >
                <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>Load Sample Enterprise Policy Tree</span>
              </button>
            )}

            {onOpenUploader && (
              <button
                type="button"
                onClick={onOpenUploader}
                className="px-4 py-2 bg-white border border-aurora-neutral-300 text-aurora-neutral-800 rounded-lg text-xs font-semibold hover:bg-aurora-neutral-100 shadow-2xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
              >
                <UploadCloud strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                <span>Upload / Paste Policy Document</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

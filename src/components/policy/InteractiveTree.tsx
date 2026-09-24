import React, { useState } from 'react';
import { POLICY_TREE_DATA, PolicyTreeNode } from '@/core/policy-tree-data';
import { ChevronRight, ChevronDown, Shield, FileCode, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface InteractiveTreeProps {
  highlightedPath?: string[];
  onSelectNode?: (node: PolicyTreeNode) => void;
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({
  highlightedPath = ["Communication", "Transactional", "Payment", "Payment Successful", "Order Failed"],
  onSelectNode,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    tx: true,
    'tx-pay': true,
    gov: true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isNodeHighlighted = (node: PolicyTreeNode): boolean => {
    return highlightedPath.some((p) => node.name.toLowerCase().includes(p.toLowerCase()));
  };

  const renderNode = (node: PolicyTreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isHighlighted = isNodeHighlighted(node);

    return (
      <div key={node.id} className="space-y-1.5" style={{ marginLeft: `${depth * 20}px` }}>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aurora-neutral-200 mb-4 gap-2">
        <div>
          <h3 className="text-sm font-bold text-aurora-neutral-900">Interactive Enterprise Policy Hierarchy</h3>
          <p className="text-xs text-aurora-neutral-500">
            Expand nodes to inspect deterministic governance gates, permitted actions, and prohibited claims.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-3 h-3 rounded bg-aurora-primary-light border border-aurora-primary"></span>
          <span className="text-aurora-neutral-700 font-medium">Applied in Current Run</span>
        </div>
      </div>

      <div className="space-y-2">{renderNode(POLICY_TREE_DATA)}</div>
    </div>
  );
};

import { PolicyTreeNode } from './policy-tree-data';
import { PolicyRule } from './types';

export interface DynamicPolicyParseResult {
  tree: PolicyTreeNode;
  rules: PolicyRule[];
  summary: string;
}

export function parsePolicyDocumentText(policyText: string): DynamicPolicyParseResult {
  const lines = policyText.split('\n').map(l => l.trim()).filter(Boolean);
  const rules: PolicyRule[] = [];

  // Identify sections and bullet points from document text
  const categories: { [cat: string]: { name: string; description: string; rules: PolicyRule[] } } = {
    transactional: {
      name: "Transactional Communications",
      description: "Service, order, billing, and account critical policies",
      rules: [],
    },
    privacy: {
      name: "Privacy & Data Protection",
      description: "Data masking, PII safeguarding, credential protection",
      rules: [],
    },
    frequency: {
      name: "Fatigue & Frequency Limits",
      description: "Customer attention, message caps, suppression triggers",
      rules: [],
    },
    financial: {
      name: "Financial Commitments & Compensation",
      description: "Discounts, goodwill vouchers, supervisor authorization gates",
      rules: [],
    },
  };

  let currentCategory = 'transactional';

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (lower.includes('privacy') || lower.includes('security') || lower.includes('pii')) {
      currentCategory = 'privacy';
    } else if (lower.includes('frequency') || lower.includes('fatigue') || lower.includes('limit') || lower.includes('cap')) {
      currentCategory = 'frequency';
    } else if (lower.includes('compensation') || lower.includes('discount') || lower.includes('refund') || lower.includes('credit')) {
      currentCategory = 'financial';
    } else if (lower.includes('transaction') || lower.includes('order') || lower.includes('payment')) {
      currentCategory = 'transactional';
    }

    // If line looks like a rule (bullet, numbered, or contains must/prohibit/allow)
    if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line) || lower.includes('must') || lower.includes('prohibit') || lower.includes('allow')) {
      const cleanRule = line.replace(/^[-*\d.]\s*/, '').trim();
      const ruleId = `POL-CUSTOM-${idx + 1}`;
      const isEscalation = lower.includes('supervisor') || lower.includes('approval') || lower.includes('escalate') || lower.includes('compensation');

      const newRule: PolicyRule = {
        id: ruleId,
        nodePath: `Custom Governance > ${categories[currentCategory].name} > Rule ${idx + 1}`,
        category: currentCategory as any,
        title: cleanRule.slice(0, 60) + (cleanRule.length > 60 ? '...' : ''),
        rule: cleanRule,
        condition: 'parsed_from_document',
        allowedActions: [
          lower.includes('allow') ? cleanRule : 'Adhere strictly to verified facts and customer context',
        ],
        prohibitedActions: [
          lower.includes('prohibit') || lower.includes('never') ? cleanRule : 'Do not invent unsupported timelines or unverified claims',
        ],
        escalationRequired: isEscalation,
        priority: isEscalation ? 'critical' : 'high',
      };

      categories[currentCategory].rules.push(newRule);
      rules.push(newRule);
    }
  });

  // If no granular rules were extracted, generate baseline structured rules from text summary
  if (rules.length === 0) {
    const defaultRule: PolicyRule = {
      id: "POL-DOC-001",
      nodePath: "Custom Governance > Uploaded Policy Document",
      category: "transactional",
      title: "Document-Grounded Policy Rule",
      rule: policyText.slice(0, 300),
      condition: "document_active",
      allowedActions: ["Ground all communications strictly in verified customer facts"],
      prohibitedActions: ["Do not violate guidelines specified in uploaded document"],
      escalationRequired: policyText.toLowerCase().includes("approval") || policyText.toLowerCase().includes("compensation"),
      priority: "high",
    };
    rules.push(defaultRule);
    categories.transactional.rules.push(defaultRule);
  }

  // Construct Hierarchical Policy Tree
  const childrenNodes: PolicyTreeNode[] = Object.entries(categories)
    .filter(([_, cat]) => cat.rules.length > 0)
    .map(([catKey, cat]) => ({
      id: `cat-${catKey}`,
      name: cat.name,
      description: cat.description,
      category: 'category',
      children: cat.rules.map((r) => ({
        id: r.id,
        name: r.title,
        ruleCode: r.id,
        description: r.rule,
        category: 'leaf',
        allowedSummary: r.allowedActions.join('; '),
        prohibitedSummary: r.prohibitedActions.join('; '),
      })),
    }));

  const tree: PolicyTreeNode = {
    id: "custom-root",
    name: "Custom Uploaded Policy Hierarchy",
    description: `Generated from uploaded enterprise policy document (${rules.length} active policy rules parsed)`,
    category: "root",
    children: childrenNodes,
  };

  return {
    tree,
    rules,
    summary: `Successfully parsed ${rules.length} governance rules across ${childrenNodes.length} categories from your document.`,
  };
}

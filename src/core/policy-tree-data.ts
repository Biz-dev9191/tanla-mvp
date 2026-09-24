export interface PolicyTreeNode {
  id: string;
  name: string;
  description: string;
  ruleCode?: string;
  children?: PolicyTreeNode[];
  category?: 'root' | 'category' | 'subcategory' | 'leaf';
  allowedSummary?: string;
  prohibitedSummary?: string;
}

export const POLICY_TREE_DATA: PolicyTreeNode = {
  id: "root",
  name: "Communication Governance",
  description: "Enterprise Policy Root for All Automated Outbound Communications",
  category: "root",
  children: [
    {
      id: "tx",
      name: "Transactional",
      description: "Service, order, billing, and account critical communications",
      category: "category",
      children: [
        {
          id: "tx-pay",
          name: "Payment",
          description: "Payment capture, authorization, settlement and failure handling",
          category: "subcategory",
          children: [
            {
              id: "tx-pay-fail",
              name: "Payment Failed",
              ruleCode: "POL-TX-002",
              description: "Notify card/account failure with secure retry link",
              category: "leaf",
              allowedSummary: "Provide secure payment retry link, mention general decline reason",
              prohibitedSummary: "Do not expose technical backend logs or auto-charge without consent",
            },
            {
              id: "tx-pay-succ-order-fail",
              name: "Payment Successful / Order Failed",
              ruleCode: "POL-TX-001",
              description: "Acknowledge payment capture and explain automated refund status",
              category: "leaf",
              allowedSummary: "Provide payment ID, confirm auto-refund initiation, reassure zero customer action",
              prohibitedSummary: "Do not ask customer to pay again immediately or promise unverified same-day delivery",
            },
            {
              id: "tx-pay-refund",
              name: "Refund Updates",
              ruleCode: "POL-TX-004",
              description: "Refund tracking, ARN number updates, bank processing estimates",
              category: "leaf",
              allowedSummary: "Provide ARN reference number, explain 3-5 business day bank settlement",
              prohibitedSummary: "Do not invent bank turnaround times",
            },
          ],
        },
        {
          id: "tx-app",
          name: "Application",
          description: "Customer onboarding, KYC, document verification",
          category: "subcategory",
          children: [
            {
              id: "tx-app-incomplete",
              name: "Incomplete Application",
              ruleCode: "POL-TX-003",
              description: "Request specific missing documents with direct 1-step upload link",
              category: "leaf",
              allowedSummary: "List exact document names, supported formats (PDF/PNG), deadline date",
              prohibitedSummary: "Do not request plain text passwords or sensitive ID over unencrypted channels",
            },
          ],
        },
        {
          id: "tx-order",
          name: "Order & Shipping",
          description: "Order status, tracking delays, logistics notifications",
          category: "subcategory",
          children: [
            {
              id: "tx-order-delay",
              name: "Shipment Delay",
              ruleCode: "POL-TX-005",
              description: "Proactive delay notification with revised estimated arrival window",
              category: "leaf",
              allowedSummary: "Provide tracking link, revised ETA window, customer support option",
              prohibitedSummary: "Do not hide delayed status until customer complains",
            },
          ],
        },
      ],
    },
    {
      id: "gov",
      name: "Governance & Safety",
      description: "Consent, privacy, frequency limits, and financial approval gates",
      category: "category",
      children: [
        {
          id: "gov-fatigue",
          name: "Fatigue Suppression",
          ruleCode: "POL-FAT-001",
          description: "Suppress excessive messages (>2 promo or >3 transactional per 24h)",
          category: "leaf",
          allowedSummary: "Suppress communication with documented audit trail",
          prohibitedSummary: "Do not spam fatigue-saturated customers",
        },
        {
          id: "gov-fin",
          name: "Financial Commitment Control",
          ruleCode: "POL-FIN-001",
          description: "Human supervisor approval mandatory for discounts or compensation",
          category: "leaf",
          allowedSummary: "Route high-value refunds or goodwill credits to human approval queue",
          prohibitedSummary: "Agents must never fabricate goodwill vouchers autonomously",
        },
        {
          id: "gov-privacy",
          name: "Privacy & Data Masking",
          ruleCode: "POL-PRV-001",
          description: "Mask credit cards, KYC numbers, and credentials",
          category: "leaf",
          allowedSummary: "Display last 4 digits only (e.g., **** 4012)",
          prohibitedSummary: "Never broadcast raw credit cards or passwords",
        },
      ],
    },
    {
      id: "promo",
      name: "Promotional",
      description: "Offers, upgrade recommendations, re-engagement",
      category: "category",
      children: [
        {
          id: "promo-offer",
          name: "Targeted Offers",
          ruleCode: "POL-CONS-001",
          description: "Opt-in consent mandatory prior to promotional dispatch",
          category: "leaf",
          allowedSummary: "Send personalized value recommendation with 1-click opt-out",
          prohibitedSummary: "Zero messages permitted without verified promotional consent",
        },
      ],
    },
  ],
};

export const defaultPolicyTree = POLICY_TREE_DATA;

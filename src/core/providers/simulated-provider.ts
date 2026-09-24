export interface SimulatedDispatchResult {
  channel: 'WhatsApp' | 'SMS' | 'Voice';
  recipient: string;
  delivered: boolean;
  messageId: string;
  timestamp: string;
  details: string;
}

export async function dispatchSimulatedChannel(
  channel: 'WhatsApp' | 'SMS' | 'Voice',
  recipient: string,
  content: string
): Promise<SimulatedDispatchResult> {
  // Simulate network dispatch delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const id = `SIM-${channel.toUpperCase()}-${Date.now()}`;
  return {
    channel,
    recipient,
    delivered: true,
    messageId: id,
    timestamp: new Date().toISOString(),
    details: `Simulated message dispatched to ${recipient} via ${channel} sandbox provider.`,
  };
}

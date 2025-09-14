

/**
 * Mock Payout Service for Development
 * 
 * This service simulates Xendit payout functionality when using development API keys
 * that don't have payout permissions. It provides realistic responses for testing
 * the complete payout flow without actual money transfer.
 */
export class MockPayoutService {
  private static payouts: Map<string, any> = new Map();
  
  /**
   * Create a mock payout
   */
  static async createPayout(payload: PayoutRequest): Promise<PayoutResponse> {
    console.log('🔧 [MOCK] Creating payout:', payload.reference_id);
    
    // Simulate API delay
    await this.delay(500);
    
    // Generate mock payout ID
    const payoutId = `mock_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create mock response
    const mockPayout = {
      id: payoutId,
      external_id: payload.reference_id,
      amount: payload.amount,
      merchant_name: 'Mahirku',
      status: 'PENDING' as PayoutStatus,
      expiration_timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created: new Date().toISOString(),
      email: payload.channel_properties?.account_holder_name || 'test@example.com',
      payout_url: `https://mock-xendit.com/payouts/${payoutId}`,
      channel_code: payload.channel_code,
      channel_properties: payload.channel_properties,
      description: payload.description,
      currency: payload.currency || 'IDR',
      reference_id: payload.reference_id
    };
    
    // Store for later reference
    this.payouts.set(payoutId, mockPayout);
    
    console.log('✅ [MOCK] Payout created successfully:', payoutId);
    
    // Simulate async callback after a delay
    this.simulateCallback(payoutId, payload.reference_id);
    
    return mockPayout;
  }
  
  /**
   * Get payout by ID
   */
  static async getPayout(payoutId: string): Promise<any> {
    console.log('🔧 [MOCK] Getting payout:', payoutId);
    
    await this.delay(200);
    
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }
    
    return payout;
  }
  
  /**
   * Simulate payout callback after a delay
   */
  private static async simulateCallback(payoutId: string, referenceId: string) {
    // Wait 3-10 seconds to simulate processing time
    const delay = 3000 + Math.random() * 7000;
    
    setTimeout(async () => {
      try {
        console.log(`🔧 [MOCK] Simulating callback for payout: ${payoutId}`);
        
        // Randomly determine success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        const status = isSuccess ? 'COMPLETED' : 'FAILED';
        
        // Update payout status
        const payout = this.payouts.get(payoutId);
        if (payout) {
          payout.status = status;
          payout.completed_at = new Date().toISOString();
          
          if (!isSuccess) {
            payout.failure_reason = 'INSUFFICIENT_BALANCE'; // Mock failure reason
          }
        }
        
        // Send callback to our own endpoint
        const callbackPayload = {
          id: payoutId,
          external_id: referenceId,
          user_id: 'mock_user_id',
          amount: payout?.amount || 0,
          status: status,
          channel_code: payout?.channel_code || 'ID_BCA',
          created: payout?.created || new Date().toISOString(),
          updated: new Date().toISOString(),
          reference_id: referenceId,
          currency: 'IDR'
        };
        
        // Import axios dynamically to avoid circular dependencies
        const axios = require('axios');
        
        try {
          const callbackUrl = process.env.XENDIT_CALLBACK_URL || 'http://localhost:5000/api/payment/xendit/payout-callback';
          
          await axios.post(callbackUrl, callbackPayload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Mock-Callback': 'true' // Identify as mock callback
            },
            timeout: 5000
          });
          
          console.log(`✅ [MOCK] Callback sent successfully for ${payoutId} with status: ${status}`);
        } catch (callbackError) {
          if (callbackError instanceof Error){
            console.log("Error : Error Callback ")
          }
        }
        
      } catch (error) {
        console.error(`❌ [MOCK] Error in callback simulation for ${payoutId}:`, error);
      }
    }, delay);
  }
  
  /**
   * Utility function to simulate API delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get all mock payouts (for debugging)
   */
  static getAllPayouts(): any[] {
    return Array.from(this.payouts.values());
  }
  
  /**
   * Clear all mock payouts (for testing)
   */
  static clearPayouts(): void {
    this.payouts.clear();
    console.log('🔧 [MOCK] All payouts cleared');
  }
  
  /**
   * Force a callback for testing
   */
  static async forceCallback(payoutId: string, status: PayoutStatus = 'COMPLETED'): Promise<void> {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }
    
    console.log(`🔧 [MOCK] Forcing callback for ${payoutId} with status: ${status}`);
    
    // Update status
    payout.status = status;
    payout.completed_at = new Date().toISOString();
    
    // Send immediate callback
    const callbackPayload = {
      id: payoutId,
      external_id: payout.reference_id,
      user_id: 'mock_user_id',
      amount: payout.amount,
      status: status,
      channel_code: payout.channel_code,
      created: payout.created,
      updated: new Date().toISOString(),
      reference_id: payout.reference_id,
      currency: 'IDR'
    };
    
    const axios = require('axios');
    const callbackUrl = process.env.XENDIT_CALLBACK_URL || 'http://localhost:5000/api/payment/xendit/payout-callback';
    
    await axios.post(callbackUrl, callbackPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Mock-Callback': 'true'
      },
      timeout: 5000
    });
    
    console.log(`✅ [MOCK] Forced callback sent for ${payoutId}`);
  }
}

// Export types for consistency
export interface PayoutRequest {
  reference_id: string;
  channel_code: string;
  channel_properties: {
    account_holder_name: string;
    account_number: string;
  };
  amount: number;
  description: string;
  currency?: string;
}

export interface PayoutResponse {
  id: string;
  external_id: string;
  amount: number;
  status: PayoutStatus;
  created: string;
  reference_id: string;
  [key: string]: any;
}

export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
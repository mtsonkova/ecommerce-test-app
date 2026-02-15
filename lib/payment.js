// Fake payment processor for testing
// Simulates credit card processing with delays and various scenarios

export class FakePaymentProcessor {
  static async processPayment(cardDetails, amount) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { cardNumber, cvv, expiryMonth, expiryYear, cardholderName } = cardDetails;

    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber)) {
      return {
        success: false,
        error: 'Invalid card number format',
      };
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
      return {
        success: false,
        error: 'Invalid CVV',
      };
    }

    // Test cards for different scenarios
    const testScenarios = {
      // Success
      '4532015112830366': { success: true, message: 'Payment successful' },
      '5425233430109903': { success: true, message: 'Payment successful' },
      '2221000000000009': { success: true, message: 'Payment successful' },
      
      // Decline
      '4000000000000002': { success: false, error: 'Card declined' },
      '4000000000000010': { success: false, error: 'Card declined - Invalid CVV' },
      
      // Insufficient funds
      '4000000000009995': { success: false, error: 'Insufficient funds' },
      
      // Expired card
      '4000000000000069': { success: false, error: 'Card expired' },
      
      // Fraud detection
      '4100000000000001': { success: false, error: 'Suspected fraud - card blocked' },
    };

    // Check for test card scenarios
    if (testScenarios[cardNumber]) {
      return testScenarios[cardNumber];
    }

    // For any other card, use Luhn algorithm to validate
    if (!this.luhnCheck(cardNumber)) {
      return {
        success: false,
        error: 'Invalid card number',
      };
    }

    // Check expiry date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return {
        success: false,
        error: 'Card expired',
      };
    }

    // Default success for valid cards
    return {
      success: true,
      message: 'Payment successful',
      transactionId: this.generateTransactionId(),
    };
  }

  static async processRefund(transactionId, amount) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Refund processed successfully',
      refundId: this.generateTransactionId(),
    };
  }

  static luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  static generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static getTestCards() {
    return [
      {
        name: 'Visa - Success',
        number: '4532015112830366',
        cvv: '123',
        expiry: '12/2025',
      },
      {
        name: 'Mastercard - Success',
        number: '5425233430109903',
        cvv: '456',
        expiry: '06/2026',
      },
      {
        name: 'Mastercard - Declined',
        number: '4000000000000002',
        cvv: '789',
        expiry: '03/2025',
      },
      {
        name: 'Visa - Insufficient Funds',
        number: '4000000000009995',
        cvv: '321',
        expiry: '09/2025',
      },
      {
        name: 'Visa - Fraud Detection',
        number: '4100000000000001',
        cvv: '654',
        expiry: '11/2025',
      },
    ];
  }
}

import Foundation

class Account {
    let id: UUID
    var name: String
    var balance: Double
    var currency: String
    var description: String?
    let createdAt: Date
    
    init(id: UUID = UUID(), name: String, balance: Double, currency: String, description: String? = nil, createdAt: Date = Date()) {
        self.id = id
        self.name = name
        self.balance = balance
        self.currency = currency
        self.description = description
        self.createdAt = createdAt
    }
    
    func formattedBalance() -> String {
        return CurrencyManager.shared.formatAmount(balance, currency: currency)
    }
    
    func updateBalance(amount: Double) {
        balance += amount
    }
    
    func convertedBalance(to targetCurrency: String) -> Double {
        if currency == targetCurrency {
            return balance
        }
        
        return CurrencyManager.shared.convertAmount(balance, from: currency, to: targetCurrency)
    }
}
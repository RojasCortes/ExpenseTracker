import Foundation

class Expense {
    let id: UUID
    var amount: Double
    var currency: String
    var date: Date
    var category: String
    var expenseDescription: String?
    var account: Account?
    
    init(id: UUID = UUID(), amount: Double, currency: String, date: Date, category: String, description: String? = nil, account: Account? = nil) {
        self.id = id
        self.amount = amount
        self.currency = currency
        self.date = date
        self.category = category
        self.expenseDescription = description
        self.account = account
    }
    
    func formattedAmount() -> String {
        return CurrencyManager.shared.formatAmount(amount, currency: currency)
    }
    
    func formattedDate() -> String {
        return DateUtils.shared.formatDateForDisplay(date)
    }
    
    func convertedAmount(to targetCurrency: String) -> Double {
        if currency == targetCurrency {
            return amount
        }
        
        return CurrencyManager.shared.convertAmount(amount, from: currency, to: targetCurrency)
    }
}
import Foundation

class CurrencyManager {
    static let shared = CurrencyManager()
    
    // Default currency
    private var _selectedCurrency: String = "COP"
    
    var selectedCurrency: String {
        get {
            return _selectedCurrency
        }
        set {
            _selectedCurrency = newValue
            // Notify observers that currency has changed
            NotificationCenter.default.post(name: .currencyDidChange, object: nil)
        }
    }
    
    // Simple exchange rates
    private let usdToCopRate: Double = 4000
    
    func convert(amount: Double, from sourceCurrency: String, to targetCurrency: String) -> Double {
        if sourceCurrency == targetCurrency {
            return amount
        }
        
        if sourceCurrency == "USD" && targetCurrency == "COP" {
            return amount * usdToCopRate
        } else if sourceCurrency == "COP" && targetCurrency == "USD" {
            return amount / usdToCopRate
        }
        
        return amount
    }
    
    func formatAmount(_ amount: Double, currency: String? = nil) -> String {
        let currencyToUse = currency ?? selectedCurrency
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        
        if currencyToUse == "COP" {
            formatter.locale = Locale(identifier: "es_CO")
            formatter.maximumFractionDigits = 0
            formatter.currencySymbol = "$"
            return formatter.string(from: NSNumber(value: amount)) ?? "$\(Int(amount))"
        } else {
            formatter.locale = Locale(identifier: "en_US")
            formatter.maximumFractionDigits = 2
            return formatter.string(from: NSNumber(value: amount)) ?? "$\(String(format: "%.2f", amount))"
        }
    }
    
    func getCurrencySymbol(for currency: String) -> String {
        return currency == "COP" ? "$" : "$"  // Both use $ but with different formatting
    }
}

// MARK: - Notification names
extension Notification.Name {
    static let currencyDidChange = Notification.Name("currencyDidChange")
}
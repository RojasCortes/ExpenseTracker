import Foundation

extension NSNotification.Name {
    static let currencyDidChange = NSNotification.Name("currencyDidChange")
}

class CurrencyManager {
    static let shared = CurrencyManager()
    
    // Default exchange rates (1 USD = 4000 COP)
    private let exchangeRates: [String: Double] = [
        "COP_USD": 0.00025, // 1 COP = 0.00025 USD
        "USD_COP": 4000     // 1 USD = 4000 COP
    ]
    
    // Default currency
    var selectedCurrency: String {
        didSet {
            if oldValue != selectedCurrency {
                // Save to user defaults
                UserDefaults.standard.set(selectedCurrency, forKey: "SelectedCurrency")
                
                // Notify observers
                NotificationCenter.default.post(name: .currencyDidChange, object: nil)
            }
        }
    }
    
    private init() {
        // Load from user defaults or use default
        selectedCurrency = UserDefaults.standard.string(forKey: "SelectedCurrency") ?? "COP"
    }
    
    func convertAmount(_ amount: Double, from fromCurrency: String, to toCurrency: String) -> Double {
        if fromCurrency == toCurrency {
            return amount
        }
        
        let rateKey = "\(fromCurrency)_\(toCurrency)"
        if let rate = exchangeRates[rateKey] {
            return amount * rate
        }
        
        // If direct conversion not found, try reverse
        let reverseRateKey = "\(toCurrency)_\(fromCurrency)"
        if let reverseRate = exchangeRates[reverseRateKey] {
            return amount / reverseRate
        }
        
        // If no conversion found, return original amount
        return amount
    }
    
    func formatAmount(_ amount: Double, currency: String? = nil, decimals: Int? = nil) -> String {
        let currencyToUse = currency ?? selectedCurrency
        
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        
        if currencyToUse == "COP" {
            formatter.currencySymbol = "$"
            formatter.currencyCode = "COP"
            formatter.minimumFractionDigits = decimals ?? 0
            formatter.maximumFractionDigits = decimals ?? 0
        } else {
            formatter.currencySymbol = "USD $"
            formatter.currencyCode = "USD"
            formatter.minimumFractionDigits = decimals ?? 2
            formatter.maximumFractionDigits = decimals ?? 2
        }
        
        return formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
    }
}
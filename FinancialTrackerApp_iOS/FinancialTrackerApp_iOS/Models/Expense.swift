import Foundation
import CoreData

@objc(Expense)
class Expense: NSManagedObject {
    @NSManaged var id: Int64
    @NSManaged var amount: Double
    @NSManaged var currency: String
    @NSManaged var date: Date
    @NSManaged var category: String
    @NSManaged var expenseDescription: String?
    @NSManaged var createdAt: Date
    @NSManaged var account: Account?
    
    static func fetchRequest() -> NSFetchRequest<Expense> {
        return NSFetchRequest<Expense>(entityName: "Expense")
    }
    
    // Helper method to get formatted amount
    func formattedAmount() -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = currency == "COP" ? 0 : 2
        
        if currency == "COP" {
            formatter.locale = Locale(identifier: "es_CO")
            formatter.currencySymbol = "$"
            return formatter.string(from: NSNumber(value: amount)) ?? "$\(Int(amount))"
        } else {
            formatter.locale = Locale(identifier: "en_US")
            return formatter.string(from: NSNumber(value: amount)) ?? "$\(String(format: "%.2f", amount))"
        }
    }
    
    // Helper method to get formatted date
    func formattedDate() -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: date)
    }
}
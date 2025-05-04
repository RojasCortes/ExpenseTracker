import Foundation
import CoreData

@objc(Account)
class Account: NSManagedObject {
    @NSManaged var id: Int64
    @NSManaged var name: String
    @NSManaged var balance: Double
    @NSManaged var currency: String
    @NSManaged var createdAt: Date
    @NSManaged var expenses: NSSet?
    
    static func fetchRequest() -> NSFetchRequest<Account> {
        return NSFetchRequest<Account>(entityName: "Account")
    }
    
    // Helper method to get formatted balance
    func formattedBalance() -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = currency == "COP" ? 0 : 2
        
        if currency == "COP" {
            formatter.locale = Locale(identifier: "es_CO")
            formatter.currencySymbol = "$"
            return formatter.string(from: NSNumber(value: balance)) ?? "$\(Int(balance))"
        } else {
            formatter.locale = Locale(identifier: "en_US")
            return formatter.string(from: NSNumber(value: balance)) ?? "$\(String(format: "%.2f", balance))"
        }
    }
}
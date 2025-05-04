import Foundation

struct MonthlyFinancialSummary {
    let totalExpenses: Double
    let expenseCount: Int
    let expensesByCategory: [String: Double]
    let expensesByDay: [Int: Double]
    
    init(totalExpenses: Double = 0, expenseCount: Int = 0, expensesByCategory: [String: Double] = [:], expensesByDay: [Int: Double] = [:]) {
        self.totalExpenses = totalExpenses
        self.expenseCount = expenseCount
        self.expensesByCategory = expensesByCategory
        self.expensesByDay = expensesByDay
    }
}
import Foundation

class DateUtils {
    static let shared = DateUtils()
    
    private init() {}
    
    func formatDateForDisplay(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "es_CO")
        return formatter.string(from: date)
    }
    
    func formatDateForInput(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
    
    func getMonthDateRange(month: Int, year: Int) -> (startDate: Date, endDate: Date)? {
        let calendar = Calendar.current
        
        var startComponents = DateComponents()
        startComponents.day = 1
        startComponents.month = month
        startComponents.year = year
        
        guard let startDate = calendar.date(from: startComponents) else {
            return nil
        }
        
        guard let endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate) else {
            return nil
        }
        
        return (startDate, endDate)
    }
    
    func getMonthDays(month: Int, year: Int) -> [String] {
        guard let (startDate, endDate) = getMonthDateRange(month: month, year: year) else {
            return []
        }
        
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        let components = calendar.dateComponents([.day], from: endDate)
        guard let lastDay = components.day else {
            return []
        }
        
        var days: [String] = []
        
        for day in 1...lastDay {
            var dayComponents = DateComponents()
            dayComponents.day = day
            dayComponents.month = month
            dayComponents.year = year
            
            if let date = calendar.date(from: dayComponents) {
                days.append(formatter.string(from: date))
            }
        }
        
        return days
    }
    
    func getMonthName(month: Int) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "es_CO")
        
        var components = DateComponents()
        components.month = month
        
        guard let date = Calendar.current.date(from: components) else {
            return ""
        }
        
        dateFormatter.dateFormat = "MMMM"
        return dateFormatter.string(from: date)
    }
    
    func getCurrentMonthAndYear() -> (month: Int, year: Int) {
        let calendar = Calendar.current
        let currentDate = Date()
        let month = calendar.component(.month, from: currentDate)
        let year = calendar.component(.year, from: currentDate)
        
        return (month, year)
    }
}
import Foundation

class DateUtils {
    static let shared = DateUtils()
    
    private let dateFormatter = DateFormatter()
    private let calendar = Calendar.current
    
    // Format date for display (e.g., "12 de mayo de 2023")
    func formatDateForDisplay(_ date: Date) -> String {
        dateFormatter.dateStyle = .long
        dateFormatter.timeStyle = .none
        dateFormatter.locale = Locale(identifier: "es_CO")
        return dateFormatter.string(from: date)
    }
    
    // Format date for picker or form fields (e.g., "2023-05-12")
    func formatDateForInput(_ date: Date) -> String {
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return dateFormatter.string(from: date)
    }
    
    // Parse date from string
    func parseDate(from string: String, format: String = "yyyy-MM-dd") -> Date? {
        dateFormatter.dateFormat = format
        return dateFormatter.date(from: string)
    }
    
    // Get month and year from date
    func getMonthAndYear(from date: Date) -> (month: Int, year: Int) {
        let month = calendar.component(.month, from: date)
        let year = calendar.component(.year, from: date)
        return (month, year)
    }
    
    // Get start and end date of a month
    func getMonthDateRange(month: Int, year: Int) -> (startDate: Date, endDate: Date)? {
        var startDateComponents = DateComponents()
        startDateComponents.year = year
        startDateComponents.month = month
        startDateComponents.day = 1
        
        var endDateComponents = DateComponents()
        endDateComponents.year = year
        endDateComponents.month = month + 1
        endDateComponents.day = 1
        
        guard let startDate = calendar.date(from: startDateComponents),
              let endDate = calendar.date(from: endDateComponents) else {
            return nil
        }
        
        return (startDate, endDate)
    }
    
    // Get month name
    func getMonthName(month: Int) -> String {
        dateFormatter.dateFormat = "MMMM"
        dateFormatter.locale = Locale(identifier: "es_CO")
        
        var components = DateComponents()
        components.month = month
        components.day = 1
        components.year = 2023 // Any year would work
        
        if let date = calendar.date(from: components) {
            let monthName = dateFormatter.string(from: date)
            return monthName.capitalized
        }
        
        return ""
    }
    
    // Get all dates in a month
    func getDatesInMonth(month: Int, year: Int) -> [Date] {
        guard let dateRange = getMonthDateRange(month: month, year: year) else {
            return []
        }
        
        let startDate = dateRange.startDate
        let range = calendar.range(of: .day, in: .month, for: startDate)!
        
        return range.compactMap { day -> Date? in
            var components = calendar.dateComponents([.year, .month], from: startDate)
            components.day = day
            return calendar.date(from: components)
        }
    }
}
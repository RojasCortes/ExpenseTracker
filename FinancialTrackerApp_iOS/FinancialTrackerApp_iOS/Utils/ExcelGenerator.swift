import Foundation
import WebKit

class ExcelGenerator {
    static let shared = ExcelGenerator()
    
    private init() {}
    
    func generateMonthlyReport(month: Int, year: Int, completion: @escaping (URL?) -> Void) {
        // Get data from database
        let summaryData = DatabaseManager.shared.getMonthlySummary(month: month, year: year)
        let accounts = DatabaseManager.shared.fetchAllAccounts()
        let expenses = DatabaseManager.shared.fetchExpenses(forMonth: month, year: year)
        
        // Generate file name
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMMM_yyyy"
        dateFormatter.locale = Locale(identifier: "es_CO")
        
        var components = DateComponents()
        components.month = month
        components.year = year
        
        guard let date = Calendar.current.date(from: components) else {
            completion(nil)
            return
        }
        
        let fileName = "Reporte_Financiero_\(dateFormatter.string(from: date)).xlsx"
        
        // Create directory in documents folder
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let directoryURL = documentsDirectory.appendingPathComponent("Reports", isDirectory: true)
        
        do {
            try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true, attributes: nil)
            
            // Generate Excel file
            let fileURL = directoryURL.appendingPathComponent(fileName)
            
            // In a real app, we would use a library like CoreXLSX here to create the actual Excel file
            // For this demo, we'll create a placeholder file
            createPlaceholderExcelFile(at: fileURL, with: summaryData, accounts: accounts, expenses: expenses)
            
            completion(fileURL)
        } catch {
            print("Error creating directory: \(error)")
            completion(nil)
        }
    }
    
    private func createPlaceholderExcelFile(at fileURL: URL, with summaryData: MonthlyFinancialSummary, accounts: [Account], expenses: [Expense]) {
        // In a real app, this would create a proper Excel file
        // For this demo, we'll create an HTML file that lists the data
        
        let htmlContent = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reporte Financiero</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1, h2 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Reporte Financiero Mensual</h1>
            
            <h2>Resumen</h2>
            <table>
                <tr>
                    <th>Concepto</th>
                    <th>Valor</th>
                </tr>
                <tr>
                    <td>Total de Gastos</td>
                    <td>\(CurrencyManager.shared.formatAmount(summaryData.totalExpenses))</td>
                </tr>
                <tr>
                    <td>Número de Transacciones</td>
                    <td>\(summaryData.expenseCount)</td>
                </tr>
            </table>
            
            <h2>Cuentas</h2>
            <table>
                <tr>
                    <th>Nombre</th>
                    <th>Saldo</th>
                    <th>Moneda</th>
                </tr>
        """
        
        var htmlContentContinued = htmlContent
        
        // Add accounts
        for account in accounts {
            htmlContentContinued += """
                <tr>
                    <td>\(account.name)</td>
                    <td>\(account.formattedBalance())</td>
                    <td>\(account.currency)</td>
                </tr>
            """
        }
        
        htmlContentContinued += """
            </table>
            
            <h2>Gastos por Categoría</h2>
            <table>
                <tr>
                    <th>Categoría</th>
                    <th>Monto</th>
                </tr>
        """
        
        // Add expenses by category
        for (category, amount) in summaryData.expensesByCategory {
            htmlContentContinued += """
                <tr>
                    <td>\(category)</td>
                    <td>\(CurrencyManager.shared.formatAmount(amount))</td>
                </tr>
            """
        }
        
        htmlContentContinued += """
            </table>
            
            <h2>Detalle de Gastos</h2>
            <table>
                <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Cuenta</th>
                    <th>Monto</th>
                </tr>
        """
        
        // Add expenses
        for expense in expenses {
            htmlContentContinued += """
                <tr>
                    <td>\(expense.formattedDate())</td>
                    <td>\(expense.category)</td>
                    <td>\(expense.expenseDescription ?? "-")</td>
                    <td>\(expense.account?.name ?? "Sin cuenta")</td>
                    <td>\(expense.formattedAmount())</td>
                </tr>
            """
        }
        
        htmlContentContinued += """
            </table>
        </body>
        </html>
        """
        
        do {
            try htmlContentContinued.write(to: fileURL, atomically: true, encoding: .utf8)
        } catch {
            print("Error writing file: \(error)")
        }
    }
    
    func shareReport(from viewController: UIViewController, fileURL: URL) {
        let activityViewController = UIActivityViewController(
            activityItems: [fileURL],
            applicationActivities: nil
        )
        
        // For iPad
        if let popoverController = activityViewController.popoverPresentationController {
            popoverController.sourceView = viewController.view
            popoverController.sourceRect = CGRect(x: viewController.view.bounds.midX, y: viewController.view.bounds.midY, width: 0, height: 0)
            popoverController.permittedArrowDirections = []
        }
        
        viewController.present(activityViewController, animated: true)
    }
}
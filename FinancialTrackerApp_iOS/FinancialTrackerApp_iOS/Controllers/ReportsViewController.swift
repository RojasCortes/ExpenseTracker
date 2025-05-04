import UIKit
import Charts

class ReportsViewController: UIViewController {
    
    // MARK: - Properties
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    
    private let dateSelectorView = UIView()
    private let monthLabel = UILabel()
    private let yearLabel = UILabel()
    private let previousMonthButton = UIButton()
    private let nextMonthButton = UIButton()
    
    private let summaryCardView = UIView()
    private let totalExpensesLabel = UILabel()
    private let expensesAmountLabel = UILabel()
    
    private let pieChartView = PieChartView()
    private let barChartView = BarChartView()
    
    private let generateReportButton = UIButton()
    
    private var currentMonth: Int = Calendar.current.component(.month, from: Date())
    private var currentYear: Int = Calendar.current.component(.year, from: Date())
    private var expensesByCategory: [String: Double] = [:]
    private var expensesByDay: [Int: Double] = [:]
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
        
        // Add actions to buttons
        previousMonthButton.addTarget(self, action: #selector(previousMonthTapped), for: .touchUpInside)
        nextMonthButton.addTarget(self, action: #selector(nextMonthTapped), for: .touchUpInside)
        generateReportButton.addTarget(self, action: #selector(generateReportTapped), for: .touchUpInside)
        
        // Subscribe to currency change notifications
        NotificationCenter.default.addObserver(self, selector: #selector(currencyDidChange), name: .currencyDidChange, object: nil)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadData()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - Setup methods
    
    private func setupViews() {
        view.backgroundColor = .systemBackground
        
        // Set up scroll view
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        contentView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        // Set up date selector
        dateSelectorView.translatesAutoresizingMaskIntoConstraints = false
        dateSelectorView.backgroundColor = .systemBackground
        dateSelectorView.layer.cornerRadius = 12
        dateSelectorView.layer.shadowColor = UIColor.black.cgColor
        dateSelectorView.layer.shadowOffset = CGSize(width: 0, height: 2)
        dateSelectorView.layer.shadowRadius = 4
        dateSelectorView.layer.shadowOpacity = 0.1
        
        monthLabel.translatesAutoresizingMaskIntoConstraints = false
        monthLabel.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        monthLabel.textAlignment = .center
        
        yearLabel.translatesAutoresizingMaskIntoConstraints = false
        yearLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        yearLabel.textColor = .secondaryLabel
        yearLabel.textAlignment = .center
        
        previousMonthButton.translatesAutoresizingMaskIntoConstraints = false
        previousMonthButton.setImage(UIImage(systemName: "chevron.left.circle.fill"), for: .normal)
        previousMonthButton.tintColor = .systemBlue
        
        nextMonthButton.translatesAutoresizingMaskIntoConstraints = false
        nextMonthButton.setImage(UIImage(systemName: "chevron.right.circle.fill"), for: .normal)
        nextMonthButton.tintColor = .systemBlue
        
        dateSelectorView.addSubview(monthLabel)
        dateSelectorView.addSubview(yearLabel)
        dateSelectorView.addSubview(previousMonthButton)
        dateSelectorView.addSubview(nextMonthButton)
        
        // Set up summary card
        summaryCardView.translatesAutoresizingMaskIntoConstraints = false
        summaryCardView.backgroundColor = .systemBackground
        summaryCardView.layer.cornerRadius = 12
        summaryCardView.layer.shadowColor = UIColor.black.cgColor
        summaryCardView.layer.shadowOffset = CGSize(width: 0, height: 2)
        summaryCardView.layer.shadowRadius = 4
        summaryCardView.layer.shadowOpacity = 0.1
        
        totalExpensesLabel.translatesAutoresizingMaskIntoConstraints = false
        totalExpensesLabel.text = "Total de Gastos del Mes"
        totalExpensesLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        totalExpensesLabel.textColor = .secondaryLabel
        
        expensesAmountLabel.translatesAutoresizingMaskIntoConstraints = false
        expensesAmountLabel.font = UIFont.systemFont(ofSize: 26, weight: .bold)
        
        summaryCardView.addSubview(totalExpensesLabel)
        summaryCardView.addSubview(expensesAmountLabel)
        
        // Set up pie chart view
        pieChartView.translatesAutoresizingMaskIntoConstraints = false
        pieChartView.backgroundColor = .systemBackground
        pieChartView.layer.cornerRadius = 12
        pieChartView.layer.shadowColor = UIColor.black.cgColor
        pieChartView.layer.shadowOffset = CGSize(width: 0, height: 2)
        pieChartView.layer.shadowRadius = 4
        pieChartView.layer.shadowOpacity = 0.1
        
        pieChartView.legend.enabled = true
        pieChartView.legend.horizontalAlignment = .center
        pieChartView.legend.verticalAlignment = .bottom
        pieChartView.legend.orientation = .horizontal
        pieChartView.legend.formSize = 10
        pieChartView.legend.font = UIFont.systemFont(ofSize: 12)
        
        pieChartView.holeColor = .systemBackground
        pieChartView.holeRadiusPercent = 0.5
        pieChartView.transparentCircleRadiusPercent = 0.55
        
        pieChartView.rotationEnabled = true
        pieChartView.highlightPerTapEnabled = true
        
        // Set up bar chart view
        barChartView.translatesAutoresizingMaskIntoConstraints = false
        barChartView.backgroundColor = .systemBackground
        barChartView.layer.cornerRadius = 12
        barChartView.layer.shadowColor = UIColor.black.cgColor
        barChartView.layer.shadowOffset = CGSize(width: 0, height: 2)
        barChartView.layer.shadowRadius = 4
        barChartView.layer.shadowOpacity = 0.1
        
        barChartView.legend.enabled = false
        barChartView.rightAxis.enabled = false
        barChartView.leftAxis.axisMinimum = 0
        barChartView.xAxis.labelPosition = .bottom
        
        // Set up generate report button
        generateReportButton.translatesAutoresizingMaskIntoConstraints = false
        generateReportButton.setTitle("Generar Reporte Excel", for: .normal)
        generateReportButton.setImage(UIImage(systemName: "arrow.down.doc.fill"), for: .normal)
        generateReportButton.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        generateReportButton.layer.cornerRadius = 12
        generateReportButton.tintColor = .white
        generateReportButton.setTitleColor(.white, for: .normal)
        generateReportButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        generateReportButton.imageEdgeInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 8)
        
        // Add chart title labels
        let pieChartTitleLabel = UILabel()
        pieChartTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        pieChartTitleLabel.text = "Gastos por Categoría"
        pieChartTitleLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        
        let barChartTitleLabel = UILabel()
        barChartTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        barChartTitleLabel.text = "Gastos por Día"
        barChartTitleLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        
        // Add views to content view
        contentView.addSubview(dateSelectorView)
        contentView.addSubview(summaryCardView)
        contentView.addSubview(pieChartTitleLabel)
        contentView.addSubview(pieChartView)
        contentView.addSubview(barChartTitleLabel)
        contentView.addSubview(barChartView)
        contentView.addSubview(generateReportButton)
        
        // Set up constraints for chart titles
        NSLayoutConstraint.activate([
            pieChartTitleLabel.topAnchor.constraint(equalTo: summaryCardView.bottomAnchor, constant: 24),
            pieChartTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            pieChartTitleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            pieChartView.topAnchor.constraint(equalTo: pieChartTitleLabel.bottomAnchor, constant: 8),
            
            barChartTitleLabel.topAnchor.constraint(equalTo: pieChartView.bottomAnchor, constant: 24),
            barChartTitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            barChartTitleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            barChartView.topAnchor.constraint(equalTo: barChartTitleLabel.bottomAnchor, constant: 8)
        ])
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Scroll view constraints
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Content view constraints
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            // Date selector constraints
            dateSelectorView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            dateSelectorView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            dateSelectorView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            dateSelectorView.heightAnchor.constraint(equalToConstant: 100),
            
            previousMonthButton.leadingAnchor.constraint(equalTo: dateSelectorView.leadingAnchor, constant: 16),
            previousMonthButton.centerYAnchor.constraint(equalTo: dateSelectorView.centerYAnchor),
            previousMonthButton.widthAnchor.constraint(equalToConstant: 44),
            previousMonthButton.heightAnchor.constraint(equalToConstant: 44),
            
            nextMonthButton.trailingAnchor.constraint(equalTo: dateSelectorView.trailingAnchor, constant: -16),
            nextMonthButton.centerYAnchor.constraint(equalTo: dateSelectorView.centerYAnchor),
            nextMonthButton.widthAnchor.constraint(equalToConstant: 44),
            nextMonthButton.heightAnchor.constraint(equalToConstant: 44),
            
            monthLabel.centerXAnchor.constraint(equalTo: dateSelectorView.centerXAnchor),
            monthLabel.centerYAnchor.constraint(equalTo: dateSelectorView.centerYAnchor, constant: -10),
            monthLabel.leadingAnchor.constraint(equalTo: previousMonthButton.trailingAnchor, constant: 8),
            monthLabel.trailingAnchor.constraint(equalTo: nextMonthButton.leadingAnchor, constant: -8),
            
            yearLabel.centerXAnchor.constraint(equalTo: dateSelectorView.centerXAnchor),
            yearLabel.topAnchor.constraint(equalTo: monthLabel.bottomAnchor, constant: 4),
            
            // Summary card constraints
            summaryCardView.topAnchor.constraint(equalTo: dateSelectorView.bottomAnchor, constant: 16),
            summaryCardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            summaryCardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            summaryCardView.heightAnchor.constraint(equalToConstant: 100),
            
            totalExpensesLabel.topAnchor.constraint(equalTo: summaryCardView.topAnchor, constant: 20),
            totalExpensesLabel.leadingAnchor.constraint(equalTo: summaryCardView.leadingAnchor, constant: 20),
            totalExpensesLabel.trailingAnchor.constraint(equalTo: summaryCardView.trailingAnchor, constant: -20),
            
            expensesAmountLabel.topAnchor.constraint(equalTo: totalExpensesLabel.bottomAnchor, constant: 8),
            expensesAmountLabel.leadingAnchor.constraint(equalTo: summaryCardView.leadingAnchor, constant: 20),
            expensesAmountLabel.trailingAnchor.constraint(equalTo: summaryCardView.trailingAnchor, constant: -20),
            
            // Pie chart view constraints
            pieChartView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            pieChartView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            pieChartView.heightAnchor.constraint(equalToConstant: 250),
            
            // Bar chart view constraints
            barChartView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            barChartView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            barChartView.heightAnchor.constraint(equalToConstant: 250),
            
            // Generate report button constraints
            generateReportButton.topAnchor.constraint(equalTo: barChartView.bottomAnchor, constant: 24),
            generateReportButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            generateReportButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            generateReportButton.heightAnchor.constraint(equalToConstant: 50),
            generateReportButton.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -24)
        ])
    }
    
    private func setupNavigationBar() {
        title = "Informes"
        
        if #available(iOS 15.0, *) {
            let appearance = UINavigationBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .systemBackground
            appearance.titleTextAttributes = [.foregroundColor: UIColor.label]
            navigationController?.navigationBar.standardAppearance = appearance
            navigationController?.navigationBar.scrollEdgeAppearance = appearance
        }
    }
    
    // MARK: - Data loading methods
    
    private func loadData() {
        // Update date display
        updateDateDisplay()
        
        // Get monthly summary
        let summary = DatabaseManager.shared.getMonthlySummary(month: currentMonth, year: currentYear)
        expensesByCategory = summary.expensesByCategory
        
        // Update total amount
        expensesAmountLabel.text = CurrencyManager.shared.formatAmount(summary.totalExpenses)
        
        // Group expenses by day
        loadExpensesByDay()
        
        // Update charts
        updatePieChart()
        updateBarChart()
    }
    
    private func updateDateDisplay() {
        // Update month name
        let monthName = DateUtils.shared.getMonthName(month: currentMonth)
        monthLabel.text = monthName.capitalized
        
        // Update year
        yearLabel.text = "\(currentYear)"
    }
    
    private func loadExpensesByDay() {
        // Get expenses for current month
        let expenses = DatabaseManager.shared.fetchExpenses(forMonth: currentMonth, year: currentYear)
        
        // Group by day
        expensesByDay = [:]
        let calendar = Calendar.current
        
        for expense in expenses {
            let day = calendar.component(.day, from: expense.date)
            if let existingAmount = expensesByDay[day] {
                expensesByDay[day] = existingAmount + expense.amount
            } else {
                expensesByDay[day] = expense.amount
            }
        }
    }
    
    private func updatePieChart() {
        guard !expensesByCategory.isEmpty else {
            pieChartView.data = nil
            pieChartView.noDataText = "Sin datos para mostrar"
            return
        }
        
        var entries: [PieChartDataEntry] = []
        var colors: [UIColor] = []
        
        let colorPalette: [UIColor] = [
            .systemBlue, .systemRed, .systemGreen, .systemOrange,
            .systemPurple, .systemTeal, .systemYellow, .systemIndigo
        ]
        
        var colorIndex = 0
        
        for (category, amount) in expensesByCategory {
            entries.append(PieChartDataEntry(value: amount, label: category))
            colors.append(colorPalette[colorIndex % colorPalette.count])
            colorIndex += 1
        }
        
        let dataSet = PieChartDataSet(entries: entries, label: "Categorías")
        dataSet.colors = colors
        dataSet.sliceSpace = 2
        dataSet.valueFont = UIFont.systemFont(ofSize: 12)
        dataSet.valueTextColor = .label
        
        let data = PieChartData(dataSet: dataSet)
        pieChartView.data = data
        pieChartView.highlightValues(nil)
    }
    
    private func updateBarChart() {
        guard !expensesByDay.isEmpty else {
            barChartView.data = nil
            barChartView.noDataText = "Sin datos para mostrar"
            return
        }
        
        var entries: [BarChartDataEntry] = []
        let sortedDays = expensesByDay.keys.sorted()
        
        for day in sortedDays {
            if let amount = expensesByDay[day] {
                entries.append(BarChartDataEntry(x: Double(day), y: amount))
            }
        }
        
        let dataSet = BarChartDataSet(entries: entries, label: "Gastos por Día")
        dataSet.colors = [UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)]
        dataSet.valueFont = UIFont.systemFont(ofSize: 10)
        dataSet.valueFormatter = DefaultValueFormatter(formatter: NumberFormatter())
        
        let data = BarChartData(dataSet: dataSet)
        barChartView.data = data
        
        // Configure X axis to show day numbers
        barChartView.xAxis.valueFormatter = DayAxisValueFormatter()
        barChartView.xAxis.labelCount = sortedDays.count
        barChartView.xAxis.granularity = 1
        
        barChartView.fitBars = true
        barChartView.animate(yAxisDuration: 0.5)
    }
    
    // MARK: - Action methods
    
    @objc private func previousMonthTapped() {
        currentMonth -= 1
        if currentMonth < 1 {
            currentMonth = 12
            currentYear -= 1
        }
        loadData()
    }
    
    @objc private func nextMonthTapped() {
        currentMonth += 1
        if currentMonth > 12 {
            currentMonth = 1
            currentYear += 1
        }
        loadData()
    }
    
    @objc private func generateReportTapped() {
        // In a real app, this would generate and share an Excel file
        
        let alert = UIAlertController(
            title: "Generar Reporte",
            message: "Esta función generaría un reporte Excel con los datos del mes seleccionado.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Aceptar", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func currencyDidChange() {
        loadData()
    }
}

// MARK: - DayAxisValueFormatter

class DayAxisValueFormatter: AxisValueFormatter {
    func stringForValue(_ value: Double, axis: AxisBase?) -> String {
        return "\(Int(value))"
    }
}
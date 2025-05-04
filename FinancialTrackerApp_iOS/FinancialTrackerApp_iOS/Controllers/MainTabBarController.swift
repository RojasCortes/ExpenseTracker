import UIKit

class MainTabBarController: UITabBarController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set up the view controllers
        let dashboardVC = DashboardViewController()
        let expensesVC = ExpensesViewController()
        let accountsVC = AccountsViewController()
        let reportsVC = ReportsViewController()
        
        // Configure each view controller
        dashboardVC.tabBarItem = UITabBarItem(title: "Dashboard", image: UIImage(systemName: "chart.bar"), tag: 0)
        expensesVC.tabBarItem = UITabBarItem(title: "Gastos", image: UIImage(systemName: "creditcard"), tag: 1)
        accountsVC.tabBarItem = UITabBarItem(title: "Cuentas", image: UIImage(systemName: "wallet.pass"), tag: 2)
        reportsVC.tabBarItem = UITabBarItem(title: "Informes", image: UIImage(systemName: "doc.text.chart"), tag: 3)
        
        // Embed in navigation controllers
        let dashboardNav = UINavigationController(rootViewController: dashboardVC)
        let expensesNav = UINavigationController(rootViewController: expensesVC)
        let accountsNav = UINavigationController(rootViewController: accountsVC)
        let reportsNav = UINavigationController(rootViewController: reportsVC)
        
        // Set the view controllers array
        self.viewControllers = [dashboardNav, expensesNav, accountsNav, reportsNav]
        
        // Customize appearance
        UITabBar.appearance().tintColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        
        if #available(iOS 15.0, *) {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .systemBackground
            tabBar.standardAppearance = appearance
            tabBar.scrollEdgeAppearance = tabBar.standardAppearance
        }
    }
}
// Project Data - Contains all project information for the portfolio
// This data is used to populate the project detail modal

const projectsData = {
    "budget-buddy": {
        id: "budget-buddy",
        title: "Budget Buddy (AI Tracker)",
        shortDescription: "An AI-driven expense tracker developed during a 2025 Hackathon.",
        fullDescription: `Budget Buddy is an AI-powered expense tracking application that helps users manage their finances intelligently. Developed during a 2025 Hackathon, this application integrates machine learning algorithms for intelligent expense categorization and provides personalized budgeting insights.

The application learns from user spending patterns to automatically categorize transactions, detect anomalies, and offer actionable financial advice. Users can set budget goals, track spending across categories, and receive real-time notifications when approaching limits.`,
        features: [
            "AI-Powered Expense Categorization",
            "Smart Budget Insights & Recommendations",
            "Real-time Spending Notifications",
            "Multi-Account Support",
            "Data Export & Reporting",
            "Dark Mode & Modern UI",
            "Secure Authentication"
        ],
        techStack: ["Python", "Flask", "Firebase", "Machine Learning", "REST API"],
        credits: "Ethan Arsenault and George Farag",
        screenshots: [
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy1.png",
                alt: "Budget Buddy Dashboard",
                caption: "Main dashboard showing spending overview and recent transactions"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy2.png",
                alt: "Expense Entry",
                caption: "Quick expense entry with AI suggestion"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy3.png",
                alt: "Analytics View",
                caption: "Detailed spending analytics and trends"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy4.png",
                alt: "Budget Goals",
                caption: "Budget goals tracking with progress indicators"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy5.png",
                alt: "AI Insights",
                caption: "AI-powered financial insights and recommendations"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy6.png",
                alt: "Category Analysis",
                caption: "Spending breakdown by category"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy7.png",
                alt: "Settings",
                caption: "App settings and preferences"
            },
            {
                src: "docs/screenshots/budgetBuddy/budgetbuddy8.png",
                alt: "Export Options",
                caption: "Data export and report generation"
            },
            {
                src: "docs/screenshots/budgetBuddy/login.png",
                alt: "Login Page",
                caption: "Secure user authentication"
            },
            {
                src: "docs/screenshots/budgetBuddy/register.png",
                alt: "Registration Page",
                caption: "New user registration"
            },
            {
                src: "docs/screenshots/budgetBuddy/BudgetBuddyLogo.png",
                alt: "App Logo",
                caption: "Budget Buddy Application Logo"
            }
        ],
        installation: `1. Clone the repository:
   git clone https://github.com/brownson123/budget-buddy.git
   cd budget-buddy

2. Create a virtual environment:
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Download the serviceAccountKey.json
   - Place it in the project root

5. Run the application:
   python app.py

6. Open http://localhost:5000 in your browser`
    },

    "triple-a-casino": {
        id: "triple-a-casino",
        title: "Triple-A Casino App",
        shortDescription: "A mobile casino app featuring Poker, Blackjack, and Crazy 8.",
        fullDescription: `Triple-A Casino is a feature-rich mobile casino application built with .NET MAUI, offering an authentic casino experience on both iOS and Android platforms. The app features three classic casino games: Texas Hold'em Poker, Blackjack, and Crazy 8 (a variation of Euchre).

The application utilizes Firebase for real-time user data management, including user authentication, leaderboards, and social features. Each game implements authentic casino rules and features smooth animations for an immersive gaming experience.`,
        features: [
            "Texas Hold'em Poker with multiplayer support",
            "Classic Blackjack with customizable rules",
            "Crazy 8 card game (Euchre variation)",
            "Real-time leaderboards",
            "User statistics and achievements",
            "Social features and friend system",
            "In-app currency and betting system",
            "Responsive cross-platform UI"
        ],
        techStack: ["C#", ".NET MAUI", "Firebase", "Xamarin.Forms", "MVVM Architecture"],
        credits: "Abinash Singh Patti and Aybars Ay",
        videoLink: "https://sheridanc-my.sharepoint.com/:v:/g/personal/omotoyeb_shernet_sheridancollege_ca/IQCduVhTzTyIR7mrzpaflt39AeMfbsYZ9VBCjFTkTz4F5NY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=8TLvhn",
        screenshots: [
            {
                src: "https://cdn.britannica.com/95/124395-004-3B484C8B/hand-cards-trump-spades.jpg",
                alt: "Triple-A Casino App",
                caption: "Triple-A Casino Mobile App - Poker, Blackjack & Crazy 8 (Click to watch video)",
                isVideo: true
            }
        ],
        installation: `1. Clone the repository:
   git clone https://github.com/brownson123/triple-acasino.git
   cd triple-acasino

2. Open the solution in Visual Studio 2022 or VS Code:
   open TripleACasino.sln

3. Restore NuGet packages:
   - Right-click solution > Restore NuGet Packages

4. Set up Firebase:
   - Create a Firebase project
   - Add Android and iOS apps
   - Download google-services.json (Android) and GoogleService-Info.plist (iOS)
   - Place in respective platform folders

5. Build and run:
   - Select target platform (Android/iOS)
   - Press F5 to build and deploy

Note: Requires Visual Studio 2022 with .NET MAUI workload installed.`
    },

    "save-the-princess": {
        id: "save-the-princess",
        title: "Save the Princess (Heroes Unite)",
        shortDescription: "An interactive Tkinter-based game featuring multiple quests and dynamic backgrounds.",
        fullDescription: `Save the Princess (also known as Heroes Unite) is an engaging text-based adventure game built with Python using tkinter for the GUI. Players choose between Mario or Luigi to embark on a heroic quest to rescue Princess Peach from Bowser's clutches.

The game features three challenging quests that test different character attributes: Strength, Dexterity, and Intelligence. Each challenge uses unique dice-roll mechanics and offers different outcomes based on player performance.`,
        features: [
            "Character selection between Mario and Luigi",
            "Three unique challenges (Strength, Dexterity, Intelligence)",
            "Dice-roll based gameplay mechanics",
            "Dynamic stat system with rewards and penalties",
            "Multiple endings (Win, Critical Win, Loss, Critical Loss)",
            "Custom backgrounds for each quest",
            "Smooth transitions and animations",
            "Interactive dialog boxes and feedback"
        ],
        techStack: ["Python", "Tkinter", "Pillow", "OOP Design Patterns"],
        screenshots: [],
        installation: `1. Ensure you have Python 3.x installed:
   python --version

2. Install required dependency:
   pip install Pillow

3. Navigate to the project directory:
   cd "Heroes Unite"

4. Run the game:
   python Main.py

5. Enjoy the game!

Project Structure:
   Heroes Unite/
   ├── Main.py          # Entry point, initializes the game screen
   ├── Game.py          # Handles game logic, UI, and all challenges
   ├── Characters.py    # Manages character selection and stats
   ├── Images/          # Contains all game assets
   └── README.md        # Documentation`
    },

    "medicare": {
        id: "medicare",
        title: "Medicare - Pharmacy Management System",
        shortDescription: "A full-stack pharmacy management application with 4 user roles.",
        fullDescription: `Medicare is a comprehensive full-stack pharmacy management system built with Spring Boot (backend) and Angular (frontend). This multi-role application provides a complete pharmacy workflow including patient management, prescription processing, appointment scheduling, and pharmacy inventory management.

The system supports four distinct user roles: Administrators, Pharmacists, Prescribers (Doctors), and Patients. Each role has a tailored dashboard with specific functionalities relevant to their responsibilities.`,
        features: [
            "Multi-role authentication (Admin, Pharmacist, Prescriber, Patient)",
            "Complete prescription workflow (Create → Approve → Dispense)",
            "Patient profile and medical history management",
            "Appointment scheduling system",
            "Medication inventory tracking",
            "Audit logging for compliance",
            "JWT-based secure authentication",
            "Real-time dashboard updates"
        ],
        techStack: ["Java", "Spring Boot", "Angular", "MySQL", "JWT", "Flyway"],
        screenshots: [
            {
                src: "docs/screenshots/pharmacy-app/login-page.png",
                alt: "Login Page",
                caption: "Secure authentication portal supporting all user roles"
            },
            {
                src: "docs/screenshots/pharmacy-app/admin-overview.png",
                alt: "Admin Dashboard",
                caption: "Administrative overview with system statistics"
            },
            {
                src: "docs/screenshots/pharmacy-app/admin-staff-list.png",
                alt: "Staff Management",
                caption: "Complete staff directory with role filtering"
            },
            {
                src: "docs/screenshots/pharmacy-app/add-staff.png",
                alt: "Add Staff",
                caption: "Staff registration form with role assignment"
            },
            {
                src: "docs/screenshots/pharmacy-app/admin-audit-logs.png",
                alt: "Audit Logs",
                caption: "Comprehensive system activity audit trail"
            },
            {
                src: "docs/screenshots/pharmacy-app/admin-drug-list.png",
                alt: "Drug Inventory",
                caption: "Medication inventory management view"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-overview.png",
                alt: "Pharmacist Dashboard",
                caption: "Pharmacy workflow management dashboard"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-pending.png",
                alt: "Pending Prescriptions",
                caption: "Prescriptions awaiting pharmacist review"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-deny.png",
                alt: "Deny Prescription",
                caption: "Reason capture for prescription denial"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-ready-dispense.png",
                alt: "Ready to Dispense",
                caption: "Approved prescriptions ready for pickup"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-dispense-modal.png",
                alt: "Dispense Modal",
                caption: "Medication dispensing workflow"
            },
            {
                src: "docs/screenshots/pharmacy-app/pharmacist-dispense-history.png",
                alt: "Dispense History",
                caption: "Complete dispensing history with refill tracking"
            },
            {
                src: "docs/screenshots/pharmacy-app/prescriber-overview.png",
                alt: "Prescriber Dashboard",
                caption: "Doctor view with appointments and prescriptions"
            },
            {
                src: "docs/screenshots/pharmacy-app/prescriber-write-rx.png",
                alt: "Write Prescription",
                caption: "Complete prescription creation form"
            },
            {
                src: "docs/screenshots/pharmacy-app/prescriber-rx-history.png",
                alt: "Prescription History",
                caption: "All prescriptions written by the prescriber"
            },
            {
                src: "docs/screenshots/pharmacy-app/prescriber-patients.png",
                alt: "My Patients",
                caption: "Quick access to patient list"
            },
            {
                src: "docs/screenshots/pharmacy-app/prescriber-appointment.png",
                alt: "Appointments",
                caption: "Appointment calendar view"
            },
            {
                src: "docs/screenshots/pharmacy-app/patient-overview.png",
                alt: "Patient Dashboard",
                caption: "Personal health portal overview"
            },
            {
                src: "docs/screenshots/pharmacy-app/patient-prescriptions.png",
                alt: "My Prescriptions",
                caption: "Personal medication list with status"
            },
            {
                src: "docs/screenshots/pharmacy-app/patient-edit-profile.png",
                alt: "Edit Profile",
                caption: "Patient profile editing form"
            },
            {
                src: "docs/screenshots/pharmacy-app/patient-list.png",
                alt: "Patient List",
                caption: "Searchable patient directory"
            },
            {
                src: "docs/screenshots/pharmacy-app/patient-details.png",
                alt: "Patient Details",
                caption: "Comprehensive patient record view"
            },
            {
                src: "docs/screenshots/pharmacy-app/add-patient.png",
                alt: "Add Patient",
                caption: "New patient registration form"
            },
            {
                src: "docs/screenshots/pharmacy-app/book-appointment.png",
                alt: "Book Appointment",
                caption: "Appointment scheduling interface"
            }
        ],
        installation: `Prerequisites:
- Java 21 or higher
- Node.js and npm
- MySQL 8.0

Backend Setup:
1. Navigate to backend directory:
   cd pharmacy-backend

2. Configure database in src/main/resources/application.properties:
   spring.datasource.url=jdbc:mysql://localhost:3306/medicare
   spring.datasource.username=your_username
   spring.datasource.password=your_password

3. Run the application:
   ./mvnw spring-boot:run  # or use IDE

4. Flyway will automatically apply database migrations

Frontend Setup:
1. Navigate to frontend directory:
   cd pharmacy-frontend

2. Install dependencies:
   npm install

3. Start development server:
   npm start

4. Open http://localhost:4200

Default credentials available in USER_CREDENTIALS.md`
    },

    "flutter-travel": {
        id: "flutter-travel",
        title: "Flutter Travel Booking App",
        shortDescription: "A cross-platform mobile travel booking app with destination browsing and favorites system.",
        fullDescription: `Flutter Travel Booking App is a premium, cross-platform mobile application built with Flutter that allows users to browse travel destinations, customize trip packages, and manage bookings. This project demonstrates complex UI/UX patterns, state management with Provider, and local data persistence.

The application features a beautiful, modern interface with hero animations, parallax headers, and seamless transitions between screens. Users can browse curated trip packages, save favorites, and complete bookings with dynamic pricing.`,
        features: [
            "Browse Destinations with horizontal scrolling lists",
            "Smart Search with real-time filtering",
            "Detailed Trip View with parallax headers",
            "Favorites/Wishlist system",
            "Advanced booking with date selection",
            "Dynamic pricing based on guest count",
            "VIP treatment toggle with surcharge",
            "Swipe-to-dismiss bookings",
            "Local data persistence with Shared Preferences"
        ],
        techStack: ["Flutter", "Dart", "Provider", "Shared Preferences", "Intl"],
        screenshots: [
            {
                src: "docs/screenshots/flutter/screenshot-home.png",
                alt: "Home Screen",
                caption: "Browse destinations with search functionality"
            },
            {
                src: "docs/screenshots/flutter/screenshot-details.png",
                alt: "Details Screen",
                caption: "Trip details with pricing and descriptions"
            },
            {
                src: "docs/screenshots/flutter/screenshot-booking.png",
                alt: "Booking Modal",
                caption: "Select dates, guests & VIP options"
            },
            {
                src: "docs/screenshots/flutter/screenshot-my-trips.png",
                alt: "My Trips Screen",
                caption: "View and manage your bookings"
            },
            {
                src: "docs/screenshots/flutter/screenshot-empty.png",
                alt: "Empty State",
                caption: "Empty state with swipe hint"
            }
        ],
        installation: `1. Prerequisites:
   - Flutter SDK installed
   - Android Studio or VS Code with Flutter extension

2. Clone the repository:
   git clone https://github.com/brownson123/travel_app.git
   cd travel_app

3. Install dependencies:
   flutter pub get

4. Run the app:
   # Mobile (Simulator/Device):
   flutter run

   # Web (Chrome):
   flutter run -d chrome

Key Files:
   lib/
   ├── models.dart           # Trip and Booking data models
   ├── storage_service.dart  # Local storage abstraction
   ├── booking_provider.dart # State management (MVVM)
   ├── home_screen.dart      # Main browsing screen
   ├── details_screen.dart   # Trip detail view with booking modal
   └── my_trips_screen.dart  # Booking management screen`
    }
};

// Export for use in other files
window.projectsData = projectsData;


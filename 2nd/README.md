# Flutter Travel Booking App

*A premium, cross-platform mobile application built with Flutter*

**Flutter 3.x** | **Provider** | **Shared Preferences**



---

A premium, cross-platform mobile application built with Flutter that allows users to browse travel destinations, customize trip packages, and manage bookings. This project demonstrates complex UI/UX patterns, state management with **Provider**, and local data persistence.

## Features

### Core Functionality
* **Browse Destinations:** Horizontal scrolling list of curated trip packages with high-quality imagery.
* **Smart Search:** Real-time filtering of trips by title or destination (e.g., "Japan", "Safari").
* **Detailed Trip View:** Immersive parallax headers, trip descriptions, and pricing details.
* **Favorites System:** "Heart" trips to save them to a Wishlist without booking.

### Advanced Booking Engine
* **Customization:** Users can select:
    * **Start Date:** Integrated calendar picker.
    * **Guest Count:** Dynamic price calculation based on the number of people.
    * **VIP Treatment:** Toggle specific upgrades (adds a surcharge).
* **Dynamic Pricing:** Total price updates instantly as options are changed.
* **Validation:** "Confirm" button remains disabled until Terms & Conditions are accepted and a date is picked.

### Data Persistence
* **Local Storage:** All bookings and favorites are saved permanently to the device using `shared_preferences`.
* **Cross-Platform:** Works on iOS, Android, and Web (using LocalStorage).
* **Robust Error Handling:** "Crash-proof" loading logic handles empty or corrupt data gracefully.

###  UI/UX Polish
* **Hero Animations:** Seamless image transitions between the Home and Details screens.
* **Swipe-to-Dismiss:** Intuitive gesture to cancel bookings in the "My Trips" list.
* **Adaptive Feedback:** Snackbars and visual cues (Green/Red icons) confirm user actions.

---

##  Tech Stack

* **Framework:** [Flutter](https://flutter.dev/) (Dart)
* **State Management:** [Provider](https://pub.dev/packages/provider) (MVVM Architecture)
* **Persistence:** [Shared Preferences](https://pub.dev/packages/shared_preferences) & JSON Serialization
* **Formatting:** [Intl](https://pub.dev/packages/intl) (Currency and Date formatting)

---

## Project Structure & Components

The codebase is organized for scalability and readability.

### 1. Data Layer (`/lib`)
* **`models.dart`**:
    * **`Trip`**: Immutable class defining destination data (ID, title, price, image).
    * **`Booking`**: Complex class that stores transaction details (User ID, selected date, guest count, VIP status, total price). Includes `fromJson` and `toJson` logic for storage.
* **`storage_service.dart`**:
    * Abstracts the file system/local storage logic.
    * Handles writing/reading JSON strings to disk.
    * Includes debug logs to track saving success/failure.

### 2. State Management
* **`booking_provider.dart`**:
    * The "Brain" of the app.
    * Holds the list of `_bookings` and `_favorites`.
    * **`addBooking()`**: Calculates totals, adds to memory, triggers a save.
    * **`loadBookings()`**: Asynchronously fetches data on app launch to prevent race conditions.
    * **`toggleFavorite()`**: Manages the wishlist state.

### 3. UI Layer (`/lib`)
* **`home_screen.dart`**:
    * **StatefulWidget** to handle the Search Bar input.
    * Displays the "Deals" list using `ListView.builder`.
    * Implements `Hero` widgets for the transition to details.
* **`details_screen.dart`**:
    * Uses `SliverAppBar` for the collapsing header effect.
    * Contains the **`BookingModal`** widget: A sophisticated bottom sheet handling the entire form logic (Date Picker, Switches, Checkboxes).
* **`my_trips_screen.dart`**:
    * Displays the user's itinerary.
    * Uses `Dismissible` widgets to allow users to swipe-left to cancel a trip.
    * Shows "VIP" badges and formatted dates.

---

##  Screenshots

<div align="center">

| Home Screen | Details Screen | Booking Modal |
|-------------|----------------|---------------|
| ![Home Screen](docs/images/screenshot-home.png) | ![Details Screen](docs/images/screenshot-details.png) | ![Booking Modal ](docs/images/screenshot-booking.png) |
| Browse destinations with search | View trip details & pricing | Select dates, guests & VIP options |

| My Trips Screen | Empty State |
|-----------------|-------------|
| ![My Trips](docs/images/screenshot-my-trips.png) | ![Empty State](docs/images/screenshot-empty.png) |
| View & manage bookings | Swipe to cancel trips |

</div>

## How to Run

1.  **Prerequisites:** Ensure you have the Flutter SDK installed.
2.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/brownson123/travel_app.git](https://github.com/brownson123/travel_app.git)
    cd travel_app
    ```
3.  **Install Dependencies:**
    ```bash
    flutter pub get
    ```
4.  **Run the App:**
    * **Mobile (Simulator/Device):**
        ```bash
        flutter run
        ```
    * **Web (Chrome):**
        ```bash
        flutter run -d chrome
        ```

---

## Key Code Snippets

### The Booking Logic (Provider)
We ensure data safety by waiting for the load to finish before allowing new writes.
```dart
Future<void> addBooking(...) async {
  if (_isLoading) await loadBookings(); // Prevent race condition

  _bookings.add(Booking(
    tripDate: selectedDate,
    isVip: isVip,
    totalPrice: calculatedTotal,
    // ... other fields
  ));
  
  notifyListeners(); // Update UI instantly
  await _saveBookings(); // Persist to disk
}
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `flutter` | ^3.0.0 | SDK |
| `provider` | ^6.0.5 | State management |
| `shared_preferences` | ^2.2.2 | Local data persistence |
| `intl` | ^0.18.1 | Currency & date formatting |
| `flutter_test` | sdk | Testing framework |

---

## Future Enhancements

- [ ] User authentication (Firebase/Auth0)
- [ ] Cloud sync across devices
- [ ] Push notifications for trip reminders
- [ ] In-app payment processing (Stripe)
- [ ] Travel agent chat support
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Travel reviews & ratings system
- [ ] Share trips with friends
- [ ] Offline mode with cached destinations

---

## Troubleshooting

### App won't start
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

### Shared Preferences not persisting (Web)
- Web browsers require HTTPS for Shared Preferences to work properly
- Use `flutter run -d chrome` with a secure context

### Hot reload not working
- Ensure you're running `flutter run` (not `flutter build`)
- Check that you're in the correct project directory
- Try "Hot Restart" (r in terminal) instead of Hot Reload

### Icons not showing
```bash
flutter pub get
flutter clean
```

---

## Support

If you encounter any issues or have questions, please contact me @omotoyebrownson@yahoo.com
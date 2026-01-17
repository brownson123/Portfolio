# Heroes Unite

A text-based adventure game built with Python using tkinter for the GUI. Players choose between Mario or Luigi to rescue Princess Peach from Bowser through three challenging quests that test Strength, Dexterity, and Intelligence.

## Game Overview

In this interactive adventure, players embark on a heroic journey to save the Princess from Bowser's clutches. The game features three distinct challenges, each testing different character attributes.

### Storyline
The peace of the Mushroom Kingdom has been shattered by Bowser, who has captured the beloved Princess. Our hero—whether Mario or Luigi—must face three harrowing quests to save her:
1. **Tower of Titans** - Tests Strength
2. **Cavern of Shadows** - Tests Dexterity  
3. **Labyrinth of Mind** - Tests Intelligence

## Characters

### Mario
- **STR**: 1
- **DEX**: -1
- **IQ**: 1

### Luigi
- **STR**: 2
- **DEX**: 0
- **IQ**: -1

## Challenges

### Challenge 1: Tower of Titans
- **Attribute Tested**: Strength
- **How to Play**: Roll the dice 4 times. Each roll is added to your character's Strength value.
- **Win Condition**: Total score between 33-43
- **Critical Win**: Score ≥ 44 (reward: +1 Strength)
- **Critical Loss**: Score < 25 (penalty: -1 Strength)

### Challenge 2: Cavern of Shadows
- **Attribute Tested**: Dexterity
- **How to Play**: Roll to jump between platforms. Your character's Dexterity is added to each roll.
- **Win Condition**: Make at least 3 out of 6 successful jumps
- **Critical Win**: 5+ successful jumps (reward: +1 Dexterity)
- **Critical Loss**: < 2 successful jumps (penalty: -1 Dexterity)

### Challenge 3: Labyrinth of Mind
- **Attribute Tested**: Intelligence
- **How to Play**: Solve puzzle pieces. Your character's Intelligence is added to each roll.
- **Win Condition**: Correctly place at least 4 out of 6 pieces
- **Critical Win**: 5+ pieces correct (reward: +1 Intelligence)
- **Critical Loss**: < 2 pieces correct (penalty: -1 Intelligence)

## Installation

1. Ensure you have Python 3.x installed
2. Install the required dependency:
```bash
pip install Pillow
```

## Running the Game

Navigate to the project directory and run:
```bash
python Main.py
```

## Project Structure

```
Heroes Unite/
├── Main.py          # Entry point, initializes the game screen
├── Game.py          # Handles game logic, UI, and all challenges
├── Characters.py    # Manages character selection and stats
├── Images/          # Contains all game assets
│   ├── Welcome.webp
│   ├── ChooseHero.jpg
│   ├── Challenge1.jpeg
│   ├── challenge1over.jpg
│   ├── challenge2.jpg
│   ├── Challenge3.jpg
│   ├── challenge3intro.jpg
│   └── ending.jpg
└── README.md        # This file
```

## Visual Features

- Custom welcome screen with game introduction
- Character selection screen with stat display
- Unique background images for each challenge
- Victory and defeat screens with appropriate messaging
- Interactive buttons and dialog boxes

## Dice Mechanics

- Each dice roll generates a random number between 2 and 12
- Character stats are added to each roll
- Multiple outcomes per challenge (Critical Win, Win, Loss, Critical Loss)
- Rewards and penalties affect character stats

## Notes

- The game saves your character's stats during gameplay
- Retry options available after failures
- Main menu access at any failure point
- All challenges must be completed in order to reach the ending
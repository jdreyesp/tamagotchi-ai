# Product Requirements Document (PRD) for Tamagotchi Game

## Project Overview
The Tamagotchi Game is a web-based simulation where players can take care of a virtual pet (Tamagotchi) and train it to take care of other Tamagotchis (referred to as "pets"). A Tamagotchi can feed and train its pets, while also managing its own hunger, happiness, and health. The game will be implemented with a user-friendly interface, using animations and real-time updates to reflect the actions taken by the Tamagotchi.

The game will feature:
- **Tamagotchis** that can be created, fed, and trained.
- **Tamagotchi parents** that can create and take care of **pets**.
- A log of actions showing how Tamagotchis take care of their pets.
- Interactive icons and animations for actions like feeding and training.
  
The frontend will be built using **Next.js**, **SVG** for representations, **Tailwind** for styling, **ShadCN** for UI components, **Redux** for state management, and **Spring-React** for animations.

## Core Functionality

### 1. Tamagotchi Creation
- **Attributes**:
  - **Name**: A customizable name for the Tamagotchi.
  - **Level**: Starts at level 1.
  - **Hunger Level**: Starts at 50/100.
  - **Happiness Level**: Starts at 50/100.
  - **Health Level**: Starts at 50/100.

### 2. Feeding a Tamagotchi
- **Effect on Attributes**:
  - **Hunger Level**: Decreases by 10.
  - **Happiness Level**: Increases by 5.
  - **Health Level**: Decreases by 5.
  - **Icon**: A chicken icon appears when feeding the Tamagotchi.

### 3. Training a Tamagotchi
- **Effect on Attributes**:
  - **Hunger Level**: Increases by 5.
  - **Happiness Level**: Decreases by 10.
  - **Health Level**: Increases by 10.
  - **Icon**: A weight icon appears when training the Tamagotchi.

### 4. Creating a Pet
- **Tamagotchi Parent**:
  - Has the ability to create a pet when its happiness level reaches 100 and with a 50% chance.
  - A Tamagotchi can have a maximum of 3 pets at any given time.
  - The pet created will have the following attributes:
    - **Level**: Starts at level 1.
    - **Hunger Level**: 50/100.
    - **Happiness Level**: 50/100.
    - **Health Level**: 50/100.
  - **Icon**: A heart icon appears when creating a pet.

### 5. Feeding Pets
- **Effect on Attributes**:
  - **Hunger Level**: Increases by 10.
  - **Happiness Level**: Increases by 5.
  - **Health Level**: Decreases by 5.
  - **Icon**: A chicken icon appears when feeding a pet.

### 6. Training Pets
- **Effect on Attributes**:
  - **Hunger Level**: Decreases by 5.
  - **Happiness Level**: Decreases by 10.
  - **Health Level**: Increases by 10.
  - **Icon**: A weight icon appears when training a pet.

### 7. Action Log
- Each action (feeding, training, creating a pet, etc.) will be logged in a timeline or activity log. This log can be displayed graphically to track the progress of a Tamagotchi parent and its pets.

## Non-Functional Requirements

- **Performance**: The application must be responsive and fast, with no noticeable delay when interacting with the Tamagotchis (feeding, training, etc.).
- **Scalability**: The app should be capable of handling multiple Tamagotchis and their pets.
- **Accessibility**: The application must be accessible, with easy navigation, clear icons, and alt texts for all visual elements.

## User Stories

1. **As a user**, I want to create a Tamagotchi and name it, so that I can take care of it.
2. **As a user**, I want to feed my Tamagotchi, so that it is no longer hungry.
3. **As a user**, I want to train my Tamagotchi, so that it grows healthier.
4. **As a user**, I want my Tamagotchi parent to create pets when it reaches 100 happiness, so that I can raise additional Tamagotchis.
5. **As a user**, I want to feed and train my pets, so that they grow and improve.
6. **As a user**, I want to see a log of all actions performed by my Tamagotchi and its pets, so that I can track their progress.

## File Structure

The project will follow the structure below:

```
tamagotchi-game/
├── backend/                  # Backend logic for handling any server-side operations (optional)
│   └── [api endpoints or logic]
├── frontend/                  # Frontend application
│   ├── app/                   # Main entry point for the Next.js app
│   ├── components/            # Reusable React components (buttons, icons, etc.)
│   │   ├── TamagotchiCard.js  # Card component showing Tamagotchi details
│   │   ├── ActionIcons.js     # Component for action icons (chicken, heart, weight)
│   │   └── LogDisplay.js      # Component to show action log
│   ├── lib/                   # Utility functions (state management, helpers)
│   │   ├── redux/             # Redux store and actions
│   │   │   └── tamagotchiSlice.js  # State management for Tamagotchi
│   │   └── api.js             # API calls (if applicable)
│   ├── public/                # Public assets (SVGs, images, etc.)
│   │   ├── chicken.svg        # Icon for feeding Tamagotchi
│   │   ├── weight.svg         # Icon for training Tamagotchi
│   │   └── heart.svg          # Icon for creating a pet
│   ├── styles/                # Tailwind and custom CSS
│   │   └── globals.css        # Global styles for the application
│   └── pages/                 # Next.js pages
│       ├── index.js           # Home page (Tamagotchi main page)
│       └── tamagotchi/[id].js # Detailed page for each Tamagotchi
└── README.md                  # Documentation on how to run the project
```

## Timeline and Milestones

### Milestone 1: MVP (Minimum Viable Product)
- Create the core Tamagotchi functionality (creation, feeding, training).
- Implement Tamagotchi and pet creation logic.
- Basic UI and styling using Tailwind.
- Integrate Redux for state management.
- Action icons and basic animation (SVG icons for actions).

### Milestone 2: Pet System and Advanced Features
- Add ability for Tamagotchi parents to create pets.
- Implement pet feeding and training.
- Create a log to display actions.
- Animations for the pet system.

### Milestone 3: Final Enhancements and UI Polish
- Advanced UI and responsive design.
- Animations for all interactions (feeding, training, creating pets).
- Optimizations and bug fixing.

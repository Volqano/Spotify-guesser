# Spotify song guessing game

## Overview
The Spotify Song Guessing Game is a multiplayer game where players (max. 4) listen to songs and try to guess them within 60 seconds. The game is built using JavaScript and the Spotify Web API, allowing you to play the game with friends by creating a room and taking turns guessing songs.

This project was created for the Introduction to Cloud Computing and Software Design Practice courses. It was hosted for free on AWS Learners Lab, but due to platform limitations, it can only be active for 4 hours at a time.

The app uses Spotify OAuth for user authentication, along with a JWT token for session management.

## Gameplay
1. Create a Room:
    - Click on Create New Room to generate an 8-character room code.
    - Up to 4 players can join a room using the code.
2. Start Playing:
    - Once everyone is in the room, one player (the host) starts playing a song on Spotify.
    - The song will play simultaneously for all users in the room, and a 60-second timer will start for everyone to guess the song, indicating whether the guess was correct or not.
3. Turn-Based gameplay:
    - After the 60-second timer runs out, the next player gets a chance to play a song, and the cycle continues.

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/Volqano/Spotify-guesser.git
    ```
2. Set Environment Variables:
   You should get your Spotify Client ID and Client Secret from the https://developer.spotify.com
   You will need to create a .env file in the project root with the following variables:
   ```bash
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    JWT_SECRET=randomly_generated_secret
    ```
3. Run the application with docker
   ```bash
   docker-compose up
   ```
4. App should run on http://localhost:81


## Future upgrades
- Competitiveness: Add a scoring system to reward players for guessing songs quickly
- Database Integration: Connect a database to store user statistics and game scores

<img width="1438" alt="Zrzut ekranu 2025-03-5 o 18 57 50" src="https://github.com/user-attachments/assets/e1224044-02b5-436d-b14c-19b123fe71cc" />
<img width="1440" alt="Zrzut ekranu 2025-03-5 o 18 58 34" src="https://github.com/user-attachments/assets/d769c72c-3904-40ee-8738-ee7e903760a5" />

## Authors
- Mateusz Matyskel
- Bartosz Kebel


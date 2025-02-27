# VOXIE

This project demonstrates a Text-to-Speech (TTS) API built with Ballerina language and a professional React frontend.

## Project Structure

- `/src/ballerina` - Ballerina TTS API service
- `/src` - React frontend application

## Features

- Convert text to speech with various voice options
- Adjust speech parameters (speed, pitch, volume)
- Save favorite texts for later use
- View history of previous conversions
- Download generated audio files
- Professional, responsive UI

## Running the Project

### Start the Ballerina Backend

```bash
cd src/ballerina
bal run
```

This will start the Ballerina TTS service on port 9090.

### Start the React Frontend

```bash
npm run dev
```

This will start the React frontend development server.

## API Endpoints

- `GET /api/voices` - Get available voices
- `POST /api/synthesize` - Generate speech from text
- `GET /api/health` - Health check endpoint


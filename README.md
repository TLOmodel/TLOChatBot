# TLO Chatbot

## Overview

The TLO Chatbot is an interactive web application developed for TLO, designed to provide users with detailed, fact-based responses in a conversational format. It seamlessly integrates front-end technologies—HTML, CSS, and JavaScript—with a Python backend that leverages the Google Gemini API for now.

## Features

- **Interactive Chat Interface:** Offers a clean and user-friendly design that facilitates seamless conversations.
- **Dynamic Welcome Screen:** Displays a centered welcome image (`TLO_welcome.png`) upon initial page load, which automatically disappears after the user sends their first message.
- **Responsive Communication:** Provides detailed, fact-based responses to user inquiries.
- **Loading Indicator:** Utilizes a visual cue to inform users when the chatbot is processing a response from the Gemini API.
- **Extended Functionality:** Supports file uploads and voice recording, with ongoing enhancements to fully implement these features.
- **Enhanced Code Display:** Features code block styling accompanied by a copy-to-clipboard functionality for user convenience.

## Technologies Used

- **Front-End:** HTML, CSS, JavaScript
- **Back-End:** Python
- **API Integration:** Google Gemini API

## Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/TLOmodel/TLOChatBot.git
   ```

2. **Set Up Python Environment:**
   - Navigate to the repository directory:
     ```bash
     cd TLOChatBot
     ```
   - Create a virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - On **Windows:**
       ```bash
       .\venv\Scripts\activate
       ```
     - On **macOS/Linux:**
       ```bash
       source venv/bin/activate
       ```
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```
     *Ensure that the `requirements.txt` file includes all necessary dependencies, such as `google-generativeai`.*

3. **Prepare Front-End Assets:**
   - Ensure that the `TLO_welcome.png` image file is located in the same directory as `index.html`.

## Knowledge Base & Model Documentation

- **`knowledge_base/` Folder:** Contains the files that the chatbot references for responses. You can add, remove, or modify files here as needed to adjust the chatbot's knowledge.
- **`model_documentation/` Folder:** Stores resource files related to the chatbot's underlying models and documentation. These files are static and should be referenced as needed.

## Usage

1. **Start the Python Backend:**
   - Activate the virtual environment (if not already active).
   - Run the Python server:
     ```bash
     python server.py
     ```
2. **Open the Chatbot Interface:**
   - Open `index.html` in your web browser.
3. **Interact with the Chatbot:**
   - Upon loading, the welcome image appears.
   - Enter your message in the input field and click the send button (paper plane icon).
   - The welcome image will disappear, and the conversation will commence.
   - The chatbot's responses will follow, with a loading indicator displayed during processing.

## Customization

- **Welcome Image:** To change the welcome image, replace `TLO_welcome.png` with your preferred image, ensuring it has the same filename and resides in the correct directory. Adjust its size by modifying the CSS rules for `#welcome-screen` and `#welcome-image` in the `<style>` section of `index.html`.
- **Styling:** Customize the chatbot's appearance by editing the CSS variables and styles within the `<style>` section of `index.html`.
- **Functionality:** Modify the chatbot's behavior by altering the core logic found in the `<script>` section of `index.html` and the `server.py` file.

## Next Steps

**Connecting to a Local LLM:** Instead of relying on API calls to external services (such as Google Gemini), you can integrate a local Large Language Model (LLM) for improved performance, security, and control.

Update server.py to load a local model and serve responses without external API dependencies.

## Credits

Developed for TLO by Watipaso Mulwafu, Gabriel Bengo and team.

## License

This project is licensed under the MIT License:

```
MIT License

Copyright (c) 2025 TLO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


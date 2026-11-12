# BoundaryBoard — Live Cricket Scoreboard for TRMNL

A simple cricket scoreboard built for TRMNL e-ink displays, showing live cricket scores, team names, wickets, overs, match status, and more!

Built by [Simran (itscryptune)](https://github.com/itscryptune) for the **Hack Club TRMNT** event.

## 👋 Hey, I'm Simran! 

Hey! I'm Simran, and this is one of my projects for Hack Club's TRMNT event.

I learned programming at school and wanted to use those skills to build something real.

After experimenting with TRMNL plugins, I decided to make something related to cricket.

I wanted to build a scoreboard that could display cricket matches without needing to open a sports website every time.

At first, it was just a basic layout showing two teams and their scores. But I kept improving it, adding real API data, match statuses, multiple matches, and different layouts for the TRMNL display.

I also learned a lot about JavaScript, Liquid templates, Docker, Git, and working with real API responses along the way.

---

## 💡 About the Project

BoundaryBoard is a cricket scoreboard designed specifically for TRMNL's e-ink screens.

It fetches match information from the CricketData API and displays it using a minimal black-and-white interface.

The main goal is to make cricket scores easy to understand at a glance.

Instead of displaying a lot of unnecessary information, BoundaryBoard focuses on the things I would usually want to check:

- Which teams are playing?
- What is the current score?
- How many wickets have fallen?
- How many overs have been completed?
- Is the match live, upcoming, or finished?
- What is happening in the match right now?

I wanted the screen to look like a proper cricket match centre while still being readable on an e-ink display.

## ✨ Features

### 🏏 Cricket Scores

- Latest available runs and wickets
- Overs completed
- Full team names
- Team abbreviations
- Match format (T20, ODI, Test, etc.)
- Current match status
- Match venue when available

### 📡 Match States

BoundaryBoard recognizes several match states:

| Status | Meaning |
|---|---|
| LIVE | Match is currently in progress |
| TOSS | Toss information is available, but an innings score hasn't been reported |
| BREAK | Lunch, tea, or innings break |
| STUMPS | Play has ended for the day |
| DELAYED | Match has been interrupted or delayed |
| UPCOMING | Match has not started |
| RESULT | Match has finished |

Match states are determined using the information returned by CricketData.


---

## 📁 Project Structure

```text
Boundary_Board/
├── .github/
│   └── workflows/
├── bin/
├── logo/
│   └── boundaryboard-logo.svg
├── src/
│   ├── settings.yml
│   ├── transform.js
│   ├── shared.liquid
│   ├── full.liquid
│   ├── half_horizontal.liquid
│   ├── half_vertical.liquid
│   └── quadrant.liquid
├── tests/
│   ├── sample-matches.json
│   └── test-transform.cjs
├── .trmnlp.yml
├── .gitignore
└── README.md
```

### Important Files

**`src/settings.yml`**

Contains the plugin settings, API endpoint, refresh interval, and configuration fields.

**`src/transform.js`**

Processes the CricketData API response, identifies match states, associates scores with teams, and sorts matches.

**`src/shared.liquid`**

Contains the shared CSS used by the four scoreboard layouts.

**`src/full.liquid`**

The main full-screen cricket scoreboard.

**`src/half_horizontal.liquid`**

A compact horizontal version of the scoreboard.

**`src/half_vertical.liquid`**

A vertical scoreboard for narrow screen layouts.

**`src/quadrant.liquid`**

A smaller scoreboard for quadrant layouts.

**`logo/boundaryboard-logo.svg`**

The custom cricket batsman logo.

**`tests/`**

Contains sample cricket data and JavaScript tests.

---

## 🚀 Running BoundaryBoard Locally

I developed BoundaryBoard on Windows 11 using Docker and the official TRMNL Preview tool.

### Requirements

Before starting, install:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- A CricketData API key from [CricketData.org](https://cricketdata.org/)

Ruby is not required when running TRMNL Preview through Docker.

### Step 1 — Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/itscryptune/Boundary_Board.git
cd Boundary_Board
```

### Step 2 — Download TRMNL Preview

```powershell
docker pull trmnl/trmnlp
```

Make sure Docker Desktop is running.

### Step 3 — Configure Your CricketData API Key

BoundaryBoard uses the CricketData `currentMatches` endpoint:

```text
https://api.cricapi.com/v1/currentMatches
```

You need your own API key to retrieve match information.

In PowerShell:

```powershell
$env:CRICKET_API_KEY = Read-Host "Enter your CricketData API key"
```


The local `.trmnlp.yml` configuration reads the key using:

```yaml
custom_fields:
  cricket_api_key: "{{ env.CRICKET_API_KEY }}"
```

### Step 4 — Start the Preview Server

Run this command inside the project directory:

```powershell
docker run --rm -it -p 4567:4567 -e CRICKET_API_KEY -v "${PWD}:/plugin" trmnl/trmnlp serve --bind 0.0.0.0
```

### Step 5 — Open the Dashboard

Visit:

**http://localhost:4567**

You should see the TRMNL Preview interface.

Use the **Poll** action to fetch current match data.

You can switch between all four layouts and inspect how the scoreboard looks on a TRMNL screen.

To stop the server, press `Ctrl + C` in the terminal.

---

## ⚙️ How BoundaryBoard Works

The project follows this process:

**1. Fetch match data**

TRMNL requests the latest available matches from CricketData.

**2. Process the API response**

The `transform.js` file reads the JSON response and extracts the information needed for the scoreboard.

**3. Identify match states**

The script checks fields such as `matchStarted`, `matchEnded`, `status`, and available innings scores.

**4. Calculate displayed scores**

Each team's score is associated with its corresponding innings.

For example, if the API returns:

```json
{
  "r": 186,
  "w": 5,
  "o": 20,
  "inning": "India Inning 1"
}
```

BoundaryBoard displays:

```text
IND
186/5
20 OV
```

**5. Sort available matches**

Active matches are prioritized ahead of upcoming matches and completed results.

**6. Render the scoreboard**

Liquid templates display the formatted information in the selected TRMNL layout.

## 🐛 Challenges and Debugging

### 1. Understanding the CricketData API

One of the first challenges was understanding how the API returned cricket scores.

For example, a score response contains `r`, `w`, `o`, and `inning`.

I had to understand how these values related to each team and how to display them correctly.

### 2. Handling Different Match States

A match that has started isn't always actively being played.

For example, the toss might have happened, or the match might be paused.

I added logic to distinguish these situations using the data returned by the API.

### 3. Making Scores Fit on the Screen

The first scoreboard layout was quite basic.

I wanted bigger team abbreviations and a design similar to a professional cricket scoreboard.

I experimented with CSS Flexbox, font sizes, spacing, and borders to make the scores easier to read.

### 4. Supporting Different TRMNL Layouts

The full-screen design had enough room for detailed match information, but the smaller layouts were more challenging.

I had to simplify the design for half-horizontal, half-vertical, and quadrant screens.

### 5. Debugging Missing API Data

At one point, the preview displayed:

`Scores unavailable — Score feed unavailable`

This helped me understand the importance of checking API responses, configuring environment variables, and displaying useful error messages instead of leaving the screen blank.

### 6. Adding a Custom SVG Logo

I also added a custom cricket batsman logo.

This helped me learn about SVG assets, local asset paths, and using images in TRMNL templates.

---

## 📚 What I Learned

Building BoundaryBoard gave me experience with:

- HTML and CSS layouts
- JavaScript functions and arrays
- JSON API responses
- Working with real sports data
- Liquid templates
- Conditional rendering
- Handling errors and missing values
- Sorting and filtering data
- Designing for e-ink displays
- Docker and local development
- Writing tests
- Git commits and version control
- Debugging code step by step

I also learned why it is useful to build a project in smaller stages instead of trying to finish everything at once.

## ⚠️ Limitations

BoundaryBoard is designed for periodic e-ink updates rather than ball-by-ball real-time tracking.

- Scores may be delayed depending on the provider.
- TRMNL displays refresh periodically.
- The current API endpoint may return only a subset of available matches.
- Some matches may not have complete score information.
- Test matches can contain multiple innings per team; the current version displays the latest available innings for each team.
- The screen-update time represents rendering, not necessarily the provider's last score update.
- Individual batter and bowler statistics are not included in this version.

## 🔮 Future Improvements

- [ ] Favorite team selection
- [ ] IPL-only and international match filters
- [ ] Better Test cricket innings support
- [ ] Individual batter and bowler statistics
- [ ] Match start times in local time zones
- [ ] Improved team logos
- [ ] Better handling of long match names
- [ ] Interactive web demo
- [ ] More scoreboard themes and customization options

---

## 🙏 Credits

- [TRMNL](https://trmnl.com/) — E-ink display platform.
- [TRMNL Preview](https://github.com/usetrmnl/trmnlp) — Official local development tool.
- [CricketData.org](https://cricketdata.org/) — Cricket match information.
- [Hack Club](https://hackclub.com/) — For encouraging students to build and ship projects.

## 👩‍💻 Author

**Simran — [@itscryptune](https://github.com/itscryptune)**

Made for Hack Club TRMNT.

This project started as a simple idea to display cricket scores, and I kept improving it while learning new things.

I'm still learning programming, and BoundaryBoard is one of the projects helping me understand how real applications work.

**Thanks for checking out BoundaryBoard! 🏏**
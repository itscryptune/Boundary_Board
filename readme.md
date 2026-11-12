# BoundaryBoard 

A cricket scoreboard for TRMNL e-ink displays.

I made BoundaryBoard for Hack Club's TRMNT event. I wanted a way to check the cricket score without opening a website every time, and a small e-ink scoreboard sounded like a fun way to do it.

It gets match data from CricketData and shows the score in a black-and-white layout that works on TRMNL.

## What it shows

- The teams playing, their scores, wickets and overs
- Match format and venue (when the API provides them)
- Whether a match is live, upcoming, finished, delayed or on a break
- Multiple matches, with ongoing ones shown first

There are four layouts: full screen, half horizontal, half vertical and quadrant. The smaller layouts show less information because there's not much room on the display.

## Running it locally

I built and tested this on Windows 11 using Docker and [TRMNL Preview](https://github.com/usetrmnl/trmnlp).

You'll need Docker Desktop, Git and a CricketData API key.

**1. Clone the project**

```powershell
git clone https://github.com/itscryptune/Boundary_Board.git
cd Boundary_Board
```

**2. Download the TRMNL Preview image**

```powershell
docker pull trmnl/trmnlp
```

**3. Add your API key for this PowerShell session**

```powershell
$env:CRICKET_API_KEY = Read-Host "Enter your CricketData API key"
```

The `.trmnlp.yml` file uses that environment variable for the `cricket_api_key` custom field. Don't commit your key to the repository.

**4. Start the preview**

```powershell
docker run --rm -it -p 4567:4567 -e CRICKET_API_KEY -v "${PWD}:/plugin" trmnl/trmnlp serve --bind 0.0.0.0
```

Open **http://localhost:4567** and click **Poll** to fetch match data. You can switch between layouts in the preview. Press `Ctrl+C` in PowerShell when you're finished.

## Things I ran into while building it

The scoreboard started as a basic two-team layout. Getting that on screen wasn't too hard; figuring out what to show when the API returned different kinds of matches took more work.

For example, a match can have started without having a score yet, or it can be stopped for lunch, tea or stumps. I added separate labels for those cases rather than calling everything "LIVE". Matching innings scores to the correct team was another thing I had to work through.

The small layouts were also trickier than the full-screen one. I spent time adjusting font sizes and spacing so the actual score wouldn't get lost.

At one point the preview showed `Scores unavailable — Score feed unavailable`. That was a reminder to check the API response and local key setup, not just the display code.

## What's missing

- Test matches with several innings could be handled better.
- There aren't any individual batter or bowler stats yet.
- Some matches are missing scores or other details in the API response.
- I'd like to add team filters and better handling of long team names.

## Credits

Made by [@itscryptune](https://github.com/itscryptune) for [Hack Club TRMNT](https://trmnt.hackclub.com/).

I used [TRMNL](https://trmnl.com/) for the display and [CricketData](https://cricketdata.org/) for the cricket scores. Thanks to both!
# Flowchart of Code

```text
                         ┌───────────┐
                         │   START   │
                         └─────┬─────┘
                               ↓
                    ┌────────────────────┐
                    │ Run app.py / Flask │
                    └─────────┬──────────┘
                              ↓
                    ┌────────────────────┐
                    │ Browser opens      │
                    │ localhost:5000     │
                    └─────────┬──────────┘
                              ↓
                ┌────────────────────────────┐
                │      Flask Routes          │
                └──────┬──────┬──────┬──────┘
                       │      │      │
             ┌─────────┘      │      └────────────┐
             ↓                ↓                   ↓
       ┌───────────┐    ┌───────────┐      ┌─────────────┐
       │ Home Page │    │ Radar API │      │ Flight API  │
       │     /     │    │ /api/radar│      │ /api/flights│
       └─────┬─────┘    └─────┬─────┘      └──────┬──────┘
             ↓                ↓                    ↓
       index.html       Radar Positions      MySQL History
                              │                    │
                              └────────┬───────────┘
                                       │
                                       ↓
                              ┌────────────────┐
                              │ /api/process   │
                              │     POST       │
                              └───────┬────────┘
                                      ↓
                            ┌──────────────────┐
                            │ Receive JSON     │
                            │ Aircraft Data    │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Required Fields? │
                            └───────┬─────┬────┘
                                    │     │
                                  YES     NO
                                    │     ↓
                                    │  Error 400
                                    ↓
                            ┌──────────────────┐
                            │ Validate Numbers │
                            └───────┬─────┬────┘
                                    │     │
                                  YES     NO
                                    │     ↓
                                    │  Error 400
                                    ↓
                            ┌──────────────────┐
                            │ ATC Processing   │
                            └────────┬─────────┘
                                     ↓
                    ┌─────────────────────────────────┐
                    │ Weather Analysis                 │
                    │ Collision Detection              │
                    │ Volcanic Ash Detection           │
                    │ Emergency Detection              │
                    │ Runway Assignment                │
                    └────────────────┬────────────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Save to MySQL    │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Return JSON      │
                            │ Complete Report  │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Display on Web UI│
                            └──────────────────┘
```

## Data Flow

```text
User Browser
     ↓
Flask (app.py)
     ↓
ATC Logic (atc_logic.py)
     ↓
Database (db.py → MySQL)
     ↓
JSON Response
     ↓
Web Interface
```

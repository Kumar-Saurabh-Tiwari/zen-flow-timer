# Zen Flow Timer

### **Task Overview**

Build a calm, warm, and highly polished sequential Practice Timer application in React. The application allows users to create, order, edit, and play a series of timed blocks (e.g., for study sessions, workouts, or meditation) sequentially from top to bottom with continuous state persistence.

---

### **Core Features & Requirements**

1. **Profile & Customization Card**

   - Display a profile header with an automatically computed initial avatar from the user's name.

   - Show an editable practice heading (e.g., *"Practice Time"*).

   - Allow users to edit their profile name and heading inline or via a modal/settings panel.

2. **Timer Block Management**

   - Add new timer blocks with custom titles, minutes, and seconds.

   - Inline edit timer titles and durations.

   - Delete individual timer blocks.

   - Reorder timer blocks using **Move Up (▲)** and **Move Down (▼)** controls, keeping state indices aligned.

3. **Sequential Execution & Progress Visualization**

   - Play timers **sequentially from top to bottom** upon pressing "Start".

   - Highlight active timer blocks during execution.

   - Visually mark completed/expired timers.

   - Show live countdowns with both a linear progress bar and a visual progress indicator.

   - Trigger a friendly completion alert (e.g., via `sweetalert2`) when the full sequence finishes.

4. **Persistence & UX**

   - Persist user profile data, active titles, and the list of timer blocks in `localStorage`.

   - Maintain a calm, warm, and intentional aesthetic (soft colors, clean typography, responsive layout).

---

### **Component Specs & Technical Context**

#### **1. `App.js` State & Handlers**

- **Storage Keys**: `timerApp_userName`, `timerApp_practiceTitle`, `timerApp_timers`.

- **State Properties**: `userName`, `practiceTitle`, `timers`, `activeTimerIndex`, `timersStarted`, and form control states (`newTimerTitle`, `newTimerMinutes`, `newTimerSeconds`).

- **Handlers**: `saveProfile`, `addTimer`, `startTimers`, `resetTimers`, `handleTimerComplete`, `deleteTimer`, `editTimer`, `saveTimer`, and `moveTimer`.

#### **2. `Timer.jsx` Component Interface**

- **Props**: `title` (string), `duration` (number in seconds), `isActive` (boolean), `onComplete` (callback function).

- **Features**: Live 1-second countdown interval handling when `isActive` is `true`, smooth progress calculation `((duration - remainingTime) / duration) * 100`, and zero-padded visual formatting (`M:SS`).

---

### **Reference Implementation (Code Baseline)**

#### **`App.js`**

```jsx

import React, { useEffect, useMemo, useState, useCallback } from 'react';

import Swal from 'sweetalert2';

import Timer from './Timer';

import './App.css';

const STORAGE_KEYS = {

  name: 'timerApp_userName',

  title: 'timerApp_practiceTitle',

  timers: 'timerApp_timers',

};

const loadFromStorage = (key, fallback) => {

  if (typeof window === 'undefined') return fallback;

  const stored = window.localStorage.getItem(key);

  return stored ? JSON.parse(stored) : fallback;

};

function App() {

  const [userName, setUserName] = useState('there');

  const [profileDraft, setProfileDraft] = useState('');

  const [practiceTitle, setPracticeTitle] = useState('Practice Time');

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [timers, setTimers] = useState([]);

  const [newTimerTitle, setNewTimerTitle] = useState('');

  const [newTimerMinutes, setNewTimerMinutes] = useState(0);

  const [newTimerSeconds, setNewTimerSeconds] = useState(0);

  const [activeTimerIndex, setActiveTimerIndex] = useState(-1);

  const [timersStarted, setTimersStarted] = useState(false);

  useEffect(() => {

    setUserName(loadFromStorage(STORAGE_KEYS.name, 'there'));

    setPracticeTitle(loadFromStorage(STORAGE_KEYS.title, 'Practice Time'));

    setTimers(loadFromStorage(STORAGE_KEYS.timers, []));

  }, []);

  useEffect(() => {

    if (typeof window !== 'undefined') {

      window.localStorage.setItem(STORAGE_KEYS.name, JSON.stringify(userName));

      window.localStorage.setItem(STORAGE_KEYS.title, JSON.stringify(practiceTitle));

      window.localStorage.setItem(STORAGE_KEYS.timers, JSON.stringify(timers));

    }

  }, [userName, practiceTitle, timers]);

  const saveProfile = () => {

    setUserName(profileDraft.trim() || 'there');

    setIsEditingProfile(false);

  };

  const addTimer = () => {

    const duration = newTimerMinutes * 60 + newTimerSeconds;

    if (duration <= 0 || !newTimerTitle.trim()) return;

    setTimers((prev) => [

      ...prev,

      {

        title: newTimerTitle.trim(),

        duration,

        isActive: false,

        isExpired: false,

        editing: false,

        tempMinutes: newTimerMinutes,

        tempSeconds: newTimerSeconds,

      },

    ]);

    setNewTimerTitle('');

    setNewTimerMinutes(0);

    setNewTimerSeconds(0);

  };

  const startTimers = () => {

    if (!timers.length || activeTimerIndex !== -1) return;

    setActiveTimerIndex(0);

    setTimers((prev) =>

      prev.map((timer, index) => ({

        ...timer,

        isActive: index === 0,

        isExpired: false,

      }))

    );

    setTimersStarted(true);

  };

  const resetTimers = () => {

    setTimers([]);

    setActiveTimerIndex(-1);

    setTimersStarted(false);

  };

  const handleTimerComplete = useCallback(

    (index) => {

      setTimers((prev) =>

        prev.map((timer, idx) => ({

          ...timer,

          isActive: false,

          isExpired: idx === index ? true : timer.isExpired,

        }))

      );

      if (index < timers.length - 1) {

        setActiveTimerIndex(index + 1);

        setTimers((prev) =>

          prev.map((timer, idx) => ({

            ...timer,

            isActive: idx === index + 1,

          }))

        );

      } else {

        setActiveTimerIndex(-1);

        setTimersStarted(false);

        Swal.fire({

          title: 'Session complete!',

          text: 'Great work — your practice session is finished.',

          icon: 'success',

          confirmButtonText: 'Nice',

        });

      }

    },

    [timers.length]

  );

  const deleteTimer = (index) => {

    setTimers((prev) => prev.filter((_, idx) => idx !== index));

    if (activeTimerIndex === index || activeTimerIndex > index) {

      setActiveTimerIndex((current) => (current > 0 ? current - 1 : -1));

      setTimersStarted(false);

    }

  };

  const editTimer = (index) => {

    setTimers((prev) =>

      prev.map((timer, idx) =>

        idx === index

          ? {

              ...timer,

              editing: true,

              tempMinutes: Math.floor(timer.duration / 60),

              tempSeconds: timer.duration % 60,

            }

          : timer

      )

    );

  };

  const saveTimer = (index) => {

    setTimers((prev) =>

      prev.map((timer, idx) => {

        if (idx !== index) return timer;

        const newDuration = timer.tempMinutes * 60 + timer.tempSeconds;

        if (!timer.title.trim() || newDuration <= 0) return timer;

        return {

          ...timer,

          duration: newDuration,

          editing: false,

        };

      })

    );

  };

  const moveTimer = (index, direction) => {

    setTimers((prev) => {

      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const copy = [...prev];

      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];

      return copy;

    });

    if (activeTimerIndex === index) {

      setActiveTimerIndex(index + direction);

    } else if (activeTimerIndex === index + direction) {

      setActiveTimerIndex(index);

    }

  };

  const profileAvatar = useMemo(

    () => (userName ? userName.charAt(0).toUpperCase() : 'U'),

    [userName]

  );

  return (

    <div className="app-shell">

      <section className="hero-card">

        <div className="hero-copy">

          <p className="eyebrow">Focused practice, beautifully paced</p>

          <h1>{practiceTitle}</h1>

          <p className="subtitle">

            Create calm, intentional study or workout sessions and keep your flow going with a polished timer experience.

          </p>

        </div>

        <div className="profile-card">

          <div className="avatar">{profileAvatar}</div>

          <div className="profile-meta">

            <h2>Welcome back, {userName || 'friend'}!</h2>

            <p>Personalize your practice title and update your profile whenever you want.</p>

            <div className="profile-actions">

              <button className="secondary-btn" onClick={() => {

                setProfileDraft(userName);

                setIsEditingProfile(true);

              }}>

                Edit profile

              </button>

              <button className="ghost-btn" onClick={() => setIsEditingProfile(false)}>

                Close

              </button>

            </div>

          </div>

        </div>

      </section>

      {isEditingProfile && (

        <section className="panel-card">

          <h3>Profile settings</h3>

          <div className="form-grid">

            <label>

              <span>Name</span>

              <input value={profileDraft} onChange={(e) => setProfileDraft(e.target.value)} placeholder="Enter your name" />

            </label>

            <label>

              <span>Heading</span>

              <input value={practiceTitle} onChange={(e) => setPracticeTitle(e.target.value)} placeholder="Practice title" />

            </label>

          </div>

          <div className="panel-actions">

            <button className="primary-btn" onClick={saveProfile}>

              Save profile

            </button>

            <button className="secondary-btn" onClick={() => setIsEditingProfile(false)}>

              Cancel

            </button>

          </div>

        </section>

      )}

      <section className="panel-card">

        <div className="panel-heading">

          <div>

            <p className="eyebrow">Plan your session</p>

            <h3>Create a new practice block</h3>

          </div>

          <div className="panel-actions">

            <button className="primary-btn" onClick={addTimer}>

              Add timer

            </button>

            <button className="secondary-btn" onClick={startTimers} disabled={timersStarted || timers.length === 0}>

              Start

            </button>

            <button className="danger-btn" onClick={resetTimers}>

              Reset

            </button>

          </div>

        </div>

        <div className="form-grid">

          <label>

            <span>Title</span>

            <input value={newTimerTitle} onChange={(e) => setNewTimerTitle(e.target.value)} placeholder="Timer title" />

          </label>

          <label>

            <span>Minutes</span>

            <input

              value={newTimerMinutes}

              onChange={(e) => setNewTimerMinutes(Number(e.target.value))}

              type="number"

              min="0"

              placeholder="Minutes"

            />

          </label>

          <label>

            <span>Seconds</span>

            <input

              value={newTimerSeconds}

              onChange={(e) => setNewTimerSeconds(Number(e.target.value))}

              type="number"

              min="0"

              max="59"

              placeholder="Seconds"

            />

          </label>

        </div>

      </section>

      <section className="timers-section">

        {timers.map((timer, index) => (

          <div

            key={index}

            className={`timer-card ${activeTimerIndex === index ? 'active-timer' : ''} ${timer.isExpired ? 'expired-timer' : ''}`}

          >

            {timer.editing ? (

              <div className="edit-panel">

                <input

                  value={timer.title}

                  onChange={(e) =>

                    setTimers((prev) =>

                      prev.map((item, idx) => (idx === index ? { ...item, title: e.target.value } : item))

                    )

                  }

                  placeholder="Timer Title"

                />

                <input

                  value={timer.tempMinutes}

                  onChange={(e) =>

                    setTimers((prev) =>

                      prev.map((item, idx) => (idx === index ? { ...item, tempMinutes: Number(e.target.value) } : item))

                    )

                  }

                  type="number"

                  min="0"

                  placeholder="Minutes"

                />

                <input

                  value={timer.tempSeconds}

                  onChange={(e) =>

                    setTimers((prev) =>

                      prev.map((item, idx) => (idx === index ? { ...item, tempSeconds: Number(e.target.value) } : item))

                    )

                  }

                  type="number"

                  min="0"

                  max="59"

                  placeholder="Seconds"

                />

                <button className="primary-btn" onClick={() => saveTimer(index)}>

                  Save

                </button>

              </div>

            ) : (

              <div className="timer-content">

                <Timer duration="{timer.duration}" isActive="{timer.isActive}" onComplete="{()" title="{timer.title}"> handleTimerComplete(index)}

                />

                <div className="timer-actions">

                  <button className="secondary-btn" onClick={() => editTimer(index)}>

                    Edit

                  </button>

                  <button className="danger-btn" onClick={() => deleteTimer(index)}>

                    Delete

                  </button>

                  <button className="ghost-btn" onClick={() => moveTimer(index, -1)}>

                    ▲

                  </button>

                  <button className="ghost-btn" onClick={() => moveTimer(index, 1)}>

                    ▼

                  </button>

                </div>

              </div>

            )}

          </div>

        ))}

      </section>

    </div>

  );

}

export default App;

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/03f90913-66c7-4fba-9968-5d3bd87365a8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

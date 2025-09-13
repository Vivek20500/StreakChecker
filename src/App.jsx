import React, { useState, useEffect } from "react";
import { Calendar, Zap } from "lucide-react";


function App() {
  const [buttons, setButtons] = useState(() => {
  // Try to load from localStorage, else create new
  const saved = localStorage.getItem("streakChecker");
  if (saved) return JSON.parse(saved);
  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    state: "white",
  }));
});

  const [currentStreak, setCurrentStreak] = useState(0);
  const [nextButtonId, setNextButtonId] = useState(1);

  // Save to localStorage whenever buttons change
  useEffect(() => {
    localStorage.setItem("streakChecker", JSON.stringify(buttons));
  }, [buttons]);

  // Calculate streak + next button
  useEffect(() => {
    let streak = 0;
    let nextId = 1;

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].state === "green") {
        streak++;
        nextId = buttons[i].id + 1;
      } else if (buttons[i].state === "red") {
        nextId = buttons[i].id + 1;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
    setNextButtonId(nextId > 100 ? 100 : nextId);
  }, [buttons]);

  // Check for missed 24h deadlines
  useEffect(() => {
    const checkTimeouts = () => {
      const now = Date.now();
      const DAY = 24 * 60 * 60 * 1000;

      setButtons((prev) =>
        prev.map((button) => {
          if (button.state !== "white") return button;

          const isNext = button.id === nextButtonId;
          if (!isNext) return button;

          const prevButton = prev.find((b) => b.id === button.id - 1);
          if (!prevButton?.clickedAt || prevButton.state !== "green") return button;

          if (now - prevButton.clickedAt > DAY) {
            return { ...button, state: "red", missedAt: now };
          }
          return button;
        })
      );
    };

    checkTimeouts();
    const interval = setInterval(checkTimeouts, 60_000);
    return () => clearInterval(interval);
  }, [nextButtonId]);

  const handleClick = (id) => {
    if (id !== nextButtonId) return;

    setButtons((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, state: "green", clickedAt: Date.now() }
          : b
      )
    );
  };

  const resetProgress = () => {
    setButtons(
      Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        state: "white",
      }))
    );
    localStorage.removeItem("streakChecker");
  };

  const buttonClass = (button) => {
    const base =
      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-black rounded-lg font-bold text-xs sm:text-sm md:text-base transition-all duration-200";
    if (button.state === "green") return `${base} bg-green-500 text-white shadow-lg`;
    if (button.state === "red") return `${base} bg-red-500 text-white shadow-lg`;

    const isNext = button.id === nextButtonId;
    return `${base} bg-white text-black shadow-md ${isNext
        ? "hover:bg-blue-100 hover:scale-105 cursor-pointer ring-2 ring-blue-400"
        : "cursor-not-allowed opacity-50"
      }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 flex justify-center items-center">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="text-yellow-300 w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">StreakChecker</h1>
          </div>

          <div className="bg-white/10 rounded-2xl p-6">
            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2">
              Streak {currentStreak}
            </div>
            <div className="text-blue-100 text-base">
              {nextButtonId <= 100 ? `Next: Button ${nextButtonId}` : "Completed!"}
            </div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="bg-white/95 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-10 gap-2">
            {buttons.map((b) => (
              <button
                key={b.id}
                className={buttonClass(b)}
                onClick={() => handleClick(b.id)}
                disabled={b.id !== nextButtonId || b.state !== "white"}
              >
                {b.id}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">24h timeout per button</span>
            </div>
            <button
              onClick={resetProgress}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Reset Progress
            </button>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-black rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border-2 border-black rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border-2 border-black rounded"></div>
              <span>Missed</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-blue-100 text-sm">
          Click buttons in sequence (1 → 2 → 3). You have 24 hours per button, miss it and it turns red.
        </p>
      </div>
    </div>
  );
}

export default App;

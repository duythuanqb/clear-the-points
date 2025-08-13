import React, { useState, useEffect, useRef } from "react";
import "./Game.css";

export default function Game() {
  const [points, setPoints] = useState(5);
  const [time, setTime] = useState(0);
  const [circles, setCircles] = useState([]);
  const [nextPoint, setNextPoint] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [gameStatus, setGameStatus] = useState("ready");  

  const timerRef = useRef(null);
  const circlesRef = useRef([]);
  const nextPointRef = useRef(nextPoint);

  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);
  useEffect(() => {
    nextPointRef.current = nextPoint;
  }, [nextPoint]);

  const startGame = () => {
    setTime(0);
    setNextPoint(1);
    nextPointRef.current = 1;
    setGameStatus("playing");
    setAutoPlay(false);
    const newCircles = Array.from({ length: points }, (_, i) => ({
      id: i + 1,
      x: Math.random() * 450,
      y: Math.random() * 350,
      countdown: 0,
      clicked: false,
      frozen: false, 
    }));
    setCircles(newCircles);
  };

  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTime((t) => parseFloat((t + 0.1).toFixed(1)));
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  useEffect(() => {
    let stop = false;
    const playNext = () => {
      if (stop || gameStatus !== "playing" || !autoPlay) return;

      const targetId = nextPointRef.current;
      const targetCircle = circlesRef.current.find(
        (c) => c.id === targetId && !c.clicked
      );

      if (targetCircle) {
        handleClickCircle(targetCircle.id);
        setTimeout(playNext, 2000); 
      } else {
        setTimeout(playNext, 50);
      }
    };

    if (autoPlay) playNext();
    return () => {
      stop = true;
    };
  }, [autoPlay, gameStatus]);

  const handleClickCircle = (id) => {
    if (gameStatus !== "playing") return;

    const target = circlesRef.current.find((c) => c.id === id);
    if (!target || target.clicked) return;

    if (id !== nextPointRef.current) {
      // Click sai → dừng tất cả countdown
      setCircles((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            // Circle bị click sai
            return { ...c, countdown: 3, clicked: true, frozen: true };
          }
          if (c.clicked) {
            // Các circle đã click đúng trước đó
            return { ...c, frozen: true };
          }
          return c;
        })
      );
      setGameStatus("gameover");
      return;
    }

    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, countdown: 3, clicked: true } : c))
    );

    if (nextPointRef.current < points) {
      const nextVal = nextPointRef.current + 1;
      nextPointRef.current = nextVal;
      setNextPoint(nextVal);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCircles((prev) => {
        const updated = prev
          .map((c) =>
            c.countdown > 0 && !c.frozen
              ? { ...c, countdown: parseFloat((c.countdown - 0.1).toFixed(1)) }
              : c
          )
          .filter((c) => !(c.clicked && c.countdown <= 0 && !c.frozen));

        if (gameStatus === "playing" && updated.length === 0 && prev.length > 0) {
          setGameStatus("win");
        }
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus]);

  const renderTitle = () => {
    if (gameStatus === "win")
      return <h3 className="game__header game__header--win">ALL CLEARED</h3>;
    if (gameStatus === "gameover")
      return <h3 className="game__header game__header--lose">GAME OVER</h3>;
    return <h3 className="game__header">LET'S PLAY</h3>;
  };

  return (
    <div className="container">
      <div className="game">
        {renderTitle()}

        <div>
          <span className="game__label">Points: </span>
          <input
            className="game__input"
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            disabled={gameStatus === "playing"}
          />
        </div>

        <div>Time: {time.toFixed(1)}s</div>

        <div className="game__controls">
          {gameStatus === "ready" ? (
            <button className="btn" onClick={startGame}>
                Play
            </button>
            ) : (
            <>
                <button className="btn btn--secondary" onClick={startGame}>
                Restart
                </button>
                {gameStatus === "playing" && (
                <button
                    className={`btn ${autoPlay ? "btn--success" : "btn--ghost"}`}
                    onClick={() => setAutoPlay((a) => !a)}
                >
                    Auto Play {autoPlay ? "OFF" : "ON"}
                </button>
                )}
            </>
            )}
        </div>

        <div className="board">
          {circles.map((c) => (
            <div
              key={c.id}
              onClick={() => handleClickCircle(c.id)}
              className={`circle ${c.countdown > 0 ? "circle--clicked" : ""}`}
              style={{
                left: c.x,
                top: c.y,
                opacity: c.countdown > 0 ? Math.max(c.countdown / 3, 0) : 1,
                zIndex: c.clicked ? 100 : 1,
              }}
            >
              <div>{c.id}</div>
              {c.countdown > 0 && <div>{c.countdown.toFixed(1)}s</div>}
            </div>
          ))}
        </div>

        <div className="game__footer">
          Next: {gameStatus === "playing" ? nextPoint : "-"}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useCallback } from "react";

const GAME_WIDTH = 480;
const GAME_HEIGHT = 700;
const MAX_ASTEROIDS = 5;
const SHIP_SPEED = 5;
const BULLET_SPEED = 8;
const ASTEROID_SPEED_MIN = 2;
const ASTEROID_SPEED_MAX = 5;
const ASTEROID_SPAWN_INTERVAL = 1500;

interface Ship {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  id: number;
}

interface Asteroid {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  id: number;
}

interface GameState {
  ship: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  points: number;
  lives: number;
  playing: boolean;
  gameOver: boolean;
  bgY: number;
  lastAsteroidTime: number;
  bulletIdCounter: number;
  asteroidIdCounter: number;
  keys: { left: boolean; right: boolean; fire: boolean };
  fireCooldown: number;
  stars: Array<{ x: number; y: number; size: number; speed: number; brightness: number }>;
  explosions: Array<{ x: number; y: number; radius: number; alpha: number; id: number }>;
  explosionIdCounter: number;
  invincible: number;
}

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, invincible: number) {
  const { x, y, width, height } = ship;

  if (invincible > 0 && Math.floor(invincible / 5) % 2 === 0) return;

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);

  const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  gradient.addColorStop(0, "#00ffff");
  gradient.addColorStop(0.5, "#0088ff");
  gradient.addColorStop(1, "#0044aa");

  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(-width / 2, height / 2);
  ctx.lineTo(-width / 4, height / 4);
  ctx.lineTo(0, height / 3);
  ctx.lineTo(width / 4, height / 4);
  ctx.lineTo(width / 2, height / 2);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(-width / 4, height / 4);
  ctx.lineTo(-width / 3, height / 2 + 8);
  ctx.lineTo(0, height / 2);
  const thrusterGradient = ctx.createLinearGradient(0, height / 4, 0, height / 2 + 8);
  thrusterGradient.addColorStop(0, "rgba(255, 150, 0, 0.9)");
  thrusterGradient.addColorStop(1, "rgba(255, 50, 0, 0)");
  ctx.fillStyle = thrusterGradient;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width / 4, height / 4);
  ctx.lineTo(width / 3, height / 2 + 8);
  ctx.lineTo(0, height / 2);
  ctx.fillStyle = thrusterGradient;
  ctx.fill();

  ctx.restore();
}

function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
  const { x, y, width, height, rotation, size } = asteroid;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, "#888888");
  gradient.addColorStop(0.5, "#555555");
  gradient.addColorStop(1, "#333333");

  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = size * (0.7 + Math.sin(i * 2.5) * 0.3);
    if (i === 0) {
      ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    } else {
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowColor = "rgba(100, 80, 50, 0.5)";
  ctx.shadowBlur = 5;
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.save();
  ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);

  const gradient = ctx.createLinearGradient(0, -bullet.height / 2, 0, bullet.height / 2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, "#ffff00");
  gradient.addColorStop(1, "rgba(255, 100, 0, 0)");

  ctx.shadowColor = "#ffff00";
  ctx.shadowBlur = 8;

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: { x: number; y: number; radius: number; alpha: number }) {
  ctx.save();
  const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
  gradient.addColorStop(0, `rgba(255, 255, 200, ${exp.alpha})`);
  gradient.addColorStop(0.3, `rgba(255, 150, 0, ${exp.alpha * 0.8})`);
  gradient.addColorStop(0.7, `rgba(255, 50, 0, ${exp.alpha * 0.4})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
}

function generateStars(): GameState["stars"] {
  const stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.7 + 0.3,
    });
  }
  return stars;
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  margin = 8
) {
  return (
    ax + margin < bx + bw - margin &&
    ax + aw - margin > bx + margin &&
    ay + margin < by + bh - margin &&
    ay + ah - margin > by + margin
  );
}

export default function MeteoritosGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);

  const initGame = useCallback((): GameState => {
    return {
      ship: {
        x: GAME_WIDTH / 2 - 20,
        y: GAME_HEIGHT - 110,
        width: 40,
        height: 60,
        speed: SHIP_SPEED,
      },
      bullets: [],
      asteroids: [],
      points: 0,
      lives: 3,
      playing: true,
      gameOver: false,
      bgY: 0,
      lastAsteroidTime: Date.now(),
      bulletIdCounter: 0,
      asteroidIdCounter: 0,
      keys: { left: false, right: false, fire: false },
      fireCooldown: 0,
      stars: generateStars(),
      explosions: [],
      explosionIdCounter: 0,
      invincible: 0,
    };
  }, []);

  const spawnAsteroid = useCallback((state: GameState) => {
    if (state.asteroids.length >= MAX_ASTEROIDS) return;
    const size = Math.random() * 20 + 20;
    const speed = Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN) + ASTEROID_SPEED_MIN;
    state.asteroids.push({
      x: Math.random() * (GAME_WIDTH - size * 2) + size,
      y: -size * 2,
      width: size * 2,
      height: size * 2,
      speed,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      size,
      id: state.asteroidIdCounter++,
    });
  }, []);

  const fireBullet = useCallback((state: GameState) => {
    if (state.fireCooldown > 0 || !state.playing) return;
    const cx = state.ship.x + state.ship.width / 2;
    const cy = state.ship.y;
    state.bullets.push({
      x: cx - 3,
      y: cy,
      width: 6,
      height: 16,
      speed: BULLET_SPEED,
      id: state.bulletIdCounter++,
    });
    state.fireCooldown = 10;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state = gameStateRef.current;
    if (!state) return;

    const { keys } = state;

    if (state.playing) {
      if (keys.left) {
        state.ship.x = Math.max(0, state.ship.x - state.ship.speed);
      }
      if (keys.right) {
        state.ship.x = Math.min(GAME_WIDTH - state.ship.width, state.ship.x + state.ship.speed);
      }
      if (keys.fire) {
        fireBullet(state);
      }
    }

    if (state.fireCooldown > 0) state.fireCooldown--;
    if (state.invincible > 0) state.invincible--;

    state.bgY = (state.bgY + 1.5) % GAME_HEIGHT;

    const now = Date.now();
    if (state.playing && now - state.lastAsteroidTime > ASTEROID_SPAWN_INTERVAL) {
      spawnAsteroid(state);
      state.lastAsteroidTime = now;
    }

    state.bullets = state.bullets.filter(b => {
      b.y -= b.speed;
      return b.y > -b.height;
    });

    state.asteroids = state.asteroids.filter(a => {
      a.y += a.speed;
      a.rotation += a.rotationSpeed;
      return a.y < GAME_HEIGHT + a.height;
    });

    state.explosions = state.explosions.filter(e => {
      e.radius += 2;
      e.alpha -= 0.06;
      return e.alpha > 0;
    });

    const bulletsToRemove = new Set<number>();
    const asteroidsToRemove = new Set<number>();

    for (const bullet of state.bullets) {
      for (const asteroid of state.asteroids) {
        if (bulletsToRemove.has(bullet.id) || asteroidsToRemove.has(asteroid.id)) continue;
        if (rectsOverlap(bullet.x, bullet.y, bullet.width, bullet.height, asteroid.x, asteroid.y, asteroid.width, asteroid.height, 4)) {
          bulletsToRemove.add(bullet.id);
          asteroidsToRemove.add(asteroid.id);
          state.points++;
          state.explosions.push({
            x: asteroid.x + asteroid.width / 2,
            y: asteroid.y + asteroid.height / 2,
            radius: asteroid.size * 0.5,
            alpha: 1,
            id: state.explosionIdCounter++,
          });
        }
      }
    }

    if (state.playing && state.invincible === 0) {
      for (const asteroid of state.asteroids) {
        if (asteroidsToRemove.has(asteroid.id)) continue;
        if (rectsOverlap(
          state.ship.x, state.ship.y, state.ship.width, state.ship.height,
          asteroid.x, asteroid.y, asteroid.width, asteroid.height,
          10
        )) {
          asteroidsToRemove.add(asteroid.id);
          state.explosions.push({
            x: state.ship.x + state.ship.width / 2,
            y: state.ship.y + state.ship.height / 2,
            radius: 10,
            alpha: 1,
            id: state.explosionIdCounter++,
          });
          state.lives--;
          state.invincible = 90;
          if (state.lives <= 0) {
            state.playing = false;
            state.gameOver = true;
          }
          break;
        }
      }
    }

    state.bullets = state.bullets.filter(b => !bulletsToRemove.has(b.id));
    state.asteroids = state.asteroids.filter(a => !asteroidsToRemove.has(a.id));

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (const star of state.stars) {
      star.y = (star.y + star.speed) % GAME_HEIGHT;
      const alpha = star.brightness * (0.7 + 0.3 * Math.sin(Date.now() / 800 + star.x));
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const exp of state.explosions) {
      drawExplosion(ctx, exp);
    }

    for (const bullet of state.bullets) {
      drawBullet(ctx, bullet);
    }

    for (const asteroid of state.asteroids) {
      drawAsteroid(ctx, asteroid);
    }

    if (!state.gameOver || state.invincible > 0) {
      drawShip(ctx, state.ship, state.invincible);
    }

    ctx.save();
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#78c828";
    ctx.shadowColor = "#78c828";
    ctx.shadowBlur = 8;
    ctx.fillText(`Points: ${state.points}`, 10, 30);

    const heartFull = "❤️";
    const heartEmpty = "🖤";
    let livesStr = "";
    for (let i = 0; i < 3; i++) {
      livesStr += i < state.lives ? heartFull : heartEmpty;
    }
    ctx.font = "18px Arial";
    ctx.shadowBlur = 0;
    ctx.fillText(livesStr, GAME_WIDTH - 90, 28);
    ctx.restore();

    if (state.gameOver) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.font = "bold 52px Arial";
      ctx.fillStyle = "#78c828";
      ctx.shadowColor = "#78c828";
      ctx.shadowBlur = 20;
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

      ctx.font = "28px Arial";
      ctx.shadowBlur = 10;
      ctx.fillText(`Points: ${state.points}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);

      ctx.font = "20px Arial";
      ctx.shadowBlur = 5;
      ctx.fillStyle = "#aaffaa";
      ctx.fillText("Tap / Press SPACE to play again", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [fireBullet, spawnAsteroid]);

  useEffect(() => {
    gameStateRef.current = initGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (!state) return;
      if (state.gameOver) {
        if (e.key === " " || e.key === "Enter") {
          gameStateRef.current = initGame();
        }
        return;
      }
      if (e.key === "ArrowLeft") state.keys.left = true;
      if (e.key === "ArrowRight") state.keys.right = true;
      if (e.key === " ") { e.preventDefault(); state.keys.fire = true; }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (!state) return;
      if (e.key === "ArrowLeft") state.keys.left = false;
      if (e.key === "ArrowRight") state.keys.right = false;
      if (e.key === " ") state.keys.fire = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initGame, gameLoop]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const scaleX = containerW / GAME_WIDTH;
      const scaleY = containerH / GAME_HEIGHT;
      scaleRef.current = Math.min(scaleX, scaleY, 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleCanvasTap = () => {
    const state = gameStateRef.current;
    if (state?.gameOver) {
      gameStateRef.current = initGame();
    }
  };

  const setKey = (key: "left" | "right" | "fire", value: boolean) => {
    const state = gameStateRef.current;
    if (!state) return;
    if (state.gameOver && value) {
      gameStateRef.current = initGame();
      return;
    }
    state.keys[key] = value;
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#000010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        ref={containerRef}
        style={{
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onClick={handleCanvasTap}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
            cursor: "pointer",
            border: "1px solid rgba(0,255,255,0.15)",
            boxShadow: "0 0 40px rgba(0,180,255,0.15)",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "12px 16px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <button
          onPointerDown={() => setKey("left", true)}
          onPointerUp={() => setKey("left", false)}
          onPointerLeave={() => setKey("left", false)}
          onPointerCancel={() => setKey("left", false)}
          style={btnStyle("#00aaff")}
        >
          ◀
        </button>

        <button
          onPointerDown={() => setKey("fire", true)}
          onPointerUp={() => setKey("fire", false)}
          onPointerLeave={() => setKey("fire", false)}
          onPointerCancel={() => setKey("fire", false)}
          style={btnStyle("#ff4400", true)}
        >
          🔥 FIRE
        </button>

        <button
          onPointerDown={() => setKey("right", true)}
          onPointerUp={() => setKey("right", false)}
          onPointerLeave={() => setKey("right", false)}
          onPointerCancel={() => setKey("right", false)}
          style={btnStyle("#00aaff")}
        >
          ▶
        </button>
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginBottom: "6px", textAlign: "center" }}>
        ← → Arrow keys · Space to fire
      </p>
    </div>
  );
}

function btnStyle(color: string, big = false): React.CSSProperties {
  return {
    background: `radial-gradient(circle at 40% 35%, ${color}55, ${color}22)`,
    border: `2px solid ${color}99`,
    borderRadius: big ? "50%" : "12px",
    color: "#ffffff",
    fontSize: big ? "20px" : "28px",
    fontWeight: "bold",
    width: big ? "80px" : "72px",
    height: big ? "80px" : "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    outline: "none",
    boxShadow: `0 0 16px ${color}44`,
    WebkitTapHighlightColor: "transparent",
    flexShrink: 0,
  };
}

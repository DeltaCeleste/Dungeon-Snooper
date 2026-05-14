export class ArbitraryTimer {
  constructor() {
    this.endTime = null;
    this.duration = 0;
    this.isRunning = false;
  }

  // Inicia el temporizador con una duración en milisegundos
  start(durationInMs) {
    this.duration = durationInMs;
    // performance.now() es más preciso que Date.now() para medir tiempo transcurrido
    this.endTime = performance.now() + durationInMs;
    this.isRunning = true;
  }

  // Detiene el temporizador por completo
  stop() {
    this.endTime = null;
    this.isRunning = false;
  }

  // Comprueba si ha terminado (devuelve true o false)
  hasFinished() {
    if (!this.isRunning) return false;
    return performance.now() >= this.endTime;
  }

  // Opcional: Devuelve el tiempo restante en milisegundos
  getTimeLeft() {
    if (!this.isRunning) return 0;
    const left = this.endTime - performance.now();
    return Math.max(0, left); // Evita números negativos si ya terminó
  }
}
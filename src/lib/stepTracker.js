// ─── Anti-cheat thresholds ────────────────────────────────────────────────────
const MIN_CADENCE = 0.5; // steps/sec, only checked for frequent updates (≤6s apart)
const MAX_CADENCE = 4.0; // steps/sec, above this is likely shaking
const COV_THRESHOLD = 0.6; // max coefficient of variation for step intervals
const INTERVAL_WINDOW = 8; // rolling window size for CoV
const MIN_GPS_SPEED = 0.5; // m/s, minimum speed to accept steps
const GPS_STALE_MS = 15_000; // ms, GPS reading older than this is ignored
const MAX_STEPS_PER_DAY = 20_000; // hard daily ceiling
const STEPS_PER_MINUTE = 100; // 100 validated steps earns 1 scroll minute

function calcCoV(arr) {
	if (arr.length < 2) return 0;
	const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
	if (mean === 0) return 0;
	const variance = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
	return Math.sqrt(variance) / mean;
}

function todayKey() {
	return 'walkify_steps_' + new Date().toISOString().slice(0, 10);
}

function loadTodaySteps() {
	return parseInt(localStorage.getItem(todayKey()) || '0', 10);
}

function saveTodaySteps(n) {
	localStorage.setItem(todayKey(), String(n));
}

/**
 * Creates a step tracker. Call start() to begin, stop() to clean up.
 *
 * @param {(update: object) => void} onUpdate  Called with partial state updates.
 *   Possible keys: steps, earned, status, anticheat
 * @returns {{ start: () => Promise<void>, stop: () => Promise<void> }}
 */
export function createStepTracker(onUpdate) {
	let initialSteps = null;
	let lastRawSteps = null;
	let lastEventTime = null;
	let stepIntervals = [];
	let inactivityTimer = null;
	let validatedSteps = 0;
	let totalTodaySteps = loadTodaySteps();
	let lastGpsSpeed = null;
	let lastGpsTime = null;
	let pedometerListener = null;
	let gpsWatcherId = null;
	let Geolocation = null;
	let CapacitorPedometer = null;

	function emit(update) {
		onUpdate(update);
	}

	function resetInactivity() {
		clearTimeout(inactivityTimer);
		inactivityTimer = setTimeout(() => emit({ status: 'Stationary' }), 5000);
	}

	/**
	 * Validates a step batch. Returns null if valid, or a rejection reason string.
	 */
	function validateBatch(stepsDiff, timeDiffSec) {
		const rate = stepsDiff / timeDiffSec;

		// [A] Cadence check — only applied for frequent updates to handle sensor batching
		if (timeDiffSec <= 6.0 && rate < MIN_CADENCE) {
			return `Cadence too low (${rate.toFixed(1)} steps/sec)`;
		}
		if (rate > MAX_CADENCE) {
			return `Cadence too high — possible shaking (${rate.toFixed(1)} steps/sec)`;
		}

		// [B] Step interval variance (CoV)
		const intervalMs = (timeDiffSec * 1000) / stepsDiff;
		stepIntervals.push(intervalMs);
		if (stepIntervals.length > INTERVAL_WINDOW) stepIntervals.shift();
		const cov = calcCoV(stepIntervals);
		if (cov > COV_THRESHOLD) {
			return `Erratic rhythm (CoV ${cov.toFixed(2)})`;
		}

		// [C] GPS velocity gate
		if (lastGpsTime === null) return 'Waiting for GPS fix...';
		if (Date.now() - lastGpsTime > GPS_STALE_MS) return 'GPS signal lost';
		if ((lastGpsSpeed ?? 0) < MIN_GPS_SPEED) return 'Not moving (GPS)';

		// [D] Daily cap
		if (totalTodaySteps >= MAX_STEPS_PER_DAY) return 'Daily step limit reached';

		return null;
	}

	async function start() {
		const geoMod = await import('@capacitor/geolocation');
		const pedoMod = await import('@capgo/capacitor-pedometer');
		Geolocation = geoMod.Geolocation;
		CapacitorPedometer = pedoMod.CapacitorPedometer;

		// Start GPS watcher for velocity gating
		gpsWatcherId = await Geolocation.watchPosition(
			{ enableHighAccuracy: true, timeout: 10_000 },
			(position, err) => {
				if (err || !position) return;
				lastGpsSpeed = position.coords.speed ?? 0;
				lastGpsTime = position.timestamp;
			}
		);

		await CapacitorPedometer.startMeasurementUpdates();
		emit({ status: 'Awaiting movement...' });

		pedometerListener = await CapacitorPedometer.addListener('measurement', (event) => {
			if (!event || typeof event.numberOfSteps !== 'number') return;

			const currentRaw = event.numberOfSteps;
			const currentTime = event.endDate || Date.now();

			// First event establishes the baseline
			if (initialSteps === null) {
				initialSteps = currentRaw;
				lastRawSteps = currentRaw;
				lastEventTime = currentTime;
				emit({ steps: 0, earned: 0, status: 'Tracking steps' });
				resetInactivity();
				return;
			}

			const stepsDiff = currentRaw - lastRawSteps;
			const timeDiffSec = (currentTime - lastEventTime) / 1000;

			if (stepsDiff > 0 && timeDiffSec > 0) {
				const rejection = validateBatch(stepsDiff, timeDiffSec);
				if (rejection === null) {
					validatedSteps += stepsDiff;
					totalTodaySteps += stepsDiff;
					saveTodaySteps(totalTodaySteps);
					emit({
						steps: validatedSteps,
						earned: Math.floor(validatedSteps / STEPS_PER_MINUTE),
						status: 'Tracking steps',
						anticheat: '',
					});
					resetInactivity();
				} else {
					emit({ anticheat: rejection });
				}
			}

			lastRawSteps = currentRaw;
			lastEventTime = currentTime;
		});
	}

	async function stop() {
		clearTimeout(inactivityTimer);
		if (pedometerListener) await pedometerListener.remove();
		if (gpsWatcherId !== null && Geolocation) {
			await Geolocation.clearWatch({ id: gpsWatcherId });
		}
		if (CapacitorPedometer) await CapacitorPedometer.stopMeasurementUpdates();
	}

	return { start, stop };
}

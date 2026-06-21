package com.example.walkify;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class WalkifyForegroundService extends Service implements SensorEventListener {
    private static final String TAG = "WalkifyForegroundService";
    private static final String CHANNEL_ID = "walkify_channel";
    private static final int NOTIFICATION_ID = 8888;

    private SensorManager sensorManager;
    private Sensor stepSensor;
    private int lastSensorSteps = -1;
    private long lastStepTimeMs = 0;

    private Handler handler = new Handler();
    private Runnable decrementRunnable = new Runnable() {
        @Override
        public void run() {
            try {
                SharedBlockerState state = SharedBlockerState.getInstance();
                if (state.isBlockingEnabled()) {
                    String fgApp = state.getCurrentForegroundPackage();
                    boolean isBlocked = state.getBlockedPackages().contains(fgApp);
                    
                    if (isBlocked) {
                        double minutes = state.getMinutes();
                        if (minutes > 0.0) {
                            // Decrement by 1 second in minutes (1.0 / 60.0)
                            minutes -= (1.0 / 60.0);
                            if (minutes < 0) {
                                minutes = 0.0;
                            }
                            state.setMinutes(minutes);
                            Log.d(TAG, "Blocked app in foreground: " + fgApp + ". Decremented minutes. Remaining: " + minutes);
                        }

                        // If minutes reached 0, launch our app with blocked screen
                        if (minutes <= 0.0) {
                            Intent launchIntent = new Intent(getApplicationContext(), MainActivity.class);
                            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            getApplicationContext().startActivity(launchIntent);
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in decrement runnable", e);
            }
            // Repeat every 1 second (1000ms)
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service onCreate");
        
        // Initialize SharedBlockerState with context
        SharedBlockerState.getInstance(this);

        // Setup step sensor
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            if (stepSensor != null) {
                sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI);
                Log.d(TAG, "Step sensor registered successfully");
            } else {
                Log.w(TAG, "No step counter sensor available");
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service onStartCommand");
        
        createNotificationChannel();
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            notificationIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Walkify Active")
            .setContentText("Tracking steps and protecting screen time.")
            .setSmallIcon(android.R.drawable.ic_menu_myplaces)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();

        startForeground(NOTIFICATION_ID, notification);

        // Start background decrement timer
        handler.removeCallbacks(decrementRunnable);
        handler.post(decrementRunnable);

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Service onDestroy");
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        handler.removeCallbacks(decrementRunnable);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "Walkify Tracking Service",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    // SensorEventListener methods
    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event == null || event.sensor.getType() != Sensor.TYPE_STEP_COUNTER) {
            return;
        }

        int sensorSteps = (int) event.values[0];
        Log.d(TAG, "Sensor step event received: " + sensorSteps);

        if (lastSensorSteps == -1) {
            lastSensorSteps = sensorSteps;
            lastStepTimeMs = System.currentTimeMillis();
            return;
        }

        int delta = sensorSteps - lastSensorSteps;
        if (delta <= 0) {
            return;
        }

        long currentTime = System.currentTimeMillis();
        long timeDiffMs = currentTime - lastStepTimeMs;

        // Apply basic cadence noise filtering
        // Standard normal cadence: 0.5 - 4.0 steps/sec
        // Or if time gap is long (meaning sensor batching or resume after pause), we allow it
        double stepsPerSec = (double) delta / (timeDiffMs / 1000.0);
        if (timeDiffMs > 6000 || (stepsPerSec >= 0.5 && stepsPerSec <= 4.0)) {
            SharedBlockerState state = SharedBlockerState.getInstance();
            int currentSteps = state.getSteps();
            int newSteps = currentSteps + delta;
            state.setSteps(newSteps);

            // 100 steps = 1 minute
            double minutesEarned = (double) delta / 100.0;
            double currentMins = state.getMinutes();
            state.setMinutes(currentMins + minutesEarned);

            Log.d(TAG, "Counted " + delta + " steps. Total Steps: " + newSteps + ". Earned: " + minutesEarned + " min. New balance: " + (currentMins + minutesEarned));
            
            lastSensorSteps = sensorSteps;
            lastStepTimeMs = currentTime;
        } else {
            Log.w(TAG, "Steps rejected due to cadence filter: " + stepsPerSec + " steps/sec");
            // Still sync baseline sensor steps to avoid stacking delta
            lastSensorSteps = sensorSteps;
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // No-op
    }
}

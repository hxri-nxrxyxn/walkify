package com.example.walkify;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.HashSet;
import java.util.Set;

public class SharedBlockerState {
    private static final String PREF_NAME = "WalkifyPrefs";
    private static final String KEY_MINUTES = "earnedMinutes";
    private static final String KEY_STEPS = "stepsCount";
    private static final String KEY_BLOCKED_APPS = "blockedApps";
    private static final String KEY_BLOCKING_ENABLED = "blockingEnabled";

    private static SharedBlockerState instance;
    private SharedPreferences prefs;
    private String currentForegroundPackage = "";

    private SharedBlockerState(Context context) {
        this.prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized SharedBlockerState getInstance(Context context) {
        if (instance == null) {
            instance = new SharedBlockerState(context);
        }
        return instance;
    }

    public static synchronized SharedBlockerState getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SharedBlockerState not initialized. Call getInstance(Context) first.");
        }
        return instance;
    }

    public synchronized double getMinutes() {
        return (double) prefs.getFloat(KEY_MINUTES, 0.0f);
    }

    public synchronized void setMinutes(double minutes) {
        prefs.edit().putFloat(KEY_MINUTES, (float) minutes).apply();
    }

    public synchronized int getSteps() {
        return prefs.getInt(KEY_STEPS, 0);
    }

    public synchronized void setSteps(int steps) {
        prefs.edit().putInt(KEY_STEPS, steps).apply();
    }

    public synchronized Set<String> getBlockedPackages() {
        return prefs.getStringSet(KEY_BLOCKED_APPS, new HashSet<String>());
    }

    public synchronized void setBlockedPackages(Set<String> blockedPackages) {
        prefs.edit().putStringSet(KEY_BLOCKED_APPS, blockedPackages).apply();
    }

    public synchronized boolean isBlockingEnabled() {
        return prefs.getBoolean(KEY_BLOCKING_ENABLED, false);
    }

    public synchronized void setBlockingEnabled(boolean enabled) {
        prefs.edit().putBoolean(KEY_BLOCKING_ENABLED, enabled).apply();
    }

    public synchronized String getCurrentForegroundPackage() {
        return currentForegroundPackage;
    }

    public synchronized void setCurrentForegroundPackage(String packageName) {
        this.currentForegroundPackage = packageName;
    }
}

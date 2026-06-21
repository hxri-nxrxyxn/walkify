package com.example.walkify;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class WalkifyAccessibilityService extends AccessibilityService {
    private static final String TAG = "WalkifyAccessibility";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            CharSequence packageNameSeq = event.getPackageName();
            if (packageNameSeq != null) {
                String packageName = packageNameSeq.toString();
                Log.d(TAG, "Opened app: " + packageName);
                
                try {
                    // Update foreground package name in shared state
                    SharedBlockerState state = SharedBlockerState.getInstance(this);
                    state.setCurrentForegroundPackage(packageName);
                    
                    if (state.isBlockingEnabled()) {
                        boolean isBlocked = state.getBlockedPackages().contains(packageName);
                        if (isBlocked) {
                            if (state.getMinutes() <= 0.0) {
                                OverlayManager.getInstance(this).showOverlay();
                            } else {
                                OverlayManager.getInstance(this).hideOverlay();
                            }
                        } else {
                            OverlayManager.getInstance(this).hideOverlay();
                        }
                    } else {
                        OverlayManager.getInstance(this).hideOverlay();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in accessibility event processing", e);
                }
            }
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service interrupted");
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "Service connected");
        SharedBlockerState.getInstance(this);
    }
}


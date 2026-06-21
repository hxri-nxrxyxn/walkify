package com.example.walkify;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.util.Log;

public class OverlayManager {
    private static final String TAG = "WalkifyOverlay";
    private static OverlayManager instance;
    private WindowManager windowManager;
    private View overlayView;
    private Context context;

    private OverlayManager(Context context) {
        this.context = context.getApplicationContext();
        this.windowManager = (WindowManager) this.context.getSystemService(Context.WINDOW_SERVICE);
    }

    public static synchronized OverlayManager getInstance(Context context) {
        if (instance == null) {
            instance = new OverlayManager(context);
        }
        return instance;
    }

    public synchronized void showOverlay() {
        if (overlayView != null) {
            return; // Already showing
        }

        // Verify overlay permission is granted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            Log.e(TAG, "Cannot show overlay: overlay permission not granted");
            return;
        }

        Log.d(TAG, "Showing overlay window");

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.CENTER;

        // Create overlay layout programmatically to keep things clean and zero-dependency
        LinearLayout layout = new LinearLayout(context);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.BLACK);
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(40, 40, 40, 40);

        TextView textView = new TextView(context);
        textView.setText("hey man, you can't open it, else go for a walk");
        textView.setTextColor(Color.WHITE);
        textView.setTextSize(24);
        textView.setGravity(Gravity.CENTER);
        
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        textParams.setMargins(0, 0, 0, 50);
        layout.addView(textView, textParams);

        Button button = new Button(context);
        button.setText("Go back to Walkify");
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Go to home screen
                Intent startMain = new Intent(Intent.ACTION_MAIN);
                startMain.addCategory(Intent.CATEGORY_HOME);
                startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(startMain);
                
                // Hide overlay
                hideOverlay();
            }
        });

        layout.addView(button);

        overlayView = layout;
        try {
            windowManager.addView(overlayView, params);
        } catch (Exception e) {
            Log.e(TAG, "Error adding window overlay", e);
            overlayView = null;
        }
    }

    public synchronized void hideOverlay() {
        if (overlayView != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception e) {
                Log.e(TAG, "Error removing window overlay", e);
            }
            overlayView = null;
        }
    }
}

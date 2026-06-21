package com.example.walkify;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "WalkifyPermissions")
public class WalkifyPermissionsPlugin extends Plugin {

    private static final int REQUEST_NOTIFICATION = 1001;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("usageStats", hasUsageStatsPermission());
        ret.put("overlay", hasOverlayPermission());
        ret.put("accessibility", hasAccessibilityPermission());
        ret.put("notifications", hasNotificationPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openOverlaySettings(PluginCall call) {
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + getContext().getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            String perm = android.Manifest.permission.POST_NOTIFICATIONS;
            if (getContext().checkSelfPermission(perm) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                if (getActivity() != null) {
                    getActivity().requestPermissions(new String[]{perm}, REQUEST_NOTIFICATION);
                }
            }
        }
        call.resolve();
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) {
            return false;
        }
        int mode;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mode = appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                getContext().getPackageName()
            );
        } else {
            mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                getContext().getPackageName()
            );
        }
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(getContext());
        }
        return true;
    }

    private boolean hasAccessibilityPermission() {
        String enabledServices = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        if (enabledServices == null) {
            return false;
        }
        return enabledServices.toLowerCase().contains(getContext().getPackageName().toLowerCase());
    }

    private boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return getContext().checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) ==
                android.content.pm.PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    @PluginMethod
    public void setBlockedApps(PluginCall call) {
        try {
            JSArray packages = call.getArray("packages");
            if (packages != null) {
                Set<String> packageSet = new HashSet<>();
                for (int i = 0; i < packages.length(); i++) {
                    packageSet.add(packages.getString(i));
                }
                SharedBlockerState.getInstance(getContext()).setBlockedPackages(packageSet);
                call.resolve();
            } else {
                call.reject("Missing packages array");
            }
        } catch (Exception e) {
            call.reject("Error setting blocked apps: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setBalance(PluginCall call) {
        try {
            Double minutes = call.getDouble("minutes");
            if (minutes != null) {
                SharedBlockerState.getInstance(getContext()).setMinutes(minutes);
                call.resolve();
            } else {
                call.reject("Missing minutes value");
            }
        } catch (Exception e) {
            call.reject("Error setting balance: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getBalance(PluginCall call) {
        try {
            SharedBlockerState state = SharedBlockerState.getInstance(getContext());
            JSObject ret = new JSObject();
            ret.put("minutes", state.getMinutes());
            ret.put("steps", state.getSteps());
            ret.put("foregroundPackage", state.getCurrentForegroundPackage());
            ret.put("blockingEnabled", state.isBlockingEnabled());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error getting balance: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startBlockingService(PluginCall call) {
        try {
            SharedBlockerState.getInstance(getContext()).setBlockingEnabled(true);
            Intent serviceIntent = new Intent(getContext(), WalkifyForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Error starting service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopBlockingService(PluginCall call) {
        try {
            SharedBlockerState.getInstance(getContext()).setBlockingEnabled(false);
            Intent serviceIntent = new Intent(getContext(), WalkifyForegroundService.class);
            getContext().stopService(serviceIntent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error stopping service: " + e.getMessage());
        }
    }
}

package com.example.walkify;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WalkifyPermissionsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

package com.waventura.aventuraretro1930;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    @PluginMethod
    public void getAppVersion(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            PackageInfo pInfo = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.1");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                ret.put("versionCode", pInfo.getLongVersionCode());
            } else {
                ret.put("versionCode", pInfo.versionCode);
            }
        } catch (Exception e) {
            ret.put("versionName", "1.0.1");
            ret.put("versionCode", 2);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        final String targetUrl = call.getString("url");
        if (targetUrl == null || targetUrl.isEmpty()) {
            call.reject("URL de actualización inválida");
            return;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("No se pudo abrir la descarga: " + e.getMessage());
        }
    }
}
